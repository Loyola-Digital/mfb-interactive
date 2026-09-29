import type { ProgressEvent } from '../../shared/progress.ts';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code?: string) {
    super(`API ${status}${code ? ` ${code}` : ''}`);
    this.status = status;
    this.code = code;
  }
}

/** Sem conexão ou servidor fora do ar (inclui 5xx do repasse da Vercel). */
export class OfflineError extends Error {}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { credentials: 'same-origin', headers: { 'content-type': 'application/json' }, ...init });
  } catch {
    throw new OfflineError();
  }
  if (res.status >= 500) throw new OfflineError();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) => call<{ email: string }>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => call<null>('/logout', { method: 'POST' }),
  me: () => call<{ email: string }>('/me'),
  getEvents: async () => (await call<{ events: ProgressEvent[] }>('/progress')).events,
  postEvents: (events: ProgressEvent[]) => call<{ accepted: number }>('/progress/events', { method: 'POST', body: JSON.stringify({ events }) }),
  deleteProgress: () => call<null>('/progress', { method: 'DELETE' }),
};

export type Api = typeof api;
