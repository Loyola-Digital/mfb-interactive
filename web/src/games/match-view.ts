// Tela do Ligar: duas colunas embaralhadas; toca numa carta e depois na parceira do outro lado.
import { card, cardLabel, rabbit } from '../art.ts';
import { esc, reducedMotion, shuffled } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type MatchEffect, type Side } from './match.ts';
import type { GameModule } from './types.ts';

const COLORS = ['coral', 'sky', 'leaf', 'yellow'];

export const matchGame: GameModule<'match'> = {
  play(root, mission, hooks) {
    const pairs = mission.game.pairs;
    let state = init(pairs.length);
    let timer = 0;
    const idx = pairs.map((_, i) => i);
    const column = (side: Side, order: number[]) => order
      .map((i) => `<button type="button" class="option match-card" data-side="${side}" data-pair="${i}" aria-label="${esc(cardLabel(pairs[i][side === 'a' ? 0 : 1]))}">
        ${card(pairs[i][side === 'a' ? 0 : 1])}</button>`).join('');

    root.innerHTML = `<div class="match game">
      <div class="match__cols">
        <div class="match__col" role="group" aria-label="Coluna 1">${column('a', shuffled(idx))}</div>
        <div class="match__col" role="group" aria-label="Coluna 2">${column('b', shuffled(idx))}</div>
      </div>
      <div class="game-rabbit">${rabbit('waiting')}</div>
    </div>`;
    const el = root.querySelector<HTMLElement>('.match')!;
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    const cardOf = (side: Side, pair: number) => el.querySelector<HTMLButtonElement>(`.match-card[data-side="${side}"][data-pair="${pair}"]`)!;
    let done = 0;
    const showDemo = () => {
      const free = idx.find((i) => !state.matched[i]) ?? 0;
      demo.run([cardOf('a', free), el.querySelectorAll('.match__col')[1]]);
    };

    function apply(e: MatchEffect) {
      switch (e.type) {
        case 'selected':
          el.querySelectorAll('.match-card.is-lifted').forEach((c) => c.classList.remove('is-lifted'));
          if (e.pair !== null) cardOf(e.side, e.pair).classList.add('is-lifted');
          break;
        case 'paired': {
          demo.cancel();
          const color = COLORS[done++ % COLORS.length];
          for (const side of ['a', 'b'] as const) {
            const c = cardOf(side, e.pair);
            c.classList.remove('is-lifted', 'is-hint');
            c.classList.add('is-matched');
            c.style.setProperty('--pair', `var(--${color})`);
            c.disabled = true;
          }
          break;
        }
        case 'mismatch':
          el.querySelectorAll('.match-card.is-lifted').forEach((c) => c.classList.remove('is-lifted'));
          nudge(cardOf('a', e.a));
          nudge(cardOf('b', e.b));
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          cardOf('a', e.pair).classList.add('is-hint');
          cardOf('b', e.pair).classList.add('is-hint');
          hooks.onHelp();
          break;
        case 'completed':
          rabbitBox.innerHTML = rabbit('celebrating');
          el.classList.add('is-complete');
          timer = window.setTimeout(() => hooks.onComplete(), reducedMotion() ? 700 : 1600);
          break;
      }
    }

    el.addEventListener('click', (ev) => {
      const c = (ev.target as Element).closest<HTMLButtonElement>('.match-card');
      if (!c || c.disabled) return;
      const r = reduce(state, { type: 'tap', side: c.dataset.side as Side, pair: Number(c.dataset.pair) });
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
        clearTimeout(timer);
      },
    };
  },

  result: (m) => `<div class="result-art result-art--cards">${m.game.pairs.slice(0, 3)
    .map(([a, b]) => `<span class="match-pair"><span class="match-card is-matched">${card(a)}</span><span class="match-card is-matched">${card(b)}</span></span>`).join('')}</div>`,
};
