// Fluxo comum a qualquer missão: preparação do adulto → jogo → resultado.
import { isPlayable, type PlayableMission } from '../../../shared/content.ts';
import { uuid } from '../../../shared/progress.ts';
import { missionResult, playMission } from '../games/index.ts';
import type { GameHandle } from '../games/types.ts';
import type { App } from '../main.ts';
import { confirmDialog, esc, logo, mount } from '../ui.ts';

export function showMission(app: App, id: string) {
  const mission = app.missions.find((m) => m.id === id);
  if (!mission || !isPlayable(mission)) return app.go('#/');
  const number = app.missions.indexOf(mission) + 1;
  showPrep(app, mission, number);
}

function showPrep(app: App, m: PlayableMission, number: number) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card prep">
      <span class="mfb-pill mfb-pill--yellow mfb-pill--sm">Missão ${number} · para o adulto</span>
      <h1 class="title">${esc(m.title)}</h1>
      <p><strong class="body-strong">Objetivo:</strong> ${esc(m.goal)}</p>
      <p class="prep__word"><span class="word">${esc(m.word)}</span> <span class="muted">= ${esc(m.meaning)}</span></p>
      <p><strong class="body-strong">Como acompanhar:</strong> ${esc(m.adultTip)}</p>
      <div class="actions">
        <button class="mfb-btn mfb-btn--primary" data-play>Vamos brincar</button>
        <button class="mfb-btn mfb-btn--outline" data-garden>Voltar ao jardim</button>
      </div>
    </section>
  </div>`);
  app.root.querySelector('[data-play]')!.addEventListener('click', () => showPlay(app, m, number));
  app.root.querySelector('[data-garden]')!.addEventListener('click', () => app.go('#/'));
}

function showPlay(app: App, m: PlayableMission, number: number) {
  const attemptId = uuid();
  app.progress.record('started', m.id, attemptId);

  mount(app.root, `<div class="screen screen--play">
    <header class="adult-bar" aria-label="Controles do adulto">
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-exit>Sair</button>
      <span class="adult-bar__title small">${esc(m.title)}</span>
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-skip>Pular</button>
    </header>
    <div class="play-area"></div>
    <button class="help-btn" data-help aria-label="Mostrar como brincar">
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"/><path d="M18 19a6 6 0 1 1 8 5.6c-1.4.6-2 1.6-2 3v1.4"/><circle cx="24" cy="35" r="2.2"/></svg>
    </button>
  </div>`);

  let handle: GameHandle | null = null;
  const cleanup = () => {
    handle?.destroy();
    handle = null;
  };
  app.onLeave(cleanup);

  handle = playMission(app.root.querySelector<HTMLElement>('.play-area')!, m, {
    demoFirst: !app.progress.state.missions[m.id]?.demoSeen,
    onDemoSeen: () => app.progress.record('demoSeen', m.id, attemptId),
    onHelp: () => app.progress.record('help', m.id, attemptId),
    onComplete: () => {
      app.progress.record('completed', m.id, attemptId);
      cleanup();
      showResult(app, m, number);
    },
  });

  app.root.querySelector('[data-help]')!.addEventListener('click', () => handle?.help());
  // Sair não registra nada: a missão recomeça do início na próxima vez e conclusões anteriores ficam.
  app.root.querySelector('[data-exit]')!.addEventListener('click', () => app.go('#/'));
  app.root.querySelector('[data-skip]')!.addEventListener('click', async () => {
    const ok = await confirmDialog('Pular esta brincadeira? Ela fica registrada como pulada, não como concluída.', 'Pular');
    if (!ok) return;
    app.progress.record('skipped', m.id, attemptId);
    app.go('#/');
  });
}

function showResult(app: App, m: PlayableMission, number: number) {
  // Próxima na ordem do jardim; abre a preparação do adulto, nunca o jogo direto.
  const next = app.missions.slice(app.missions.indexOf(m) + 1).find(isPlayable);
  mount(app.root, `<div class="screen screen--result">
    <section class="result-scene" aria-label="Resultado">
      ${missionResult(m)}
      <p class="result-scene__word"><span class="word word--big">${esc(m.word)}</span></p>
    </section>
    <section class="mfb-card adult-card result-card">
      <p class="small muted">${esc(m.word)} = ${esc(m.meaning)}</p>
      <h2 class="heading">Para brincar fora da tela</h2>
      <p>${esc(m.offScreen)}</p>
      <div class="actions">
        ${next ? `<button class="mfb-btn mfb-btn--primary result-card__next" data-next>Próxima missão: ${esc(next.title)}</button>` : ''}
        <button class="mfb-btn ${next ? 'mfb-btn--outline' : 'mfb-btn--primary'}" data-again>Repetir</button>
        <button class="mfb-btn mfb-btn--outline" data-garden>Voltar ao jardim</button>
        <button class="mfb-btn mfb-btn--outline" data-end>Encerrar</button>
      </div>
    </section>
  </div>`);
  if (next) app.root.querySelector('[data-next]')!.addEventListener('click', () => app.go(`#/missao/${next.id}`));
  app.root.querySelector('[data-again]')!.addEventListener('click', () => showPlay(app, m, number));
  app.root.querySelector('[data-garden]')!.addEventListener('click', () => app.go('#/'));
  app.root.querySelector('[data-end]')!.addEventListener('click', () => app.go('#/fim'));
}
