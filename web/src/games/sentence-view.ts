// Tela de Montar a frase: peças de quebra-cabeça casadas com os espaços por forma e cor.
import { img, rabbit, shapes } from '../art.ts';
import { esc, reducedMotion, shuffled } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type SequenceEffect } from './sequence.ts';
import type { GameModule } from './types.ts';

// Estilo de cada posição da frase; a última peça sempre leva o desenho.
const STYLES = [
  { color: 'coral', shape: 'star' },
  { color: 'sky', shape: 'heart' },
  { color: 'leaf', shape: 'circle' },
];

export const sentenceGame: GameModule<'sentence'> = {
  play(root, mission, hooks) {
    const { words, art } = mission.game;
    let state = init(words);
    const last = words.length - 1;
    const styleOf = (i: number) => (i === last ? { color: 'yellow', shape: '' } : STYLES[i % STYLES.length]);
    const face = (i: number) => (i === last ? img(art, 'piece__art') : `<span class="piece__shape">${shapes[styleOf(i).shape]}</span>`);
    const order = shuffled(words.map((_, i) => i));

    root.innerHTML = `<div class="sentence game">
      <div class="sentence__art">${img(art)}</div>
      <div class="sentence__slots" aria-label="Frase">
        ${words.map((_, i) => `<span class="slot-piece" data-i="${i}" style="--piece: var(--${styleOf(i).color})">${face(i)}</span>`).join('')}
      </div>
      <div class="sentence__pieces" role="group" aria-label="Peças">
        ${order.map((i) => `<button type="button" class="piece" data-i="${i}" data-key="${esc(words[i])}" style="--piece: var(--${styleOf(i).color})">
            ${face(i)}<span class="piece__word">${esc(words[i])}</span></button>`).join('')}
      </div>
      <div class="game-rabbit">${rabbit('waiting')}</div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.sentence')!;
    const slots = [...el.querySelectorAll<HTMLElement>('.slot-piece')];
    const pieces = [...el.querySelectorAll<HTMLButtonElement>('.piece')];
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    let completeTimer = 0;

    const pieceFor = (i: number) => pieces.find((p) => Number(p.dataset.i) === i && !p.classList.contains('is-used'))!;
    const markNext = () => slots.forEach((s, i) => s.classList.toggle('is-next', i === state.next));
    const showDemo = () => demo.run([pieceFor(state.next), slots[state.next]]);

    function apply(effect: SequenceEffect, tapped: HTMLButtonElement) {
      switch (effect.type) {
        case 'placed': {
          const slot = slots[effect.index];
          slot.innerHTML = tapped.innerHTML;
          slot.classList.add('is-filled');
          tapped.classList.add('is-used');
          tapped.disabled = true;
          pieces.forEach((p) => p.classList.remove('is-hint'));
          markNext();
          break;
        }
        case 'invalid':
          nudge(tapped);
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          pieceFor(state.next).classList.add('is-hint');
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
      const piece = (e.target as Element).closest<HTMLButtonElement>('.piece');
      if (!piece || piece.disabled) return;
      const r = reduce(state, { type: 'tap', key: words[Number(piece.dataset.i)] });
      state = r.state;
      r.effects.forEach((f) => apply(f, piece));
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
