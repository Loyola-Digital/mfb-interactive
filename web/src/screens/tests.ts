// Aba Provas: uma prova por capítulo da apostila atual, com quanto do capítulo já foi praticado.
// Os acertos ficam na área dos pais; aqui só "feita" ou "ainda não feita", porque a criança vê esta tela.
import { check, missionIcon } from '../art.ts';
import { missionIconKey } from '../games/index.ts';
import type { App } from '../main.ts';
import { esc, mount } from '../ui.ts';
import { syncNotice } from './garden.ts';
import { bindBookTabs, bookTabs, sectionHeader } from './sections.ts';

export function showTests(app: App) {
  const state = app.progress.state;
  const chapters = app.book.chapters.filter((c) => c.missions.some((m) => m.test));
  const cards = chapters.map((c, i) => {
    const test = c.missions.find((m) => m.test)!;
    const exercises = c.missions.filter((m) => !m.test);
    const practiced = exercises.filter((m) => state.missions[m.id]?.completed).length;
    const done = (state.missions[test.id]?.scored ?? 0) > 0;
    return `<li class="test-card mfb-card${done ? ' is-done' : ''}">
      <span class="test-card__icon">${missionIcon(missionIconKey(test))}</span>
      <div class="test-card__body">
        <span class="mfb-pill mfb-pill--coral mfb-pill--sm">Prova ${i + 1}</span>
        <h2 class="heading">${esc(c.title)}</h2>
        <p class="small muted">${practiced} de ${exercises.length} exercícios do capítulo feitos</p>
        <p class="small test-card__status">${done ? `<span class="test-card__check">${check}</span> Feita` : 'Ainda não feita'}</p>
      </div>
      <a class="mfb-btn ${done ? 'mfb-btn--outline' : 'mfb-btn--primary'} test-card__go" href="#/missao/${test.id}">${done ? 'Refazer' : 'Fazer a prova'}</a>
    </li>`;
  }).join('');

  mount(app.root, `<div class="screen screen--garden">
    ${sectionHeader('provas')}
    ${bookTabs(app)}
    <div class="garden-notes">${syncNotice(app)}</div>
    <p class="small muted tests-intro">Uma prova no fim de cada capítulo de ${esc(app.book.title)}, feita sem ajuda. Os acertos aparecem na <a href="#/pais">área dos pais</a>.</p>
    ${cards ? `<ul class="test-list">${cards}</ul>` : '<p class="report__empty">Esta apostila ainda não tem provas.</p>'}
  </div>`);

  bindBookTabs(app, () => showTests(app));
  app.onProgressChange(() => {
    const notes = app.root.querySelector('.garden-notes');
    if (notes) notes.innerHTML = syncNotice(app);
  });
}
