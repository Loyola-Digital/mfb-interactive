// Tela de Montar a palavra: letras soltas casadas com as letras apagadas, na ordem.
import { img, rabbit } from '../art.ts';
import { reducedMotion, shuffled } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type SequenceEffect } from './sequence.ts';
import type { GameModule } from './types.ts';

export const spellingGame: GameModule<'spelling'> = {
  play(root, mission, hooks) {
    const letters = [...mission.game.word];
    let state = init(letters);

    root.innerHTML = `<div class="spell game">
      <div class="spell__art">${img(mission.game.art)}</div>
      <div class="spell__slots" aria-label="Palavra">
        ${letters.map((l, i) => `<span class="letter-slot" data-i="${i}" aria-label="Espaço ${i + 1}">${l}</span>`).join('')}
      </div>
      <div class="spell__tiles" role="group" aria-label="Letras">
        ${shuffled(letters).map((l) => `<button type="button" class="letter" data-key="${l}" aria-label="Letra ${l}">${l}</button>`).join('')}
      </div>
      <div class="game-rabbit">${rabbit('waiting')}</div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.spell')!;
    const slots = [...el.querySelectorAll<HTMLElement>('.letter-slot')];
    const tiles = [...el.querySelectorAll<HTMLButtonElement>('.letter')];
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    let completeTimer = 0;

    const tileFor = (key: string) => tiles.find((t) => t.dataset.key === key && !t.disabled)!;
    const markNext = () => slots.forEach((s, i) => s.classList.toggle('is-next', i === state.next));
    const showDemo = () => demo.run([tileFor(letters[state.next]), slots[state.next]]);

    function apply(effect: SequenceEffect, tapped: HTMLButtonElement) {
      switch (effect.type) {
        case 'placed':
          slots[effect.index].classList.add('is-filled');
          tapped.classList.add('is-used');
          tapped.disabled = true;
          tiles.forEach((t) => t.classList.remove('is-hint'));
          markNext();
          break;
        case 'invalid':
          nudge(tapped);
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          tileFor(effect.key).classList.add('is-hint');
          hooks.onHelp();
          showDemo();
          break;
        case 'completed':
          demo.cancel();
          el.classList.add('is-complete');
          rabbitBox.innerHTML = rabbit('celebrating');
          completeTimer = window.setTimeout(hooks.onComplete, reducedMotion() ? 700 : 1800);
          break;
      }
    }

    el.addEventListener('click', (e) => {
      const tile = (e.target as Element).closest<HTMLButtonElement>('.letter');
      if (!tile || tile.disabled) return;
      const r = reduce(state, { type: 'tap', key: tile.dataset.key! });
      state = r.state;
      r.effects.forEach((f) => apply(f, tile));
    });

    markNext();
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

  result: (m) => `<div class="result-art result-art--word">${img(m.game.art)}</div>`,
};
