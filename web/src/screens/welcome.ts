import { rabbit } from '../art.ts';
import type { App } from '../main.ts';
import { logo, mount } from '../ui.ts';

export function showWelcome(app: App) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-band mfb-band--yellow welcome">
      <div class="welcome__inner">
        <div class="welcome__rabbit">${rabbit('waiting')}</div>
        <h1 class="display">Vamos brincar <span class="mfb-scribble">juntos</span></h1>
        <ul class="welcome__list">
          <li class="mfb-card"><strong class="body-strong">Você acompanha.</strong> Antes de cada brincadeira, um cartão curto mostra o objetivo e a palavra em inglês. Fique perto e ajude sem jogar pela criança.</li>
          <li class="mfb-card"><strong class="body-strong">Deixe o som ligado.</strong> As brincadeiras de ouvir falam palavras em inglês; toque no alto-falante para ouvir de novo. O app nunca usa o microfone.</li>
          <li class="mfb-card"><strong class="body-strong">O progresso fica na sua conta.</strong> Entre com o mesmo e-mail em outro aparelho e continue de onde parou.</li>
        </ul>
        <button class="mfb-btn mfb-btn--primary" data-start>Começar</button>
      </div>
    </section>
  </div>`);

  app.root.querySelector('[data-start]')!.addEventListener('click', () => {
    app.progress.record('welcomeSeen');
    app.go('#/');
  });
}
