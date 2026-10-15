import { beforeEach, describe, expect, it } from 'vitest';
import { createAccount, findUser, setRole } from './accounts.ts';
import { createApp } from './app.ts';
import { openDb, type Db } from './db.ts';
import { INVITE_MS } from './invites.ts';

let db: Db;
let clock: number;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = openDb(':memory:');
  clock = 1_000_000;
  app = createApp({ db, now: () => clock });
  createAccount(db, 'admin@mfb.com', 'senha-do-admin');
  setRole(db, 'admin@mfb.com', 'admin');
  createAccount(db, 'ana@exemplo.com', 'senha-da-ana');
});

const req = (method: string, body?: unknown, cookie?: string, ip = '1.1.1.1') => ({
  method,
  headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...(cookie ? { cookie } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const cookieOf = (res: Response) => res.headers.get('set-cookie')?.split(';')[0];
const login = async (email: string, password: string) => cookieOf(await app.request('/api/login', req('POST', { email, password })))!;
const invite = async (cookie: string, email: string) => app.request('/api/admin/invites', req('POST', { email }, cookie));

describe('papéis', () => {
  it('conta nova é família; /me e o login informam o papel', async () => {
    expect(findUser(db, 'ana@exemplo.com')!.role).toBe('family');
    const res = await app.request('/api/login', req('POST', { email: 'admin@mfb.com', password: 'senha-do-admin' }));
    expect(await res.json()).toEqual({ email: 'admin@mfb.com', role: 'admin' });
    const me = await app.request('/api/me', req('GET', undefined, cookieOf(res)));
    expect(await me.json()).toEqual({ email: 'admin@mfb.com', role: 'admin' });
  });

  it('o banco recusa papel fora da lista', () => {
    expect(() => db.prepare("UPDATE users SET role = 'root' WHERE email = 'ana@exemplo.com'").run()).toThrow();
    expect(() => setRole(db, 'ana@exemplo.com', 'root' as never)).toThrow('papel');
  });

  it('família e visitante não acessam a administração', async () => {
    const ana = await login('ana@exemplo.com', 'senha-da-ana');
    expect((await invite(ana, 'novo@exemplo.com')).status).toBe(403);
    expect((await app.request('/api/admin/invites', req('GET', undefined, ana))).status).toBe(403);
    expect((await app.request('/api/admin/users', req('GET', undefined, ana))).status).toBe(403);
    expect((await app.request('/api/admin/invites', req('GET'))).status).toBe(401);
  });

  it('tirar o admin vale na hora, sem novo login', async () => {
    const admin = await login('admin@mfb.com', 'senha-do-admin');
    expect((await app.request('/api/admin/users', req('GET', undefined, admin))).status).toBe(200);
    setRole(db, 'admin@mfb.com', 'family');
    expect((await app.request('/api/admin/users', req('GET', undefined, admin))).status).toBe(403);
  });
});

describe('links de acesso', () => {
  it('convite cria conta de família, entra e só vale uma vez', async () => {
    const admin = await login('admin@mfb.com', 'senha-do-admin');
    const res = await invite(admin, ' Novo@Exemplo.com ');
    expect(res.status).toBe(201);
    const { token, email, kind } = await res.json();
    expect({ email, kind }).toEqual({ email: 'novo@exemplo.com', kind: 'invite' });
    // O banco guarda só o hash.
    expect(JSON.stringify(db.prepare('SELECT * FROM invites').all())).not.toContain(token);

    expect(await (await app.request('/api/invites/check', req('POST', { token }))).json()).toEqual({ email: 'novo@exemplo.com', kind: 'invite' });
    // Pedir papel no corpo não muda nada.
    const ok = await app.request('/api/invites/accept', req('POST', { token, password: 'senha-nova-1', role: 'admin' }));
    expect(await ok.json()).toEqual({ email: 'novo@exemplo.com', role: 'family' });
    expect(findUser(db, 'novo@exemplo.com')!.role).toBe('family');
    expect((await app.request('/api/me', req('GET', undefined, cookieOf(ok)))).status).toBe(200);

    expect((await app.request('/api/invites/accept', req('POST', { token, password: 'outra-senha-2' }))).status).toBe(404);
    expect((await app.request('/api/login', req('POST', { email: 'novo@exemplo.com', password: 'senha-nova-1' }))).status).toBe(200);
  });

  it('link expira em 7 dias, pode ser cancelado e um link novo cancela o anterior', async () => {
    const admin = await login('admin@mfb.com', 'senha-do-admin');
    const a = await (await invite(admin, 'x@exemplo.com')).json();
    const b = await (await invite(admin, 'x@exemplo.com')).json();
    expect((await app.request('/api/invites/check', req('POST', { token: a.token }))).status).toBe(404);
    expect((await app.request('/api/invites/check', req('POST', { token: b.token }))).status).toBe(200);

    clock += INVITE_MS;
    expect((await app.request('/api/invites/accept', req('POST', { token: b.token, password: 'senha-nova-1' }))).status).toBe(404);

    const c = await (await invite(admin, 'y@exemplo.com')).json();
    const { invites } = await (await app.request('/api/admin/invites', req('GET', undefined, admin))).json();
    const id = invites.find((i: { email: string }) => i.email === 'y@exemplo.com').id;
    expect((await app.request(`/api/admin/invites/${id}`, req('DELETE', undefined, admin))).status).toBe(204);
    expect((await app.request('/api/invites/check', req('POST', { token: c.token }))).status).toBe(404);
    expect(invites.map((i: { status: string }) => i.status).sort()).toEqual(['expired', 'pending', 'revoked']);
  });

  it('link para conta de família existente troca a senha e encerra as sessões', async () => {
    const admin = await login('admin@mfb.com', 'senha-do-admin');
    const ana = await login('ana@exemplo.com', 'senha-da-ana');
    const { token, kind } = await (await invite(admin, 'ana@exemplo.com')).json();
    expect(kind).toBe('reset');
    expect((await app.request('/api/invites/accept', req('POST', { token, password: 'senha-nova-da-ana' }))).status).toBe(200);
    expect((await app.request('/api/me', req('GET', undefined, ana))).status).toBe(401);
    expect((await app.request('/api/login', req('POST', { email: 'ana@exemplo.com', password: 'senha-nova-da-ana' }))).status).toBe(200);
  });

  it('não gera link para conta admin nem para e-mail inválido; senha curta é recusada', async () => {
    const admin = await login('admin@mfb.com', 'senha-do-admin');
    expect(await (await invite(admin, 'admin@mfb.com')).json()).toEqual({ error: 'admin_account' });
    expect(await (await invite(admin, 'sem-arroba')).json()).toEqual({ error: 'invalid_email' });
    const { token } = await (await invite(admin, 'z@exemplo.com')).json();
    expect(await (await app.request('/api/invites/accept', req('POST', { token, password: 'curta' }))).json()).toEqual({ error: 'weak_password' });
    // A tentativa com senha curta não gasta o link.
    expect((await app.request('/api/invites/accept', req('POST', { token, password: 'senha-boa-1' }))).status).toBe(200);
  });

  it('tokens inválidos em sequência bloqueiam o IP', async () => {
    for (let i = 0; i < 30; i++) await app.request('/api/invites/check', req('POST', { token: `x${i}`.padEnd(43, 'a') }, undefined, '9.9.9.9'));
    expect((await app.request('/api/invites/check', req('POST', { token: 'a'.repeat(43) }, undefined, '9.9.9.9'))).status).toBe(429);
  });
});
