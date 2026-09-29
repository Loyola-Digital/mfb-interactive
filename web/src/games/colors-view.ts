// Tela do jogo de Cores: traduz toques em eventos de colors.ts e anima os efeitos.
import type { Paint } from '../../../shared/content.ts';
import { check, paintable, rabbit } from '../art.ts';
import { esc, reducedMotion } from '../ui.ts';
import { init, reduce, type ColorsEffect, type ColorsEvent } from './colors.ts';
import { createDemo, nudge } from './demo.ts';
import type { GameModule } from './types.ts';

export const PAINT_NAMES: Record<Paint, string> = { leaf: 'verde', yellow: 'amarela', coral: 'coral', sky: 'azul' };

export const colorsGame: GameModule<'colors'> = {
  play(root, mission, hooks) {
    const game = mission.game;
    let state = init(game);

    root.innerHTML = `<div class="colors game">
      <div class="game-model mfb-card" aria-label="Modelo">
        <div class="game-model__art">${paintable(game.drawing, 'Modelo pintado', game.target)}</div>
        <span class="word">${esc(mission.word)}</span>
      </div>
      <div class="colors__stage">
        <button type="button" class="colors__drawing" aria-label="Desenho para pintar">${paintable(game.drawing, 'Desenho para pintar')}</button>
        <div class="game-rabbit">${rabbit('waiting')}</div>
      </div>
      <div class="colors__paints" role="group" aria-label="Tintas">
        ${state.paints
          .map((p) => `<button type="button" class="paint" data-paint="${p}" aria-pressed="false" aria-label="Tinta ${PAINT_NAMES[p]}" style="--paint: var(--${p})">
              <span class="paint__swatch"></span><span class="paint__check">${check}</span></button>`)
          .join('')}
      </div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.colors')!;
    const drawingBtn = el.querySelector<HTMLButtonElement>('.colors__drawing')!;
    const drawingArt = drawingBtn.querySelector<HTMLElement>('.paintable-art')!;
    const paintBtns = [...el.querySelectorAll<HTMLButtonElement>('.paint')];
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    let completeTimer = 0;

    const targetBtn = () => paintBtns.find((b) => b.dataset.paint === state.target)!;
    const showDemo = () => demo.run([targetBtn(), drawingBtn]);

    function apply(effect: ColorsEffect) {
      switch (effect.type) {
        case 'selected':
          for (const b of paintBtns) {
            const on = b.dataset.paint === effect.paint;
            b.classList.toggle('is-selected', on);
            b.setAttribute('aria-pressed', String(on));
          }
          break;
        case 'noPaint':
          nudge(el.querySelector('.colors__paints')!);
          break;
        case 'preview':
          drawingArt.style.setProperty('--paint', `var(--${effect.paint})`);
          drawingBtn.classList.add('is-preview');
          nudge(el.querySelector('.game-model')!);
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          targetBtn().classList.add('is-hint');
          hooks.onHelp();
          showDemo();
          break;
        case 'completed':
          demo.cancel();
          drawingArt.style.setProperty('--paint', `var(--${state.target})`);
          drawingBtn.classList.remove('is-preview');
          drawingBtn.classList.add('is-done');
          paintBtns.forEach((b) => b.classList.remove('is-hint'));
          rabbitBox.innerHTML = rabbit('celebrating');
          completeTimer = window.setTimeout(hooks.onComplete, reducedMotion() ? 600 : 1400);
          break;
      }
    }

    const dispatch = (event: ColorsEvent) => {
      const r = reduce(state, event);
      state = r.state;
      r.effects.forEach(apply);
    };

    el.addEventListener('click', (e) => {
      const paint = (e.target as Element).closest<HTMLElement>('.paint');
      if (paint) return dispatch({ type: 'selectPaint', paint: paint.dataset.paint as Paint });
      if ((e.target as Element).closest('.colors__drawing')) dispatch({ type: 'tapDrawing' });
    });

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
        clearTimeout(completeTimer);
      },
    };
  },

  result: (m) => `<div class="result-art result-art--colors">${paintable(m.game.drawing, `${m.title}, pronto`, m.game.target)}</div>`,
};
