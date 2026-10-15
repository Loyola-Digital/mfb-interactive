import { api, ApiError, OfflineError, type Me } from '../api.ts';
import type { App } from '../main.ts';
import { logo, mount } from '../ui.ts';

export function showLogin(app: App, onSignedIn: (me: Me) => void) {
  mount(app.root, `<div class="screen screen--adult screen--login">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card">
      <h1 class="title">Entrar</h1>
      <p class="muted">Use o e-mail e a senha da sua conta. Recebeu um link de acesso? Abra o link para criar a sua senha.</p>
      <form class="form" novalidate>
        <label class="field"><span class="body-strong">E-mail</span>
          <input name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" required></label>
        <label class="field"><span class="body-strong">Senha</span>
          <input name="password" type="password" autocomplete="current-password" required></label>
        <p class="form-error" role="alert" hidden></p>
        <button class="mfb-btn mfb-btn--primary" type="submit">Entrar</button>
      </form>
      <p class="small muted">Esqueceu a senha ou ainda não tem acesso? Fale com a equipe do Meu Filho Bilíngue para receber um link.</p>
    </section>
  </div>`);

  const form = app.root.querySelector<HTMLFormElement>('form')!;
  const error = form.querySelector<HTMLElement>('.form-error')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    if (!email || !password) return showErr('Preencha o e-mail e a senha.');
    button.disabled = true;
    try {
      onSignedIn(await api.login(email, password));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) showErr('Muitas tentativas. Aguarde 15 minutos e tente de novo.');
      else if (err instanceof OfflineError) showErr('Sem conexão com o servidor. Verifique a internet e tente de novo.');
      else showErr('E-mail ou senha inválidos.');
    } finally {
      button.disabled = false;
    }
  });

  function showErr(msg: string) {
    error.textContent = msg;
    error.hidden = false;
  }
}
