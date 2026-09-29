// localStorage que nunca lança: se o navegador bloquear, passa a guardar em memória e avisa via `persistent`.
export interface SafeStorage {
  get<T>(key: string): T | null;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  readonly persistent: boolean;
}

export function safeStorage(backing: Storage | null = globalThis.localStorage ?? null): SafeStorage {
  const memory = new Map<string, string>();
  let persistent = backing !== null;

  const fallback = <R>(op: () => R, onFail: () => R): R => {
    if (!persistent) return onFail();
    try {
      return op();
    } catch {
      persistent = false;
      return onFail();
    }
  };

  return {
    get<T>(key: string): T | null {
      const raw = fallback(() => backing!.getItem(key), () => memory.get(key) ?? null);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null; // corrompido: trata como vazio; só é sobrescrito quando houver um novo registro
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      memory.set(key, raw);
      fallback(() => backing!.setItem(key, raw), () => undefined);
    },
    remove(key) {
      memory.delete(key);
      fallback(() => backing!.removeItem(key), () => undefined);
    },
    get persistent() {
      return persistent;
    },
  };
}
