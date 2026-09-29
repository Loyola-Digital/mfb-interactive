import '../../design-system/tokens.css';
import '../../design-system/components/bundle.css';
import './styles.css';

import type { Mission } from '../../shared/content.ts';
import { api, ApiError, OfflineError } from './api.ts';
import { loadMissions } from './content-loader.ts';
import { createProgressClient } from './progress-client.ts';
import { showEnd, showError } from './screens/status.ts';
import { showGarden } from './screens/garden.ts';
import { showLogin } from './screens/login.ts';
import { showMission } from './screens/mission.ts';
import { showParents } from './screens/parents.ts';
import { showWelcome } from './screens/welcome.ts';
import { safeStorage } from './storage.ts';

export interface App {
  root: HTMLElement;
  missions: Mission[];
  email: string;
  progress: ReturnType<typeof createProgressClient>;
  go(hash: string): void;
  logout(): Promise<void>;
  /** Tela atual pode registrar uma limpeza (animações, timers) ao trocar de rota. */
  onLeave(fn: () => void): void;
  /** Redesenho leve quando o progresso muda (ex.: aviso de sincronização). */
  onProgressChange(fn: (() => void) | null): void;
}

const USER_KEY = 'mfb.user.v1';
const root = document.getElementById('app')!;
const storage = safeStorage();
let missions: Mission[] | null = null;
let email: string | null = storage.get<string>(USER_KEY);
let sessionChecked = false;
let leave: (() => void) | null = null;
let progressListener: (() => void) | null = null;

const progress = createProgressClient({
  api,
  storage,
  onUnauthorized: () => endSession(),
  onChange: () => progressListener?.(),
});

function endSession() {
  email = null;
  sessionChecked = false;
  storage.remove(USER_KEY);
  progress.forget();
  go('#/login');
}

function go(hash: string) {
  if (location.hash === hash) void route();
  else location.hash = hash;
}

const app: App = {
  root,
  get missions() { return missions ?? []; },
  get email() { return email ?? ''; },
  progress,
  go,
  async logout() {
    await api.logout().catch(() => {});
    endSession();
  },
  onLeave(fn) { leave = fn; },
  onProgressChange(fn) { progressListener = fn; },
};

export function signedIn(userEmail: string) {
  email = userEmail;
  sessionChecked = true;
  storage.set(USER_KEY, userEmail);
  progress.useAccount(userEmail);
}

/** Garante sessão: servidor confirma, ou (sem internet) usa a última conta conhecida neste aparelho. */
async function ensureSession(): Promise<'ok' | 'login' | 'offline'> {
  if (sessionChecked && email) return 'ok';
  try {
    const me = await api.me();
    signedIn(me.email);
    await progress.sync();
    return 'ok';
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return 'login';
    if (err instanceof OfflineError) return email ? 'ok' : 'offline';
    throw err;
  }
}

async function route() {
  leave?.();
  leave = null;
  progressListener = null;
  const [, name = '', param] = location.hash.split('/');

  if (!missions) {
    const loaded = await loadMissions();
    if (!loaded.ok) return showError(app, 'Não conseguimos carregar as brincadeiras.', () => void route());
    missions = loaded.missions;
  }

  if (name === 'login') return showLogin(app, (userEmail) => {
    signedIn(userEmail);
    void progress.sync().then(() => go('#/'));
  });

  const session = await ensureSession();
  if (session === 'login') return go('#/login');
  if (session === 'offline') return showError(app, 'Sem conexão com a internet. Conecte-se para entrar.', () => void route());

  if (name === 'missao' && param) return showMission(app, param);
  if (name === 'pais') return showParents(app);
  if (name === 'fim') return showEnd(app);
  if (!progress.state.welcomeSeen) return showWelcome(app);
  return showGarden(app);
}

window.addEventListener('hashchange', () => void route());
// Reenvia a fila quando a conexão volta ou o app volta a ficar visível.
window.addEventListener('online', () => void progress.sync());
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void progress.sync());

void route();
