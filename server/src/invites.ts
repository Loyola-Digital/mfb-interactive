// Links de acesso criados por um admin: convite (conta nova) ou nova senha (conta de família existente).
// O token só existe no link; o banco guarda o SHA-256. Cada link vale uma vez, por 7 dias, e pode ser cancelado.
import { createHash, randomBytes } from 'node:crypto';
import { createAccount, findUser, isValidEmail, MIN_PASSWORD, normalizeEmail, setPassword } from './accounts.ts';
import type { Db } from './db.ts';

export const INVITE_MS = 7 * 24 * 60 * 60 * 1000;

export type InviteKind = 'invite' | 'reset';
export type InviteStatus = 'pending' | 'used' | 'expired' | 'revoked';

export type InviteErrorCode = 'invalid_email' | 'admin_account' | 'invalid_invite' | 'weak_password' | 'account_exists';

export class InviteError extends Error {
  code: InviteErrorCode;
  constructor(code: InviteErrorCode) {
    super(code);
    this.code = code;
  }
}

interface Row {
  id: number;
  email: string;
  kind: InviteKind;
  created_at: number;
  expires_at: number;
  used_at: number | null;
  revoked_at: number | null;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function statusOf(r: Row, now: number): InviteStatus {
  if (r.used_at) return 'used';
  if (r.revoked_at) return 'revoked';
  return r.expires_at <= now ? 'expired' : 'pending';
}

/** Cria o link. Um link novo para o mesmo e-mail cancela os pendentes anteriores. */
export function createInvite(db: Db, adminId: number, rawEmail: string, now: number) {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) throw new InviteError('invalid_email');
  const user = findUser(db, email);
  // Conta admin não recebe link: quem tem admin só troca a senha pelo comando na VPS.
  if (user?.role === 'admin') throw new InviteError('admin_account');
  const kind: InviteKind = user ? 'reset' : 'invite';
  const token = randomBytes(32).toString('base64url');
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE invites SET revoked_at = ? WHERE email = ? AND used_at IS NULL AND revoked_at IS NULL').run(now, email);
    db.prepare('INSERT INTO invites (token_hash, email, kind, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(sha256(token), email, kind, adminId, now, now + INVITE_MS);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return { token, email, kind, expiresAt: now + INVITE_MS };
}

/** Link ainda utilizável, ou undefined. */
export function findPendingInvite(db: Db, token: string, now: number): Row | undefined {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return undefined;
  const row = db.prepare('SELECT id, email, kind, created_at, expires_at, used_at, revoked_at FROM invites WHERE token_hash = ?').get(sha256(token)) as Row | undefined;
  return row && statusOf(row, now) === 'pending' ? row : undefined;
}

/** Usa o link: cria a conta (convite) ou troca a senha (nova senha). Devolve o id da conta. */
export function acceptInvite(db: Db, token: string, password: string, now: number): { userId: number; email: string } {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) throw new InviteError('weak_password');
  db.exec('BEGIN');
  try {
    const row = findPendingInvite(db, token, now);
    if (!row) throw new InviteError('invalid_invite');
    const user = findUser(db, row.email);
    let userId: number;
    if (row.kind === 'invite') {
      if (user) throw new InviteError('account_exists');
      userId = createAccount(db, row.email, password);
    } else {
      // Entre a criação do link e o uso, a conta pode ter virado admin ou sumido.
      if (!user || user.role !== 'family') throw new InviteError('invalid_invite');
      setPassword(db, row.email, password);
      userId = user.id;
    }
    db.prepare('UPDATE invites SET used_at = ? WHERE id = ?').run(now, row.id);
    db.exec('COMMIT');
    return { userId, email: row.email };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function listInvites(db: Db, now: number, limit = 100) {
  const rows = db.prepare('SELECT id, email, kind, created_at, expires_at, used_at, revoked_at FROM invites ORDER BY created_at DESC LIMIT ?').all(limit) as unknown as Row[];
  return rows.map((r) => ({ id: r.id, email: r.email, kind: r.kind, createdAt: r.created_at, expiresAt: r.expires_at, usedAt: r.used_at, status: statusOf(r, now) }));
}

/** Cancela um link pendente; devolve false se ele já não estava pendente. */
export function revokeInvite(db: Db, id: number, now: number): boolean {
  const r = db.prepare('UPDATE invites SET revoked_at = ? WHERE id = ? AND used_at IS NULL AND revoked_at IS NULL AND expires_at > ?').run(now, id, now);
  return Number(r.changes) > 0;
}
