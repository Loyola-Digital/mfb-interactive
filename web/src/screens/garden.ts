import type { Chapter, Mission, Point } from '../../../shared/content.ts';
import { check, missionIcon, rabbit } from '../art.ts';
import { missionIconKey } from '../games/index.ts';
import { smoothPath } from '../games/paths-view.ts';
import type { App } from '../main.ts';
import { esc, mount } from '../ui.ts';
import { bindBookTabs, bookList, bookTabs, sectionHeader } from './sections.ts';

/** Aviso discreto para o adulto sobre o salvamento. Vazio quando está tudo sincronizado. */
export function syncNotice(app: App): string {
  const notes: string[] = [];
  if (app.progress.pending > 0) notes.push('Progresso ainda não sincronizado. Será enviado quando a internet voltar.');
  if (!app.progress.persistent) notes.push('Este navegador não guarda dados: mantenha a internet ligada para salvar o progresso.');
  return notes.map((n) => `<p class="sync-note small" role="status">${esc(n)}</p>`).join('');
}

// Vizinhos sempre longe na horizontal: mesmo numa tela baixa os pontos não se encostam.
const XS = [24, 70, 34, 78];
/** Zigue-zague de baixo para cima (0–100% da faixa da trilha); a posição vem da ordem, não do conteúdo. */
export function trailPoint(i: number, n: number): Point {
  return { x: XS[i % XS.length], y: n < 2 ? 50 : 100 - (i * 100) / (n - 1) };
}

const PAGE_MAX = 6;
export interface GardenPage { title: string; missions: Mission[] }
/** Uma tela por capítulo; capítulo com mais de 6 exercícios vira telas do mesmo tamanho. */
export function gardenPages(chapters: Chapter[]): GardenPage[] {
  return chapters.flatMap((c) => {
    const ms = c.missions.filter((m) => !m.test);
    const size = Math.ceil(ms.length / Math.ceil(ms.length / PAGE_MAX));
    const pages: GardenPage[] = [];
    for (let i = 0; i < ms.length; i += size) pages.push({ title: c.title, missions: ms.slice(i, i + size) });
    return pages;
  });
}

const arrow = (dir: 'prev' | 'next') =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === 'prev' ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}"/></svg>`;

/** Aba Exercícios: a trilha da apostila atual em telas, sem as provas (que têm aba própria). */
export function showGarden(app: App, focus?: string, pageIndex?: number) {
  const state = app.progress.state;
  const all = bookList(app, false);
  const pages = gardenPages(app.book.chapters);
  const suggested = all.find((m) => m.available && !state.missions[m.id]?.completed);
  const pageOf = (id?: string) => pages.findIndex((p) => p.missions.some((m) => m.id === id));
  // Abre na tela da última missão aberta; se ela for de outra apostila, na da missão sugerida.
  const index = pageIndex ?? Math.max(0, pageOf(focus) >= 0 ? pageOf(focus) : pageOf(suggested?.id));
  const page = pages[index];
  const missions = page?.missions ?? [];
  const at = (i: number) => trailPoint(i, missions.length);
  const sAt = suggested && missions.includes(suggested) ? at(missions.indexOf(suggested)) : null;
  const toSuggested = Math.sign(pageOf(suggested?.id) - index);
  const trail = smoothPath(missions.map((_, i) => at(i)));

  const spots = missions
    .map((m, i) => {
      const p = at(i);
      const n = all.indexOf(m) + 1;
      const done = state.missions[m.id]?.completed;
      const cls = ['spot', m.available ? '' : 'is-soon', done ? 'is-done' : '', m === suggested ? 'is-suggested' : ''].join(' ');
      const label = `Missão ${n}: ${m.title}${done ? ', concluída' : ''}${m.available ? '' : ', em breve'}`;
      return `<button type="button" class="${cls}" data-id="${m.id}" style="left:${p.x}%;top:${p.y}%"
          aria-label="${esc(label)}" ${m.available ? '' : 'aria-disabled="true"'}>
        <span class="spot__icon">${missionIcon(missionIconKey(m))}</span>
        <span class="spot__num">${n}</span>
        ${done ? `<span class="spot__done">${check}</span>` : ''}
        ${m.available ? '' : '<span class="spot__soon mfb-pill mfb-pill--sm">em breve</span>'}
      </button>`;
    })
    .join('');

  const pagerBtn = (dir: 'prev' | 'next', to: number, hint: boolean) =>
    `<button type="button" class="pager__btn${hint ? ' is-suggested' : ''}" data-page="${to}"
      aria-label="${dir === 'prev' ? 'Tela anterior' : 'Próxima tela'}" ${to < 0 || to >= pages.length ? 'disabled' : ''}>${arrow(dir)}</button>`;

  mount(app.root, `<div class="screen screen--garden">
    ${sectionHeader('exercicios')}
    ${bookTabs(app)}
    <div class="garden-notes">${syncNotice(app)}</div>
    <nav class="pager" aria-label="Telas do jardim">
      ${pagerBtn('prev', index - 1, toSuggested < 0)}
      <p class="pager__label"><strong>${esc(page?.title ?? '')}</strong><span class="small">Tela ${index + 1} de ${pages.length}</span></p>
      ${pagerBtn('next', index + 1, toSuggested > 0)}
    </nav>
    <div class="garden"><div class="garden__track">
      <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="trail__edge" d="${trail}"/><path class="trail__fill" d="${trail}"/>
      </svg>
      ${sAt ? `<div class="garden__rabbit" style="left:${sAt.x}%;top:${sAt.y}%">${rabbit('walking')}</div>` : ''}
      ${spots}
    </div></div>
  </div>`);

  bindBookTabs(app, () => showGarden(app));

  app.root.querySelector('.pager')!.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-page]');
    if (btn && !btn.disabled) showGarden(app, undefined, Number(btn.dataset.page));
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
