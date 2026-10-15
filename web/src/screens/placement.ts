// Teste de alinhamento: rodadas de Escolher em modo prova, nível a nível, até a criança não passar.
import type { BookId } from '../../../shared/content.ts';
import { rabbit } from '../art.ts';
import { pickGame } from '../games/pick-view.ts';
import type { GameHandle, MissionOf, Score } from '../games/types.ts';
import type { App } from '../main.ts';
import { esc, logo, mount } from '../ui.ts';
import { sectionHeader } from './sections.ts';

/** Acertos mínimos (de 4) para subir de nível. */
export const PASS = 3;

/** Sugestão a partir dos acertos de cada nível feito, na ordem dos níveis. */
export function suggest(levels: BookId[], scores: number[]): BookId {
  const stop = scores.findIndex((s) => s < PASS);
  return levels[stop === -1 ? levels.length - 1 : stop];
}

function bookButtons(app: App, highlight: BookId | null): string {
  return app.books.map((b) => `<button class="mfb-btn ${b.id === highlight ? 'mfb-btn--primary' : 'mfb-btn--outline'} book-choice" data-book="${b.id}">
      <span class="book-choice__title">${esc(b.title)}</span><span class="book-choice__aud small">${esc(b.audience)}</span></button>`).join('');
}

function bindBooks(app: App) {
  app.root.querySelectorAll<HTMLElement>('[data-book]').forEach((b) => b.addEventListener('click', () => {
    app.chooseBook(b.dataset.book as BookId);
    app.go('#/');
  }));
}

export function showPlacementOffer(app: App) {
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card">
      <span class="mfb-pill mfb-pill--yellow mfb-pill--sm">Para o adulto</span>
      <h1 class="title">Em qual apostila começar?</h1>
      <p>O teste de alinhamento tem perguntas curtas, sem ajuda, que ficam mais difíceis enquanto a criança acerta. Leva uns 5 minutos e sugere a apostila. Você confirma ou escolhe outra, e pode trocar depois.</p>
      <div class="actions"><button class="mfb-btn mfb-btn--primary" data-test>Fazer o teste</button></div>
      <h2 class="heading">Ou escolha a apostila</h2>
      <div class="book-choices">${bookButtons(app, null)}</div>
    </section>
  </div>`);
  app.root.querySelector('[data-test]')!.addEventListener('click', () => app.go('#/alinhamento'));
  bindBooks(app);
}

/** Aba Teste de alinhamento. No primeiro acesso (sem apostila escolhida) aparece sem as abas, com "Voltar". */
export function showPlacement(app: App) {
  const state = app.progress.state;
  const chosen = Boolean(state.book);
  const last = app.books.find((b) => b.id === state.placement);
  mount(app.root, `<div class="screen ${chosen ? 'screen--garden' : 'screen--adult'}">
    ${chosen ? sectionHeader('alinhamento') : `<header class="topbar">${logo}</header>`}
    <section class="mfb-card adult-card prep">
      <span class="mfb-pill mfb-pill--yellow mfb-pill--sm">Teste de alinhamento · para o adulto</span>
      <h1 class="title">${chosen ? 'Teste de alinhamento' : 'Antes de começar'}</h1>
      <p>Perguntas curtas, sem ajuda, que ficam mais difíceis enquanto a criança acerta. No fim, o teste sugere a apostila; você confirma ou escolhe outra.</p>
      <p>Leia em voz alta o que aparece no alto de cada pergunta, mas não aponte a resposta: a primeira escolha da criança vale. Ela não vê se acertou, só a comemoração no fim.</p>
      ${chosen ? `<p class="small muted">Apostila atual: ${esc(app.book.title)}. ${last ? `Última sugestão do teste: ${esc(last.title)}.` : 'O teste ainda não foi feito.'}</p>` : ''}
      <div class="actions">
        <button class="mfb-btn mfb-btn--primary" data-start>${last ? 'Refazer o teste' : 'Começar o teste'}</button>
        ${chosen ? '' : '<button class="mfb-btn mfb-btn--outline" data-back>Voltar</button>'}
      </div>
    </section>
  </div>`);
  app.root.querySelector('[data-start]')!.addEventListener('click', () => runLevel(app, 0, []));
  app.root.querySelector('[data-back]')?.addEventListener('click', () => history.back());
}

function runLevel(app: App, level: number, scores: number[]) {
  const levels = app.placement;
  mount(app.root, `<div class="screen screen--play">
    <header class="adult-bar" aria-label="Controles do adulto">
      <button class="mfb-btn mfb-btn--outline mfb-btn--sm" data-exit>Sair</button>
      <span class="adult-bar__title small">Teste de alinhamento · parte ${level + 1} de ${levels.length}</span>
      <span></span>
    </header>
    <div class="play-area"></div>
  </div>`);
  let handle: GameHandle | null = null;
  app.onLeave(() => handle?.destroy());
  app.root.querySelector('[data-exit]')!.addEventListener('click', () => app.go(app.progress.state.book ? '#/alinhamento' : '#/'));

  // O teste reaproveita o jogo Escolher com uma "missão" só com as rodadas do nível.
  const mission = { game: { rounds: levels[level].rounds } } as MissionOf<'pick'>;
  handle = pickGame.play(app.root.querySelector<HTMLElement>('.play-area')!, mission, {
    demoFirst: false,
    test: true,
    onDemoSeen() {},
    onHelp() {},
    onComplete(score?: Score) {
      handle?.destroy();
      handle = null;
      const all = [...scores, score?.right ?? 0];
      const passed = all[level] >= PASS;
      if (passed && level < levels.length - 1) return runLevel(app, level + 1, all);
      showPlacementResult(app, suggest(levels.map((l) => l.book), all));
    },
  });
}

function showPlacementResult(app: App, book: BookId) {
  app.progress.record('placement', null, null, { book });
  const b = app.books.find((x) => x.id === book)!;
  mount(app.root, `<div class="screen screen--adult">
    <header class="topbar">${logo}</header>
    <section class="mfb-card adult-card">
      <div class="placement-rabbit">${rabbit('celebrating')}</div>
      <span class="mfb-pill mfb-pill--leaf mfb-pill--sm">Teste concluído</span>
      <h1 class="title">Sugestão: ${esc(b.title)}</h1>
      <p>${esc(b.audience)}. Confirme ou escolha outra apostila; dá para trocar depois no jardim ou na área dos pais.</p>
      <div class="book-choices">${bookButtons(app, book)}</div>
    </section>
  </div>`);
  bindBooks(app);
}
