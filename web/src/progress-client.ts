// Progresso no front: estado exibido = eventos confirmados pelo servidor + fila local ainda não enviada.
import { aggregate, uuid, type EventType, type Progress, type ProgressEvent } from '../../shared/progress.ts';
import { ApiError, OfflineError, type Api } from './api.ts';
import type { SafeStorage } from './storage.ts';

const OUTBOX = 'mfb.outbox.v1';
const CACHE = 'mfb.cache.v1';

interface Cache {
  email: string;
  events: ProgressEvent[];
}

type ProgressApi = Pick<Api, 'getEvents' | 'postEvents' | 'deleteProgress'>;

export function createProgressClient(opts: { api: ProgressApi; storage: SafeStorage; onUnauthorized: () => void; onChange?: () => void }) {
  const { api, storage, onUnauthorized } = opts;
  let cache: Cache = storage.get<Cache>(CACHE) ?? { email: '', events: [] };
  let outbox: ProgressEvent[] = storage.get<ProgressEvent[]>(OUTBOX) ?? [];
  let syncing: Promise<void> | null = null;
  let again = false;
  const changed = () => opts.onChange?.();

  const saveOutbox = () => storage.set(OUTBOX, outbox);
  const saveCache = () => storage.set(CACHE, cache);

  function handleError(err: unknown): void {
    if (err instanceof ApiError && err.status === 401) onUnauthorized();
    else if (!(err instanceof OfflineError)) console.error(err);
  }

  async function pushOutbox(): Promise<void> {
    while (outbox.length > 0) {
      const batch = outbox.slice(0, 200);
      await api.postEvents(batch);
      const sent = new Set(batch.map((e) => e.id));
      outbox = outbox.filter((e) => !sent.has(e.id));
      cache.events = [...cache.events.filter((e) => !sent.has(e.id)), ...batch];
      saveOutbox();
      saveCache();
      changed();
    }
  }

  const client = {
    /** Troca de conta neste aparelho: descarta dados de outra conta. */
    useAccount(email: string) {
      if (cache.email === email) return;
      cache = { email, events: [] };
      outbox = [];
      saveCache();
      saveOutbox();
      changed();
    },

    get state(): Progress {
      return aggregate([...cache.events, ...outbox]);
    },

    get pending(): number {
      return outbox.length;
    },

    get persistent(): boolean {
      return storage.persistent;
    },

    record(type: EventType, missionId: string | null = null, attemptId: string | null = null): ProgressEvent {
      const event: ProgressEvent = { id: uuid(), type, missionId, attemptId, at: Date.now() };
      outbox = [...outbox, event];
      saveOutbox();
      changed();
      void client.sync();
      return event;
    },

    /** Envia a fila e depois busca o log completo da conta. Nunca lança. */
    sync(): Promise<void> {
      if (syncing) {
        again = true; // algo mudou durante o envio: roda de novo ao terminar
        return syncing;
      }
      syncing = (async () => {
        let ok = false;
        try {
          await pushOutbox();
          const events = await api.getEvents();
          cache = { ...cache, events };
          saveCache();
          changed();
          ok = true;
        } catch (err) {
          handleError(err);
        } finally {
          syncing = null;
        }
        if (ok && again) {
          again = false;
          await client.sync();
        }
        again = false;
      })();
      return syncing;
    },

    /** Apaga no servidor e neste aparelho. Precisa de internet; devolve false se não conseguiu. */
    async clearAll(): Promise<boolean> {
      try {
        await api.deleteProgress();
      } catch (err) {
        handleError(err);
        return false;
      }
      cache = { ...cache, events: [] };
      outbox = [];
      saveCache();
      saveOutbox();
      changed();
      return true;
    },

    /** Ao sair da conta: esquece tudo deste aparelho. */
    forget() {
      cache = { email: '', events: [] };
      outbox = [];
      storage.remove(CACHE);
      storage.remove(OUTBOX);
      changed();
    },
  };
  return client;
}

export type ProgressClient = ReturnType<typeof createProgressClient>;
