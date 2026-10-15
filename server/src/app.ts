import { createHash, randomBytes } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { isValidEvent, type ProgressEvent } from '../../shared/progress.ts';
import { DUMMY_HASH, findUser, verifyPassword, type Role } from './accounts.ts';
import type { Db } from './db.ts';
import { acceptInvite, createInvite, findPendingInvite, InviteError, listInvites, revokeInvite } from './invites.ts';

const COOKIE = 'mfb_session';
const SESSION_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_FAILS_EMAIL = 5;
// Mais folgado por IP: famílias atrás da mesma rede (ou o repasse da Vercel) não se bloqueiam entre si.
const MAX_FAILS_IP = 30;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const MAX_BATCH = 200;

interface Options {
  db: Db;
  secureCookie?: boolean;
  now?: () => number;
}

type Env = { Variables: { userId: number; email: string; role: Role } };

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function createApp({ db, secureCookie = true, now = Date.now }: Options) {
  const app = new Hono<Env>().basePath('/api');

  // ponytail: contador em memória, some ao reiniciar; mover para SQLite se houver mais de um processo.
  const fails = new Map<string, number[]>();
  const recentFails = (key: string) => (fails.get(key) ?? []).filter((t) => now() - t < FAIL_WINDOW_MS);
  const addFail = (key: string) => fails.set(key, [...recentFails(key), now()]);
  const blocked = (key: string) => recentFails(key).length >= (key.startsWith('ip:') ? MAX_FAILS_IP : MAX_FAILS_EMAIL);
  // ponytail: IP vem do primeiro X-Forwarded-For (Vercel → Caddy). Falsificável; o limite por e-mail é o que protege de verdade.
  const clientIp = (c: Context) => c.req.header('x-forwarded-for')?.split(',')[0].trim() || 'desconhecido';

  const setSession = (c: Context, token: string) =>
    setCookie(c, COOKIE, token, { httpOnly: true, secure: secureCookie, sameSite: 'Lax', path: '/', maxAge: SESSION_MS / 1000 });

  const startSession = (c: Context, userId: number) => {
    const token = randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), userId, now() + SESSION_MS);
    setSession(c, token);
  };

  app.get('/health', (c) => c.json({ ok: true }));

  app.post('/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const keys = [`e:${email}`, `ip:${clientIp(c)}`];
    if (keys.some(blocked)) return c.json({ error: 'rate_limited' }, 429);

    const user = email ? findUser(db, email) : undefined;
    const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH) && user?.status === 'active';
    if (!ok || !user) {
      keys.forEach(addFail);
      return c.json({ error: 'invalid' }, 401);
    }
    keys.forEach((k) => fails.delete(k));
    startSession(c, user.id);
    return c.json({ email: user.email, role: user.role });
  });

  // Links de acesso (públicos: quem tem o link ainda não tem sessão). Token inválido conta como falha por IP.
  app.post('/invites/check', async (c) => {
    const ip = `ip:${clientIp(c)}`;
    if (blocked(ip)) return c.json({ error: 'rate_limited' }, 429);
    const body = await c.req.json().catch(() => ({}));
    const row = findPendingInvite(db, body.token, now());
    if (!row) {
      addFail(ip);
      return c.json({ error: 'invalid_invite' }, 404);
    }
    return c.json({ email: row.email, kind: row.kind });
  });

  app.post('/invites/accept', async (c) => {
    const ip = `ip:${clientIp(c)}`;
    if (blocked(ip)) return c.json({ error: 'rate_limited' }, 429);
    const body = await c.req.json().catch(() => ({}));
    try {
      // Só token e senha são lidos: papel nunca vem do pedido; a conta nasce como família.
      const { userId, email } = acceptInvite(db, body.token, body.password, now());
      startSession(c, userId);
      return c.json({ email, role: 'family' });
    } catch (err) {
      if (!(err instanceof InviteError)) throw err;
      if (err.code === 'invalid_invite') addFail(ip);
      return c.json({ error: err.code }, err.code === 'invalid_invite' ? 404 : 400);
    }
  });

  app.post('/logout', (c) => {
    const token = getCookie(c, COOKIE);
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    deleteCookie(c, COOKIE, { path: '/' });
    return c.body(null, 204);
  });

  // Tudo abaixo exige sessão válida de conta ativa. A validade desliza a cada uso.
  app.use('*', async (c, next) => {
    const token = getCookie(c, COOKIE);
    const row = token
      ? (db.prepare(`SELECT s.user_id, s.expires_at, u.email, u.status, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`)
          .get(sha256(token)) as { user_id: number; expires_at: number; email: string; status: string; role: Role } | undefined)
      : undefined;
    if (!token || !row || row.expires_at < now() || row.status !== 'active') {
      if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
      deleteCookie(c, COOKIE, { path: '/' });
      return c.json({ error: 'unauthorized' }, 401);
    }
    db.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').run(now() + SESSION_MS, sha256(token));
    setSession(c, token);
    c.set('userId', row.user_id);
    c.set('email', row.email);
    // Papel lido do banco a cada pedido: tirar o admin vale na hora, sem depender do cookie.
    c.set('role', row.role);
    await next();
  });

  app.get('/me', (c) => c.json({ email: c.get('email'), role: c.get('role') }));

  // Administração: só contas com papel admin.
  app.use('/admin/*', async (c, next) => {
    if (c.get('role') !== 'admin') return c.json({ error: 'forbidden' }, 403);
    await next();
  });

  app.get('/admin/invites', (c) => c.json({ invites: listInvites(db, now()) }));

  app.post('/admin/invites', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    try {
      return c.json(createInvite(db, c.get('userId'), typeof body.email === 'string' ? body.email : '', now()), 201);
    } catch (err) {
      if (err instanceof InviteError) return c.json({ error: err.code }, 400);
      throw err;
    }
  });

  app.delete('/admin/invites/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || !revokeInvite(db, id, now())) return c.json({ error: 'not_pending' }, 404);
    return c.body(null, 204);
  });

  app.get('/admin/users', (c) => {
    const users = db.prepare(`SELECT u.email, u.role, u.status, u.created_at AS createdAt, MAX(e.at) AS lastActivity
      FROM users u LEFT JOIN progress_events e ON e.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`).all();
    return c.json({ users });
  });

  app.get('/progress', (c) => {
    const rows = db
      .prepare('SELECT id, type, mission_id, attempt_id, at, data FROM progress_events WHERE user_id = ? ORDER BY at')
      .all(c.get('userId')) as { id: string; type: string; mission_id: string | null; attempt_id: string | null; at: number; data: string | null }[];
    const events = rows.map((r) => ({
      id: r.id, type: r.type, missionId: r.mission_id, attemptId: r.attempt_id, at: r.at,
      ...(r.data ? { data: JSON.parse(r.data) } : {}),
    }));
    return c.json({ events });
  });

  app.post('/progress/events', async (c) => {
    const body = await c.req.json().catch(() => null);
    const events: unknown[] = Array.isArray(body?.events) ? body.events : [];
    if (events.length === 0 || events.length > MAX_BATCH || !events.every(isValidEvent)) return c.json({ error: 'invalid_events' }, 400);
    // Mesmo id de outra conta é ignorado pelo PRIMARY KEY: nunca sobrescreve nem vaza.
    const insert = db.prepare(
      'INSERT OR IGNORE INTO progress_events (id, user_id, type, mission_id, attempt_id, at, received_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    const userId = c.get('userId');
    db.exec('BEGIN');
    try {
      for (const e of events as ProgressEvent[]) insert.run(e.id, userId, e.type, e.missionId, e.attemptId, e.at, now(), e.data ? JSON.stringify(e.data) : null);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    return c.json({ accepted: events.length });
  });

  app.delete('/progress', (c) => {
    db.prepare('DELETE FROM progress_events WHERE user_id = ?').run(c.get('userId'));
    return c.body(null, 204);
  });

  return app;
}
