// Tela do jogo de Quantidades: pegar tulipa no cesto e plantar uma em cada cova.
import { img, rabbit } from '../art.ts';
import { esc, reducedMotion } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type QuantitiesEffect } from './quantities.ts';
import type { GameModule } from './types.ts';

const tulips = (n: number, cls = '') => Array.from({ length: n }, () => img('tulipa', cls)).join('');

export const quantitiesGame: GameModule<'quantities'> = {
  play(root, mission, hooks) {
    const g = mission.game;
    let state = init(g.slots);

    root.innerHTML = `<div class="qty game">
      <div class="game-model mfb-card" aria-label="Modelo">
        <span class="numeral">${esc(g.numeral)}</span>
        <span class="word">${esc(mission.word)}</span>
        <span class="qty__model-flowers">${tulips(g.slots)}</span>
      </div>
      <div class="qty__bed">
        ${Array.from({ length: g.slots }, (_, i) => `<button type="button" class="slot" data-i="${i}" aria-label="Espaço de plantar ${i + 1}">
            ${img('cova', 'slot__soil')}<span class="slot__flower">${img('tulipa')}</span></button>`).join('')}
      </div>
      <div class="qty__bottom">
        <button type="button" class="basket" aria-label="Cesto de tulipas" aria-pressed="false">
          <span class="basket__held">${img('tulipa')}</span>${img('cesto', 'basket__img')}
        </button>
        <div class="game-rabbit">${rabbit('waiting')}</div>
      </div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.qty')!;
    const slots = [...el.querySelectorAll<HTMLButtonElement>('.slot')];
    const basket = el.querySelector<HTMLButtonElement>('.basket')!;
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    let completeTimer = 0;

    const nextEmpty = () => slots[state.filled.indexOf(false)] ?? slots[0];
    const showDemo = () => demo.run(state.holding ? [nextEmpty()] : [basket, nextEmpty()]);
    const setHolding = (on: boolean) => {
      basket.classList.toggle('is-holding', on);
      basket.setAttribute('aria-pressed', String(on));
    };

    function apply(effect: QuantitiesEffect) {
      switch (effect.type) {
        case 'picked':
          setHolding(true);
          break;
        case 'planted':
          setHolding(false);
          slots.forEach((s) => s.classList.remove('is-hint'));
          slots[effect.index].classList.add('is-filled');
          break;
        case 'emptyHand':
          nudge(basket);
          break;
        case 'invalid':
          nudge(slots[effect.index]);
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          slots[effect.index].classList.add('is-hint');
          hooks.onHelp();
          showDemo();
          break;
        case 'completed':
          demo.cancel();
          rabbitBox.innerHTML = rabbit('celebrating');
          completeTimer = window.setTimeout(hooks.onComplete, reducedMotion() ? 600 : 1600);
          break;
      }
    }

    el.addEventListener('click', (e) => {
      const t = e.target as Element;
      const slot = t.closest<HTMLElement>('.slot');
      const event = t.closest('.basket') ? ({ type: 'tapBasket' } as const) : slot ? ({ type: 'tapSlot', index: Number(slot.dataset.i) } as const) : null;
      if (!event) return;
      const r = reduce(state, event);
      state = r.state;
      r.effects.forEach(apply);
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

  result: (m) => `<div class="result-art result-art--qty">${Array.from({ length: m.game.slots }, () => `<span class="result-art__planted">${img('cova', 'slot__soil')}<span class="slot__flower">${img('tulipa')}</span></span>`).join('')}<div class="result-art__rabbit">${rabbit('celebrating')}</div></div>`,
};
