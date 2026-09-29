import { check, missionIcon, rabbit } from '../art.ts';
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

export function showGarden(app: App) {
  const state = app.progress.state;
  const suggested = app.missions.find((m) => m.available && !state.missions[m.id]?.completed);
  const trail = smoothPath(app.missions.map((m) => m.garden));

  const spots = app.missions
    .map((m, i) => {
      const done = state.missions[m.id]?.completed;
      const cls = ['spot', m.available ? '' : 'is-soon', done ? 'is-done' : '', m === suggested ? 'is-suggested' : ''].join(' ');
      const label = `Missão ${i + 1}: ${m.title}${done ? ', concluída' : ''}${m.available ? '' : ', em breve'}`;
      return `<button type="button" class="${cls}" data-id="${m.id}" style="left:${m.garden.x}%;top:${m.garden.y}%"
          aria-label="${esc(label)}" ${m.available ? '' : 'aria-disabled="true"'}>
        <span class="spot__icon">${missionIcon(m.icon)}</span>
        <span class="spot__num">${i + 1}</span>
        ${done ? `<span class="spot__done">${check}</span>` : ''}
        ${m.available ? '' : '<span class="spot__soon mfb-pill mfb-pill--sm">em breve</span>'}
      </button>`;
    })
    .join('');

  mount(app.root, `<div class="screen screen--garden">
    <header class="topbar topbar--garden">${logo}<a class="mfb-btn mfb-btn--outline mfb-btn--sm" href="#/pais">Área dos pais</a></header>
    <div class="garden-notes">${syncNotice(app)}</div>
    <div class="garden" style="--missions: ${app.missions.length}">
      <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="trail__edge" d="${trail}"/><path class="trail__fill" d="${trail}"/>
      </svg>
      ${suggested ? `<div class="garden__rabbit" style="left:${suggested.garden.x}%;top:${suggested.garden.y}%">${rabbit('walking')}</div>` : ''}
      ${spots}
    </div>
  </div>`);

  // Jardim longo: abre já mostrando a missão sugerida.
  app.root.querySelector('.spot.is-suggested')?.scrollIntoView({ block: 'center' });

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
