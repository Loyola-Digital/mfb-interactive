import type { BookId, Mission, Point } from '../../../shared/content.ts';
import { check, missionIcon, rabbit } from '../art.ts';
import { missionIconKey } from '../games/index.ts';
import { smoothPath } from '../games/paths-view.ts';
import type { App } from '../main.ts';
import { esc, logo, mount } from '../ui.ts';

/** Aviso discreto para o adulto sobre o salvamento. Vazio quando está tudo sincronizado. */
export function syncNotice(app: App): string {
  const notes: string[] = [];
  if (app.progress.pending > 0) notes.push('Progresso ainda não sincronizado. Será enviado quando a internet voltar.');
  if (!app.progress.persistent) notes.push('Este navegador não guarda dados: mantenha a internet ligada para salvar o progresso.');
  return notes.map((n) => `<p class="sync-note small" role="status">${esc(n)}</p>`).join('');
}

/** Missões da apostila, na ordem da trilha. */
export const bookMissions = (app: App, id: BookId = app.book.id): Mission[] => app.books.find((b) => b.id === id)?.chapters.flatMap((c) => c.missions) ?? [];

const XS = [26, 64, 78, 40];
/** Zigue-zague de baixo para cima; a posição vem da ordem, não do conteúdo. */
export function trailPoint(i: number, n: number): Point {
  return { x: XS[i % XS.length], y: n < 2 ? 50 : 95 - (i * 90) / (n - 1) };
}

export function showGarden(app: App) {
  const state = app.progress.state;
  const book = app.book;
  const missions = bookMissions(app);
  const at = (i: number) => trailPoint(i, missions.length);
  const suggested = missions.find((m) => m.available && !state.missions[m.id]?.completed);
  const sAt = suggested ? at(missions.indexOf(suggested)) : null;
  const trail = smoothPath(missions.map((_, i) => at(i)));
  const firsts = new Map(book.chapters.map((c) => [c.missions[0].id, c.title]));

  const spots = missions
    .map((m, i) => {
      const p = at(i);
      const done = state.missions[m.id]?.completed;
      const cls = ['spot', m.test ? 'spot--test' : '', m.available ? '' : 'is-soon', done ? 'is-done' : '', m === suggested ? 'is-suggested' : ''].join(' ');
      const label = `${m.test ? 'Prova' : 'Missão'} ${i + 1}: ${m.title}${done ? ', concluída' : ''}${m.available ? '' : ', em breve'}`;
      const chapter = firsts.get(m.id);
      return `${chapter ? `<span class="chapter-label mfb-pill mfb-pill--sm" style="left:${p.x < 50 ? 74 : 26}%;top:${p.y}%">${esc(chapter)}</span>` : ''}
        <button type="button" class="${cls}" data-id="${m.id}" style="left:${p.x}%;top:${p.y}%"
          aria-label="${esc(label)}" ${m.available ? '' : 'aria-disabled="true"'}>
        <span class="spot__icon">${missionIcon(missionIconKey(m))}</span>
        <span class="spot__num">${i + 1}</span>
        ${m.test ? '<span class="spot__test mfb-pill mfb-pill--sm">prova</span>' : ''}
        ${done ? `<span class="spot__done">${check}</span>` : ''}
        ${m.available ? '' : '<span class="spot__soon mfb-pill mfb-pill--sm">em breve</span>'}
      </button>`;
    })
    .join('');
  const tabs = app.books.map((b) => `<button type="button" class="book-tab${b.id === book.id ? ' is-current' : ''}" data-book="${b.id}"
      aria-pressed="${b.id === book.id}">${esc(b.title)}</button>`).join('');

  mount(app.root, `<div class="screen screen--garden">
    <header class="topbar topbar--garden">${logo}<a class="mfb-btn mfb-btn--outline mfb-btn--sm" href="#/pais">Área dos pais</a></header>
    <nav class="book-tabs" aria-label="Apostilas">${tabs}</nav>
    <div class="garden-notes">${syncNotice(app)}</div>
    <div class="garden" style="--missions: ${missions.length}">
      <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="trail__edge" d="${trail}"/><path class="trail__fill" d="${trail}"/>
      </svg>
      ${sAt ? `<div class="garden__rabbit" style="left:${sAt.x}%;top:${sAt.y}%">${rabbit('walking')}</div>` : ''}
      ${spots}
    </div>
  </div>`);

  // Jardim longo: abre já mostrando a missão sugerida.
  app.root.querySelector('.spot.is-suggested')?.scrollIntoView({ block: 'center' });

  app.root.querySelector('.book-tabs')!.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest<HTMLElement>('[data-book]');
    if (!tab || tab.dataset.book === book.id) return;
    app.chooseBook(tab.dataset.book as BookId);
    showGarden(app);
  });

  app.root.querySelector('.garden')!.addEventListener('click', (e) => {
    const spot = (e.target as Element).closest<HTMLElement>('.spot');
    if (!spot) return;
    if (spot.classList.contains('is-soon')) {
      spot.classList.remove('is-nudged');
      void spot.offsetWidth;
      spot.classList.add('is-nudged');
      return;
    }
    app.go(`#/missao/${spot.dataset.id}`);
  });

  app.onProgressChange(() => {
    const notes = app.root.querySelector('.garden-notes');
    if (notes) notes.innerHTML = syncNotice(app);
  });
}
