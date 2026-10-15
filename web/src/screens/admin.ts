// Administração (só papel admin): gerar e cancelar links de acesso e ver as contas.
// O servidor confere o papel em cada pedido; esconder a tela aqui é só conveniência.
import { api, ApiError, OfflineError, type AccountInfo, type InviteInfo } from '../api.ts';
import type { App } from '../main.ts';
import { confirmDialog, esc, logo, mount } from '../ui.ts';

const date = (ms: number) => new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const linkFor = (token: string) => `${location.origin}${location.pathname}#/convite/${token}`;

const STATUS: Record<InviteInfo['status'], [string, string]> = {
  pending: ['aguardando', 'yellow'],
  used: ['usado', 'leaf'],
  expired: ['expirou', 'sky'],
  revoked: ['cancelado', 'coral'],
};

export function showAdmin(app: App) {
  if (app.role !== 'admin') return app.go('#/pais');

  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}<a class="mfb-btn mfb-btn--outline mfb-btn--sm" href="#/pais">Voltar</a></header>
    <section class="mfb-card adult-card">
      <span class="mfb-pill mfb-pill--coral mfb-pill--sm">Administração</span>
      <h1 class="title">Links de acesso</h1>
      <p class="muted">Digite o e-mail da família. O link vale só para esse e-mail, uma única vez, por 7 dias. Se a conta já existir, o link serve para criar uma senha nova.</p>
      <form class="form" data-new novalidate>
        <label class="field"><span class="body-strong">E-mail</span>
          <input name="email" type="email" inputmode="email" autocapitalize="none" autocomplete="off" required></label>
        <p class="form-error" role="alert" hidden></p>
        <button class="mfb-btn mfb-btn--primary" type="submit">Gerar link</button>
      </form>
      <div class="admin-link" hidden></div>
    </section>
    <section class="mfb-card adult-card">
      <h2 class="heading">Links gerados</h2>
      <ul class="report" data-invites><li class="muted">Carregando…</li></ul>
    </section>
    <section class="mfb-card adult-card">
      <h2 class="heading">Contas</h2>
      <ul class="report" data-users><li class="muted">Carregando…</li></ul>
    </section>
  </div>`);

  const form = app.root.querySelector<HTMLFormElement>('[data-new]')!;
  const error = form.querySelector<HTMLElement>('.form-error')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;
  const linkBox = app.root.querySelector<HTMLElement>('.admin-link')!;
  const showErr = (msg: string) => {
    error.textContent = msg;
    error.hidden = false;
  };
  const failMessage = (err: unknown) => {
    if (err instanceof OfflineError) return 'Sem conexão com o servidor.';
    if (err instanceof ApiError && err.status === 403) return 'Esta conta não tem acesso à administração.';
    if (err instanceof ApiError && err.code === 'admin_account') return 'Contas de administrador não recebem link; a senha delas muda pelo comando na VPS.';
    if (err instanceof ApiError && err.code === 'invalid_email') return 'Confira o e-mail.';
    return 'Não deu certo. Tente de novo.';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    const email = String(new FormData(form).get('email') ?? '').trim();
    if (!email) return showErr('Digite o e-mail.');
    button.disabled = true;
    try {
      const inv = await api.admin.createInvite(email);
      const link = linkFor(inv.token);
      linkBox.hidden = false;
      linkBox.innerHTML = `<p class="body-strong">${inv.kind === 'invite' ? 'Convite' : 'Nova senha'} para ${esc(inv.email)}</p>
        <input class="admin-link__url" type="text" readonly value="${esc(link)}" aria-label="Link de acesso">
        <p class="small muted">Envie por um canal privado (WhatsApp ou e-mail da família). Vale até ${date(inv.expiresAt)}. O link não aparece de novo; se perder, gere outro.</p>
        <div class="actions">
          <button class="mfb-btn mfb-btn--primary" type="button" data-copy>Copiar link</button>
          ${'share' in navigator ? '<button class="mfb-btn mfb-btn--outline" type="button" data-share>Compartilhar</button>' : ''}
        </div>`;
      linkBox.querySelector('[data-copy]')!.addEventListener('click', async (ev) => {
        const b = ev.currentTarget as HTMLButtonElement;
        try {
          await navigator.clipboard.writeText(link);
          b.textContent = 'Link copiado';
        } catch {
          linkBox.querySelector<HTMLInputElement>('.admin-link__url')!.select();
          b.textContent = 'Selecionado: copie com Ctrl+C';
        }
      });
      linkBox.querySelector('[data-share]')?.addEventListener('click', () => {
        void navigator.share({ title: 'Meu Filho Bilíngue', text: 'Seu link de acesso ao Meu Filho Bilíngue:', url: link }).catch(() => {});
      });
      form.reset();
      void loadInvites();
      void loadUsers();
    } catch (err) {
      showErr(failMessage(err));
    } finally {
      button.disabled = false;
    }
  });

  async function loadInvites() {
    const list = app.root.querySelector<HTMLElement>('[data-invites]');
    if (!list) return;
    try {
      const invites = await api.admin.invites();
      list.innerHTML = invites.length ? invites.map((i) => {
        const [label, color] = STATUS[i.status];
        return `<li class="report__row">
          <div><strong class="body-strong">${esc(i.email)}</strong>
            <p class="small muted">${i.kind === 'invite' ? 'Convite' : 'Nova senha'} · criado em ${date(i.createdAt)}${i.status === 'pending' ? ` · vale até ${date(i.expiresAt)}` : ''}${i.usedAt ? ` · usado em ${date(i.usedAt)}` : ''}</p></div>
          <div class="report__tags"><span class="mfb-pill mfb-pill--${color} mfb-pill--sm">${label}</span>
            ${i.status === 'pending' ? `<button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-revoke="${i.id}" data-email="${esc(i.email)}">Cancelar</button>` : ''}</div>
        </li>`;
      }).join('') : '<li class="report__empty">Nenhum link gerado ainda.</li>';
    } catch (err) {
      list.innerHTML = `<li class="form-error">${esc(failMessage(err))}</li>`;
    }
  }

  async function loadUsers() {
    const list = app.root.querySelector<HTMLElement>('[data-users]');
    if (!list) return;
    try {
      const users: AccountInfo[] = await api.admin.users();
      list.innerHTML = users.map((u) => `<li class="report__row">
          <div><strong class="body-strong">${esc(u.email)}</strong>
            <p class="small muted">Criada em ${date(u.createdAt)} · ${u.lastActivity ? `última atividade em ${date(u.lastActivity)}` : 'sem atividade'}</p></div>
          <div class="report__tags">
            ${u.role === 'admin' ? '<span class="mfb-pill mfb-pill--coral mfb-pill--sm">admin</span>' : '<span class="mfb-pill mfb-pill--sm">família</span>'}
            ${u.status === 'disabled' ? '<span class="mfb-pill mfb-pill--sky mfb-pill--sm">desativada</span>' : ''}</div>
        </li>`).join('');
    } catch (err) {
      list.innerHTML = `<li class="form-error">${esc(failMessage(err))}</li>`;
    }
  }

  app.root.querySelector('[data-invites]')!.addEventListener('click', async (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-revoke]');
    if (!b) return;
    if (!(await confirmDialog(`Cancelar o link de ${b.dataset.email}? Ele para de funcionar na hora.`, 'Cancelar link', 'Voltar'))) return;
    await api.admin.revokeInvite(Number(b.dataset.revoke)).catch(() => {});
    void loadInvites();
  });

  void loadInvites();
  void loadUsers();
}
