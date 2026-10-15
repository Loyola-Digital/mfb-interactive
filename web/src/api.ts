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

export type Role = 'family' | 'admin';
export interface Me {
  email: string;
  role: Role;
}

export interface InviteInfo {
  id: number;
  email: string;
  kind: 'invite' | 'reset';
  createdAt: number;
  expiresAt: number;
  usedAt: number | null;
  status: 'pending' | 'used' | 'expired' | 'revoked';
}

export interface AccountInfo {
  email: string;
  role: Role;
  status: 'active' | 'disabled';
  createdAt: number;
  lastActivity: number | null;
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  login: (email: string, password: string) => call<Me>('/login', post({ email, password })),
  logout: () => call<null>('/logout', { method: 'POST' }),
  me: () => call<Me>('/me'),
  checkInvite: (token: string) => call<{ email: string; kind: 'invite' | 'reset' }>('/invites/check', post({ token })),
  acceptInvite: (token: string, password: string) => call<Me>('/invites/accept', post({ token, password })),
  admin: {
    invites: async () => (await call<{ invites: InviteInfo[] }>('/admin/invites')).invites,
    createInvite: (email: string) => call<{ token: string; email: string; kind: 'invite' | 'reset'; expiresAt: number }>('/admin/invites', post({ email })),
    revokeInvite: (id: number) => call<null>(`/admin/invites/${id}`, { method: 'DELETE' }),
    users: async () => (await call<{ users: AccountInfo[] }>('/admin/users')).users,
  },
  getEvents: async () => (await call<{ events: ProgressEvent[] }>('/progress')).events,
  postEvents: (events: ProgressEvent[]) => call<{ accepted: number }>('/progress/events', { method: 'POST', body: JSON.stringify({ events }) }),
  deleteProgress: () => call<null>('/progress', { method: 'DELETE' }),
};

export type Api = typeof api;
