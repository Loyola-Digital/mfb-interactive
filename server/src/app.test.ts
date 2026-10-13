import { beforeEach, describe, expect, it } from 'vitest';
import { uuid } from '../../shared/progress.ts';
import { createAccount, disableAccount, setPassword } from './accounts.ts';
import { createApp } from './app.ts';
import { openDb, type Db } from './db.ts';

let db: Db;
let clock: number;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = openDb(':memory:');
  clock = 1_000_000;
  app = createApp({ db, now: () => clock });
  createAccount(db, 'ana@exemplo.com', 'senha-da-ana');
  createAccount(db, 'bia@exemplo.com', 'senha-da-bia');
});

const json = (body: unknown, cookie?: string, ip = '1.1.1.1') => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...(cookie ? { cookie } : {}) },
  body: JSON.stringify(body),
});

async function login(email: string, password: string, ip?: string) {
  const res = await app.request('/api/login', json({ email, password }, undefined, ip));
  const cookie = res.headers.get('set-cookie')?.split(';')[0];
  return { res, cookie };
}

const event = (type = 'started', extra = {}) => ({ id: uuid(), type, missionId: 'M03', attemptId: uuid(), at: clock, ...extra });

describe('login', () => {
  it('login correto cria sessão com cookie HttpOnly, Secure e SameSite=Lax', async () => {
    const { res, cookie } = await login('  Ana@Exemplo.com ', 'senha-da-ana');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'ana@exemplo.com' });
    const header = res.headers.get('set-cookie')!;
    expect(header).toMatch(/HttpOnly/);
    expect(header).toMatch(/Secure/);
    expect(header).toMatch(/SameSite=Lax/);
    const me = await app.request('/api/me', { headers: { cookie: cookie! } });
    expect(await me.json()).toEqual({ email: 'ana@exemplo.com' });
  });

  it('senha errada, e-mail inexistente e conta desativada dão a mesma resposta', async () => {
    disableAccount(db, 'bia@exemplo.com');
    const respostas = await Promise.all([
      login('ana@exemplo.com', 'errada-123', '2.2.2.2'),
      login('ninguem@exemplo.com', 'qualquer-1', '3.3.3.3'),
      login('bia@exemplo.com', 'senha-da-bia', '4.4.4.4'),
    ]);
    for (const { res, cookie } of respostas) {
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'invalid' });
      expect(cookie).toBeUndefined();
    }
  });

  it('a sexta tentativa em 15 minutos é recusada mesmo com a senha certa, e libera depois', async () => {
    for (let i = 0; i < 5; i++) expect((await login('ana@exemplo.com', 'errada-123', `9.9.9.${i}`)).res.status).toBe(401);
    expect((await login('ana@exemplo.com', 'senha-da-ana', '8.8.8.8')).res.status).toBe(429);
    clock += 15 * 60 * 1000 + 1;
    expect((await login('ana@exemplo.com', 'senha-da-ana', '8.8.8.8')).res.status).toBe(200);
  });

  it('limite também vale por IP, para e-mails diferentes', async () => {
    for (let i = 0; i < 29; i++) await login(`x${i}@exemplo.com`, 'errada-123', '7.7.7.7');
    expect((await login('ana@exemplo.com', 'senha-da-ana', '7.7.7.7')).res.status).toBe(200);
    for (let i = 0; i < 30; i++) await login(`y${i}@exemplo.com`, 'errada-123', '7.7.7.7');
    expect((await login('ana@exemplo.com', 'senha-da-ana', '7.7.7.7')).res.status).toBe(429);
  }, 30_000); // ~60 hashes scrypt: lento em máquina carregada
});

describe('sessão', () => {
  it('logout invalida a sessão no servidor', async () => {
    const { cookie } = await login('ana@exemplo.com', 'senha-da-ana');
    expect((await app.request('/api/logout', json({}, cookie))).status).toBe(204);
    expect((await app.request('/api/me', { headers: { cookie: cookie! } })).status).toBe(401);
  });

  it('sessão expira após 90 dias sem uso e desliza com o uso', async () => {
    const { cookie } = await login('ana@exemplo.com', 'senha-da-ana');
    clock += 80 * 86_400_000;
    expect((await app.request('/api/me', { headers: { cookie: cookie! } })).status).toBe(200);
    clock += 80 * 86_400_000;
    expect((await app.request('/api/me', { headers: { cookie: cookie! } })).status).toBe(200);
    clock += 91 * 86_400_000;
    expect((await app.request('/api/me', { headers: { cookie: cookie! } })).status).toBe(401);
  });

  it('desativar a conta ou redefinir a senha encerra sessões abertas', async () => {
    const a = await login('ana@exemplo.com', 'senha-da-ana');
    const b = await login('bia@exemplo.com', 'senha-da-bia');
    disableAccount(db, 'ana@exemplo.com');
    setPassword(db, 'bia@exemplo.com', 'nova-senha-bia');
    expect((await app.request('/api/me', { headers: { cookie: a.cookie! } })).status).toBe(401);
    expect((await app.request('/api/me', { headers: { cookie: b.cookie! } })).status).toBe(401);
    expect((await login('bia@exemplo.com', 'senha-da-bia', '5.5.5.5')).res.status).toBe(401);
    expect((await login('bia@exemplo.com', 'nova-senha-bia', '5.5.5.6')).res.status).toBe(200);
  });
});

describe('progresso', () => {
  it('sem sessão responde não autorizado e não grava', async () => {
    expect((await app.request('/api/progress')).status).toBe(401);
    expect((await app.request('/api/progress/events', json({ events: [event()] }))).status).toBe(401);
    expect(db.prepare('SELECT COUNT(*) n FROM progress_events').get()).toEqual({ n: 0 });
  });

  it('lote reenviado não duplica', async () => {
    const { cookie } = await login('ana@exemplo.com', 'senha-da-ana');
    const lote = { events: [event('started'), event('completed')] };
    await app.request('/api/progress/events', json(lote, cookie));
    await app.request('/api/progress/events', json(lote, cookie));
    const res = await app.request('/api/progress', { headers: { cookie: cookie! } });
    expect((await res.json()).events).toHaveLength(2);
  });

  it('recusa lote com evento malformado sem gravar nada', async () => {
    const { cookie } = await login('ana@exemplo.com', 'senha-da-ana');
    const res = await app.request('/api/progress/events', json({ events: [event(), { ...event(), type: 'hack' }] }, cookie));
    expect(res.status).toBe(400);
    expect(db.prepare('SELECT COUNT(*) n FROM progress_events').get()).toEqual({ n: 0 });
  });

  it('conta A não vê eventos da conta B e apagar remove só os da própria conta', async () => {
    const a = await login('ana@exemplo.com', 'senha-da-ana');
    const b = await login('bia@exemplo.com', 'senha-da-bia');
    const eventoDaBia = event('completed');
    await app.request('/api/progress/events', json({ events: [event('started')] }, a.cookie));
    await app.request('/api/progress/events', json({ events: [eventoDaBia] }, b.cookie));
    // Reenviar o id da Bia pela conta da Ana não copia nem sobrescreve.
    await app.request('/api/progress/events', json({ events: [eventoDaBia] }, a.cookie));

    const daAna = (await (await app.request('/api/progress', { headers: { cookie: a.cookie! } })).json()).events;
    expect(daAna.map((e: { type: string }) => e.type)).toEqual(['started']);

    expect((await app.request('/api/progress', { method: 'DELETE', headers: { cookie: a.cookie! } })).status).toBe(204);
    expect((await (await app.request('/api/progress', { headers: { cookie: a.cookie! } })).json()).events).toEqual([]);
    expect((await (await app.request('/api/progress', { headers: { cookie: b.cookie! } })).json()).events).toHaveLength(1);
  });
});
