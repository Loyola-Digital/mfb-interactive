// Tela do jogo de Caminhos: pedras sobre o jardim, o coelho anda até a pedra tocada.
import type { Point } from '../../../shared/content.ts';
import { img, rabbit } from '../art.ts';
import { esc, reducedMotion } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type PathsEffect } from './paths.ts';
import type { GameModule } from './types.ts';

/** Caminho suave (Catmull-Rom → Bézier) pelos pontos, em coordenadas 0–100. */
export function smoothPath(pts: Point[]): string {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

const pos = (p: Point) => `left:${p.x}%;top:${p.y}%`;

export const pathsGame: GameModule<'paths'> = {
  play(root, mission, hooks) {
    const g = mission.game;
    let state = init(g.points.length);

    root.innerHTML = `<div class="paths game">
      <div class="game-model mfb-card" aria-label="Modelo">
        <div class="game-model__art game-model__art--rabbit">${rabbit('waiting')}</div>
        <span class="word">${esc(mission.word)}</span>
      </div>
      <div class="scene">
        <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path class="trail__edge" d="${smoothPath([g.start, ...g.points, g.goal])}"/>
          <path class="trail__fill" d="${smoothPath([g.start, ...g.points, g.goal])}"/>
        </svg>
        <div class="paths__goal" style="${pos(g.goal)}">${img(g.goalArt)}</div>
        ${g.points
          .map((p, i) => `<button type="button" class="stone" data-i="${i}" style="${pos(p)}" aria-label="Pedra ${i + 1}">${img('pedra')}</button>`)
          .join('')}
        <div class="paths__rabbit" style="${pos(g.start)}">${rabbit('walking')}</div>
      </div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.paths')!;
    const stones = [...el.querySelectorAll<HTMLButtonElement>('.stone')];
    const walker = el.querySelector<HTMLElement>('.paths__rabbit')!;
    const demo = createDemo(el);
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, reducedMotion() ? Math.min(ms, 300) : ms));

    function mark() {
      stones.forEach((s, i) => {
        s.classList.toggle('is-next', i === state.next);
        s.classList.toggle('is-done', i < state.next);
        s.disabled = i < state.next;
      });
    }
    const moveTo = (p: Point) => {
      walker.style.left = `${p.x}%`;
      walker.style.top = `${p.y}%`;
    };

    function apply(effect: PathsEffect) {
      switch (effect.type) {
        case 'advance':
          stones.forEach((s) => s.classList.remove('is-hint'));
          moveTo(g.points[effect.index]);
          mark();
          break;
        case 'invalid':
          nudge(stones[effect.index]);
          nudge(walker, 'is-thinking');
          break;
        case 'autoHelp':
          stones[effect.index].classList.add('is-hint');
          hooks.onHelp();
          demo.run([stones[effect.index]]);
          break;
        case 'completed':
          demo.cancel();
          later(700, () => moveTo(g.goal));
          later(1400, () => (walker.innerHTML = rabbit('celebrating')));
          later(2600, hooks.onComplete);
          break;
      }
    }

    el.addEventListener('click', (e) => {
      const stone = (e.target as Element).closest<HTMLElement>('.stone');
      if (!stone) return;
      const r = reduce(state, { type: 'tapStone', index: Number(stone.dataset.i) });
      state = r.state;
      r.effects.forEach(apply);
    });

    mark();
    const showDemo = () => demo.run([stones[state.next]]);
    if (hooks.demoFirst) {
      requestAnimationFrame(showDemo);
      hooks.onDemoSeen();
    }

    return {
      help() {
        if (state.completed) return;
        hooks.onHelp();
        showDemo();
      },
      destroy() {
        demo.cancel();
        timers.forEach(clearTimeout);
      },
    };
  },

  result: (m) => `<div class="result-art result-art--paths">${img(m.game.goalArt, 'result-art__goal')}<div class="result-art__rabbit">${rabbit('celebrating')}</div></div>`,
};
