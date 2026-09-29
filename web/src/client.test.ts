import { describe, expect, it, vi } from 'vitest';
import type { ProgressEvent } from '../../shared/progress.ts';
import { ApiError, OfflineError } from './api.ts';
import { loadMissions } from './content-loader.ts';
import { createProgressClient } from './progress-client.ts';
import { safeStorage } from './storage.ts';

class MemoryStorage implements Storage {
  data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(k: string) { return this.data.get(k) ?? null; }
  key(i: number) { return [...this.data.keys()][i] ?? null; }
  removeItem(k: string) { this.data.delete(k); }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

class BrokenStorage extends MemoryStorage {
  getItem(): string | null { throw new DOMException('bloqueado', 'SecurityError'); }
  setItem(): void { throw new DOMException('bloqueado', 'SecurityError'); }
}

/** Servidor falso: guarda eventos por id; `online` controla se responde. */
function fakeServer() {
  const events = new Map<string, ProgressEvent>();
  const server = {
    online: true,
    status: 200,
    events,
    api: {
      getEvents: vi.fn(async () => {
        if (!server.online) throw new OfflineError();
        if (server.status === 401) throw new ApiError(401, 'unauthorized');
        return [...events.values()];
      }),
      postEvents: vi.fn(async (batch: ProgressEvent[]) => {
        if (!server.online) throw new OfflineError();
        if (server.status === 401) throw new ApiError(401, 'unauthorized');
        batch.forEach((e) => events.set(e.id, e));
        return { accepted: batch.length };
      }),
      deleteProgress: vi.fn(async () => {
        if (!server.online) throw new OfflineError();
        events.clear();
        return null;
      }),
    },
  };
  return server;
}

function setup(storage: Storage | null = new MemoryStorage()) {
  const server = fakeServer();
  const onUnauthorized = vi.fn();
  const make = () => createProgressClient({ api: server.api, storage: safeStorage(storage), onUnauthorized });
  const client = make();
  client.useAccount('ana@exemplo.com');
  return { server, client, onUnauthorized, make };
}

describe('cliente de progresso', () => {
  it('com internet, concluir chega ao servidor e aparece no estado', async () => {
    const { server, client } = setup();
    client.record('started', 'M03', 'tent-0001');
    client.record('completed', 'M03', 'tent-0001');
    await client.sync();
    expect(server.events.size).toBe(2);
    expect(client.pending).toBe(0);
    expect(client.state.missions.M03.completed).toBe(true);
  });

  it('servidor fora do ar: jogo segue, fica pendente e sincroniza quando volta', async () => {
    const { server, client } = setup();
    server.online = false;
    client.record('started', 'M03', 'tent-0001');
    client.record('completed', 'M03', 'tent-0001');
    await client.sync();
    expect(client.state.missions.M03.completed).toBe(true);
    expect(client.pending).toBe(2);
    expect(server.events.size).toBe(0);

    server.online = true;
    await client.sync();
    expect(client.pending).toBe(0);
    expect(server.events.size).toBe(2);
  });

  it('pendências sobrevivem ao recarregar a página', async () => {
    const storage = new MemoryStorage();
    const { server, client, make } = setup(storage);
    server.online = false;
    client.record('completed', 'M03', 'tent-0001');
    await client.sync();
    const recarregado = make();
    expect(recarregado.pending).toBe(1);
    expect(recarregado.state.missions.M03.completed).toBe(true);
  });

  it('armazenamento bloqueado: funciona em memória e salva direto no servidor', async () => {
    const { server, client } = setup(new BrokenStorage());
    expect(client.persistent).toBe(false);
    client.record('completed', 'M03', 'tent-0001');
    await client.sync();
    expect(server.events.size).toBe(1);
    expect(client.state.missions.M03.completed).toBe(true);
  });

  it('dado corrompido no aparelho começa vazio sem travar', () => {
    const storage = new MemoryStorage();
    storage.setItem('mfb.outbox.v1', '{isso não é json');
    const client = createProgressClient({ api: fakeServer().api, storage: safeStorage(storage), onUnauthorized: () => {} });
    expect(client.pending).toBe(0);
  });

  it('resposta 401 encerra a sessão local', async () => {
    const { server, client, onUnauthorized } = setup();
    server.status = 401;
    client.record('started', 'M03', 'tent-0001');
    await client.sync();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('trocar de conta descarta dados da conta anterior', async () => {
    const { server, client } = setup();
    server.online = false;
    client.record('completed', 'M03', 'tent-0001');
    client.useAccount('bia@exemplo.com');
    expect(client.pending).toBe(0);
    expect(client.state.missions).toEqual({});
  });

  it('apagar precisa de internet e limpa servidor e aparelho', async () => {
    const { server, client } = setup();
    client.record('completed', 'M03', 'tent-0001');
    await client.sync();
    server.online = false;
    expect(await client.clearAll()).toBe(false);
    expect(client.state.missions.M03.completed).toBe(true);
    server.online = true;
    expect(await client.clearAll()).toBe(true);
    expect(server.events.size).toBe(0);
    expect(client.state.missions).toEqual({});
  });

  it('registro feito durante um envio também é enviado', async () => {
    const { server, client } = setup();
    client.record('started', 'M03', 'tent-0001');
    client.record('help', 'M03', 'tent-0001');
    await client.sync();
    await client.sync();
    expect(server.events.size).toBe(2);
    expect(client.pending).toBe(0);
  });
});

describe('carregador de conteúdo', () => {
  it('fetch falhando e JSON inválido viram erro, não exceção', async () => {
    const semRede = (async () => { throw new TypeError('Failed to fetch'); }) as unknown as typeof fetch;
    expect((await loadMissions(semRede)).ok).toBe(false);
    const invalido = (async () => new Response('{"missions": [{"id": "X"}]}')) as unknown as typeof fetch;
    expect((await loadMissions(invalido)).ok).toBe(false);
    const erro404 = (async () => new Response('', { status: 404 })) as unknown as typeof fetch;
    expect(await loadMissions(erro404)).toEqual({ ok: false, error: 'HTTP 404' });
  });
});
