import '../../design-system/tokens.css';
import '../../design-system/components/bundle.css';
import './styles.css';

import type { Book, Content, Mission, PlacementLevel } from '../../shared/content.ts';
import { api, ApiError, OfflineError, type Me, type Role } from './api.ts';
import { loadContent } from './content-loader.ts';
import { createProgressClient } from './progress-client.ts';
import { showEnd, showError } from './screens/status.ts';
import { showGarden } from './screens/garden.ts';
import { showLogin } from './screens/login.ts';
import { showMission } from './screens/mission.ts';
import { showAdmin } from './screens/admin.ts';
import { showInvite } from './screens/invite.ts';
import { showParents } from './screens/parents.ts';
import { showPlacement, showPlacementOffer } from './screens/placement.ts';
import { showTests } from './screens/tests.ts';
import { showWelcome } from './screens/welcome.ts';
import { safeStorage } from './storage.ts';

export interface App {
  root: HTMLElement;
  /** Todas as missões, de todas as apostilas. */
  missions: Mission[];
  books: Book[];
  placement: PlacementLevel[];
  /** Apostila atual: a escolhida pelo adulto, ou a primeira. */
  book: Book;
  /** Registra a escolha de apostila. */
  chooseBook(id: Book['id']): void;
  email: string;
  /** Papel informado pelo servidor; sem conexão, vale "family" (a área de administração some). */
  role: Role;
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
let content: Content | null = null;
let email: string | null = storage.get<string>(USER_KEY);
let role: Role = 'family';
let sessionChecked = false;
let leave: (() => void) | null = null;
let progressListener: (() => void) | null = null;
/** Última missão aberta: o jardim volta para a tela dela. */
let lastMission: string | undefined;

const progress = createProgressClient({
  api,
  storage,
  onUnauthorized: () => endSession(),
  onChange: () => progressListener?.(),
});

function endSession() {
  email = null;
  role = 'family';
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
  get missions() { return content?.missions ?? []; },
  get books() { return content?.books ?? []; },
  get placement() { return content?.placement ?? []; },
  get book() { return app.books.find((b) => b.id === progress.state.book) ?? app.books[0]; },
  chooseBook(id) {
    if (progress.state.book !== id) progress.record('bookChosen', null, null, { book: id });
  },
  get email() { return email ?? ''; },
  get role() { return role; },
  progress,
  go,
  async logout() {
    await api.logout().catch(() => {});
    endSession();
  },
  onLeave(fn) { leave = fn; },
  onProgressChange(fn) { progressListener = fn; },
};

export function signedIn(me: Me) {
  email = me.email;
  role = me.role;
  sessionChecked = true;
  storage.set(USER_KEY, me.email);
  progress.useAccount(me.email);
}

/** Garante sessão: servidor confirma, ou (sem internet) usa a última conta conhecida neste aparelho. */
async function ensureSession(): Promise<'ok' | 'login' | 'offline'> {
  if (sessionChecked && email) return 'ok';
  try {
    signedIn(await api.me());
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

  if (!content) {
    const loaded = await loadContent();
    if (!loaded.ok) return showError(app, 'Não conseguimos carregar as brincadeiras.', () => void route());
    content = loaded.content;
  }

  const enter = (me: Me) => {
    signedIn(me);
    void progress.sync().then(() => go('#/'));
  };
  if (name === 'login') return showLogin(app, enter);
  // Link de acesso: funciona sem sessão (e troca de conta se houver uma aberta).
  if (name === 'convite' && param) return showInvite(app, param, enter);

  const session = await ensureSession();
  if (session === 'login') return go('#/login');
  if (session === 'offline') return showError(app, 'Sem conexão com a internet. Conecte-se para entrar.', () => void route());

  if (name === 'missao' && param) {
    lastMission = param;
    return showMission(app, param);
  }
  if (name === 'pais') return showParents(app);
  if (name === 'admin') return showAdmin(app);
  if (name === 'fim') return showEnd(app);
  if (name === 'alinhamento') return showPlacement(app);
  if (!progress.state.welcomeSeen) return showWelcome(app);
  if (!progress.state.book) return showPlacementOffer(app);
  if (name === 'provas') return showTests(app);
  return showGarden(app, lastMission);
}

window.addEventListener('hashchange', () => void route());
// Reenvia a fila quando a conexão volta ou o app volta a ficar visível.
window.addEventListener('online', () => void progress.sync());
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void progress.sync());

void route();
