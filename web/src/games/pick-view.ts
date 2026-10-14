// Tela do Escolher: enunciado no alto, opções embaixo, uma rodada por vez.
// Na prova a escolha só "aperta" a carta e passa à próxima, sem mostrar se acertou.
import { card, cardLabel, rabbit } from '../art.ts';
import { esc, reducedMotion } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type PickEffect } from './pick.ts';
import type { GameModule } from './types.ts';

export const pickGame: GameModule<'pick'> = {
  play(root, mission, hooks) {
    const rounds = mission.game.rounds;
    const test = Boolean(hooks.test);
    let state = init(rounds.map((r) => r.answer), test);
    let timer = 0;

    root.innerHTML = `<div class="pick game${test ? ' pick--test' : ''}">
      <ol class="pick__dots" aria-label="Rodadas">${rounds.map(() => '<li></li>').join('')}</ol>
      <div class="pick__stage"></div>
      <div class="game-rabbit">${rabbit('waiting')}</div>
    </div>`;
    const el = root.querySelector<HTMLElement>('.pick')!;
    const stage = el.querySelector<HTMLElement>('.pick__stage')!;
    const dots = [...el.querySelectorAll('.pick__dots li')];
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    const options = () => [...stage.querySelectorAll<HTMLButtonElement>('.option')];
    const showDemo = () => demo.run([stage.querySelector('.pick__prompt')!, stage.querySelector('.pick__options')!]);

    function renderRound(i: number) {
      const r = rounds[i];
      dots.forEach((d, j) => d.classList.toggle('is-current', j === i));
      stage.innerHTML = `<div class="pick__prompt mfb-card" aria-label="${esc(cardLabel(r.prompt))}">${card(r.prompt)}</div>
        <div class="pick__options pick__options--${r.options.length}" role="group" aria-label="Opções">
          ${r.options.map((o, j) => `<button type="button" class="option pick-card" data-i="${j}" aria-label="${esc(cardLabel(o))}">${card(o)}</button>`).join('')}
        </div>`;
      rabbitBox.innerHTML = rabbit('waiting');
    }

    function apply(e: PickEffect) {
      const o = options()[e.option];
      switch (e.type) {
        case 'discarded':
          o.classList.add('is-discarded');
          o.disabled = true;
          nudge(o);
          nudge(rabbitBox, 'is-thinking');
          break;
        case 'autoHelp':
          o.classList.add('is-hint');
          hooks.onHelp();
          break;
        case 'answered':
          demo.cancel();
          options().forEach((b) => (b.disabled = true));
          if (test) o.classList.add('is-picked');
          else {
            o.classList.add('is-right');
            rabbitBox.innerHTML = rabbit('celebrating');
          }
          break;
        case 'roundDone':
          timer = window.setTimeout(() => renderRound(e.next), test ? 450 : reducedMotion() ? 500 : 1000);
          break;
        case 'completed':
          dots.forEach((d) => d.classList.add('is-done'));
          rabbitBox.innerHTML = rabbit('celebrating');
          el.classList.add('is-complete');
          timer = window.setTimeout(() => hooks.onComplete(test ? { right: e.right, total: e.total } : undefined), reducedMotion() ? 700 : 1600);
          break;
      }
    }

    stage.addEventListener('click', (ev) => {
      const o = (ev.target as Element).closest<HTMLButtonElement>('.option');
      if (!o || o.disabled) return;
      const round = state.round;
      const r = reduce(state, { type: 'choose', option: Number(o.dataset.i) });
      state = r.state;
      if (r.effects.some((e) => e.type === 'answered')) dots[round].classList.add('is-done');
      r.effects.forEach(apply);
    });

    renderRound(0);
    if (hooks.demoFirst && !test) {
      requestAnimationFrame(showDemo);
      hooks.onDemoSeen();
    }

    return {
      help() {
        if (state.completed || test) return;
        hooks.onHelp();
        showDemo();
      },
      destroy() {
        demo.cancel();
        clearTimeout(timer);
      },
    };
  },

  result: (m) => `<div class="result-art result-art--cards">${m.game.rounds.slice(0, 3).map((r) => `<span class="pick-card is-right">${card(r.options[r.answer])}</span>`).join('')}</div>`,
};
