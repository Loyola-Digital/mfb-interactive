// Tela do link de acesso: confere o link, a pessoa cria a senha e já entra.
import { api, ApiError, OfflineError, type Me } from '../api.ts';
import type { App } from '../main.ts';
import { esc, logo, mount } from '../ui.ts';

const MIN_PASSWORD = 8;

export async function showInvite(app: App, token: string, onSignedIn: (me: Me) => void) {
  // O token sai do endereço logo: não fica no histórico do navegador.
  history.replaceState(null, '', '#/convite');
  mount(app.root, `<div class="screen screen--adult screen--login"><header class="topbar">${logo}</header>
    <section class="mfb-card adult-card"><p class="muted">Conferindo o link…</p></section></div>`);

  let info: { email: string; kind: 'invite' | 'reset' };
  try {
    info = await api.checkInvite(token);
  } catch (err) {
    const offline = err instanceof OfflineError;
    mount(app.root, `<div class="screen screen--adult screen--login"><header class="topbar">${logo}</header>
      <section class="mfb-card adult-card">
        <h1 class="title">${offline ? 'Sem conexão' : 'Link inválido'}</h1>
        <p>${offline ? 'Não conseguimos falar com o servidor. Verifique a internet e abra o link de novo.'
          : 'Este link de acesso já foi usado, expirou ou foi cancelado. Peça um novo link à equipe do Meu Filho Bilíngue.'}</p>
        <div class="actions"><a class="mfb-btn mfb-btn--outline" href="#/login">Ir para o login</a></div>
      </section></div>`);
    return;
  }

  const isNew = info.kind === 'invite';
  mount(app.root, `<div class="screen screen--adult screen--login">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card">
      <h1 class="title">${isNew ? 'Bem-vindo!' : 'Nova senha'}</h1>
      <p class="muted">${isNew ? 'Crie a senha da sua conta no Meu Filho Bilíngue.' : 'Escolha uma senha nova para a sua conta. Quem estiver conectado em outros aparelhos vai precisar entrar de novo.'}</p>
      <form class="form" novalidate>
        <label class="field"><span class="body-strong">E-mail</span>
          <input type="email" value="${esc(info.email)}" autocomplete="username" readonly></label>
        <label class="field"><span class="body-strong">Senha</span>
          <input name="password" type="password" autocomplete="new-password" minlength="${MIN_PASSWORD}" required></label>
        <label class="field"><span class="body-strong">Repita a senha</span>
          <input name="confirm" type="password" autocomplete="new-password" required></label>
        <p class="small muted">Pelo menos ${MIN_PASSWORD} caracteres.</p>
        <p class="form-error" role="alert" hidden></p>
        <button class="mfb-btn mfb-btn--primary" type="submit">${isNew ? 'Criar conta e entrar' : 'Salvar senha e entrar'}</button>
      </form>
    </section>
  </div>`);

  const form = app.root.querySelector<HTMLFormElement>('form')!;
  const error = form.querySelector<HTMLElement>('.form-error')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;
  const showErr = (msg: string) => {
    error.textContent = msg;
    error.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const password = String(data.get('password') ?? '');
    if (password.length < MIN_PASSWORD) return showErr(`A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`);
    if (password !== String(data.get('confirm') ?? '')) return showErr('As duas senhas não são iguais.');
    button.disabled = true;
    try {
      // Encerra no servidor a sessão de outra conta aberta neste aparelho; a do link entra no lugar.
      if (app.email && app.email !== info.email) await api.logout().catch(() => {});
      onSignedIn(await api.acceptInvite(token, password));
    } catch (err) {
      if (err instanceof OfflineError) showErr('Sem conexão com o servidor. Verifique a internet e tente de novo.');
      else if (err instanceof ApiError && err.status === 429) showErr('Muitas tentativas. Aguarde 15 minutos e tente de novo.');
      else if (err instanceof ApiError && err.code === 'weak_password') showErr(`A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`);
      else showErr('Este link não vale mais. Peça um novo link à equipe do Meu Filho Bilíngue.');
    } finally {
      button.disabled = false;
    }
  });
}
