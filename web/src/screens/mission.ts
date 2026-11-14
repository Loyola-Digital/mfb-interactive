// Fluxo comum a qualquer missão: preparação do adulto → jogo → fim na mesma tela, com a seta para a próxima.
import { isPlayable, type PlayableMission } from '../../../shared/content.ts';
import { uuid } from '../../../shared/progress.ts';
import { rabbit, speakerIcon } from '../art.ts';
import { instructionLines, say, sayNext, speaker } from '../audio.ts';
import { missionResult, playMission } from '../games/index.ts';
import type { GameHandle } from '../games/types.ts';
import type { App } from '../main.ts';
import { confirmDialog, esc, logo, mount } from '../ui.ts';
import { bookList, sectionOf } from './sections.ts';

export function showMission(app: App, id: string) {
  const mission = app.missions.find((m) => m.id === id);
  if (!mission || !isPlayable(mission)) return app.go('#/');
  // Abrir uma missão de outra apostila (link, "próxima") passa a usar essa apostila nas abas.
  app.chooseBook(mission.book);
  // Exercícios e provas são numerados cada um na sua aba.
  const number = bookList(app, Boolean(mission.test), mission.book).indexOf(mission) + 1;
  showPrep(app, mission, number);
}

function showPrep(app: App, m: PlayableMission, number: number) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card prep">
      <span class="mfb-pill mfb-pill--${m.test ? 'coral' : 'yellow'} mfb-pill--sm">${m.test ? 'Prova' : 'Missão'} ${number} · para o adulto</span>
      <h1 class="title">${esc(m.title)}</h1>
      <p class="small muted">${esc(app.book.title)} · ${esc(m.chapter)}</p>
      <p><strong class="body-strong">Objetivo:</strong> ${esc(m.goal)}</p>
      <p class="prep__word"><span class="word">${esc(m.word)}</span> <span class="muted">= ${esc(m.meaning)}</span></p>
      <p><strong class="body-strong">Como acompanhar:</strong> ${esc(m.adultTip)}</p>
      <p><strong class="body-strong">Depois, fora da tela:</strong> ${esc(m.offScreen)}</p>
      <div class="actions">
        <button class="mfb-btn mfb-btn--primary" data-play>${m.test ? 'Começar a prova' : 'Vamos brincar'}</button>
        <button class="mfb-btn mfb-btn--outline" data-garden>${m.test ? 'Voltar às provas' : 'Voltar ao jardim'}</button>
      </div>
    </section>
  </div>`);
  app.root.querySelector('[data-play]')!.addEventListener('click', () => showPlay(app, m, number));
  app.root.querySelector('[data-garden]')!.addEventListener('click', () => app.go(sectionOf(m)));
}

function showPlay(app: App, m: PlayableMission, number: number) {
  const attemptId = uuid();
  app.progress.record('started', m.id, attemptId);

  mount(app.root, `<div class="screen screen--play">
    <header class="adult-bar" aria-label="Controles do adulto">
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-exit>Sair</button>
      ${m.instruction
        ? `<button type="button" class="adult-bar__title ask" data-say-pt="${esc(m.instruction.pt)}" data-say="${esc(m.instruction.en)}" aria-label="Ouvir o que fazer">${speakerIcon}<span class="small">${esc(m.instruction.pt)}</span></button>`
        : `<span class="adult-bar__title small">${esc(m.title)}</span>`}
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-skip>Pular</button>
    </header>
    <div class="play-area"></div>
    <button class="help-btn" data-help aria-label="Mostrar como brincar"${m.test ? ' hidden' : ''}>
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"/><path d="M18 19a6 6 0 1 1 8 5.6c-1.4.6-2 1.6-2 3v1.4"/><circle cx="24" cy="35" r="2.2"/></svg>
    </button>
  </div>`);

  let handle: GameHandle | null = null;
  const cleanup = () => {
    handle?.destroy();
    handle = null;
  };
  app.onLeave(cleanup);

  // O que fazer, em português e em inglês; as falas do jogo entram na fila depois.
  say(m.instruction ? instructionLines(m.instruction) : [], app.root.querySelector('.ask'));
  handle = playMission(app.root.querySelector<HTMLElement>('.play-area')!, m, {
    demoFirst: !m.test && !app.progress.state.missions[m.id]?.demoSeen,
    test: m.test,
    onDemoSeen: () => app.progress.record('demoSeen', m.id, attemptId),
    onHelp: () => app.progress.record('help', m.id, attemptId),
    onComplete: (score) => {
      app.progress.record('completed', m.id, attemptId, score);
      cleanup();
      showResult(app, m, number);
    },
  });

  app.root.querySelector('[data-help]')!.addEventListener('click', () => handle?.help());
  // Sair não registra nada: a missão recomeça do início na próxima vez e conclusões anteriores ficam.
  app.root.querySelector('[data-exit]')!.addEventListener('click', () => app.go(sectionOf(m)));
  app.root.querySelector('[data-skip]')!.addEventListener('click', async () => {
    const ok = await confirmDialog('Pular esta brincadeira? Ela fica registrada como pulada, não como concluída.', 'Pular');
    if (!ok) return;
    app.progress.record('skipped', m.id, attemptId);
    app.go(sectionOf(m));
  });
}

const arrowIcon = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 24h30M26 11l13 13-13 13"/></svg>';
const againIcon = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M35 6v9h-9"/></svg>';

// Fim na própria tela do jogo: a criança ouve a palavra e segue pela seta; os controles do adulto ficam na barra.
function showResult(app: App, m: PlayableMission, number: number) {
  // Próxima da mesma aba (exercício → exercício, prova → prova); abre a preparação do adulto, nunca o jogo direto.
  const list = bookList(app, Boolean(m.test), m.book);
  const next = list.slice(list.indexOf(m) + 1).find(isPlayable);
  // Na prova a criança só vê a comemoração; os acertos ficam na área dos pais.
  const scene = m.test
    ? `<div class="result-art result-art--test">${rabbit('celebrating')}</div><p class="result-scene__word"><span class="word word--big">Great job!</span></p>`
    : `${missionResult(m)}<p class="result-scene__word"><span class="word word--big${m.word.length > 14 ? ' word--long' : ''}">${esc(m.word)}</span>${m.audio ? speaker(m.audio) : ''}</p>`;
  mount(app.root, `<div class="screen screen--play">
    <header class="adult-bar" aria-label="Controles do adulto">
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-garden>${m.test ? 'Provas' : 'Jardim'}</button>
      <span class="adult-bar__title small">${m.test ? 'Prova concluída: acertos na área dos pais' : `${esc(m.word)} = ${esc(m.meaning)}`}</span>
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-end>Encerrar</button>
    </header>
    <section class="finish" aria-label="Resultado">
      <div class="result-scene">${scene}</div>
      <div class="finish__actions">
        <button type="button" class="finish__again" data-again aria-label="Repetir">${againIcon}</button>
        <button type="button" class="finish__next" data-next aria-label="${next ? `Próxima: ${esc(next.title)}` : m.test ? 'Voltar às provas' : 'Voltar ao jardim'}">${arrowIcon}</button>
      </div>
    </section>
  </div>`);
  // Na fila: o "Good job!" do último acerto termina antes da palavra.
  if (m.audio && !m.test) sayNext(m.audio, app.root.querySelector('.result-scene [data-say]'));
  app.root.querySelector('[data-next]')!.addEventListener('click', () => app.go(next ? `#/missao/${next.id}` : sectionOf(m)));
  app.root.querySelector('[data-again]')!.addEventListener('click', () => showPlay(app, m, number));
  app.root.querySelector('[data-garden]')!.addEventListener('click', () => app.go(sectionOf(m)));
  app.root.querySelector('[data-end]')!.addEventListener('click', () => app.go('#/fim'));
}
