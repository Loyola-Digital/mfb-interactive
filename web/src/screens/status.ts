import { rabbit } from '../art.ts';
import type { App } from '../main.ts';
import { esc, logo, mount } from '../ui.ts';

/** Erro para o adulto, sempre com saída: nunca deixa a tela vazia. */
export function showError(app: App, message: string, retry: () => void) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card" role="alert">
      <h1 class="title">Algo não carregou</h1>
      <p>${esc(message)}</p>
      <button class="mfb-btn mfb-btn--primary" data-retry>Tentar de novo</button>
    </section>
  </div>`);
  app.root.querySelector('[data-retry]')!.addEventListener('click', retry);
}

export function showEnd(app: App) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card end">
      <div class="end__rabbit">${rabbit('waiting')}</div>
      <h1 class="title">Até a próxima!</h1>
      <p class="muted">A brincadeira de hoje terminou. O jardim continua esperando quando vocês quiserem voltar.</p>
      <button class="mfb-btn mfb-btn--outline" data-garden>Voltar ao jardim</button>
    </section>
  </div>`);
  app.root.querySelector('[data-garden]')!.addEventListener('click', () => app.go('#/'));
}
