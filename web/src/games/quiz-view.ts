// Tela do Quiz da sombra: "It's a ___" com a sombra do bicho; a criança escolhe o desenho.
import { img, rabbit } from '../art.ts';
import { esc, reducedMotion, shuffled } from '../ui.ts';
import { init, reduce, type ChoiceEffect } from './choice.ts';
import { createDemo, nudge } from './demo.ts';
import type { GameModule } from './types.ts';

export const quizGame: GameModule<'quiz'> = {
  play(root, mission, hooks) {
    const g = mission.game;
    const answer = g.options.find((o) => o.word === g.answer)!;
    let state = init(g.answer);

    root.innerHTML = `<div class="quiz game">
      <div class="quiz__sentence mfb-card" aria-label="Frase">
        <span class="quiz__frame">${esc(g.frame)}</span>
        <span class="quiz__blank">${img(answer.art, 'silhouette')}</span>
      </div>
      <div class="quiz__options" role="group" aria-label="Opções">
        ${shuffled(g.options).map((o) => `<button type="button" class="option" data-word="${esc(o.word)}">
            ${img(o.art)}<span class="option__word">${esc(o.word)}</span></button>`).join('')}
      </div>
      <div class="game-rabbit">${rabbit('waiting')}</div>
    </div>`;

    const el = root.querySelector<HTMLElement>('.quiz')!;
    const blank = el.querySelector<HTMLElement>('.quiz__blank')!;
    const options = [...el.querySelectorAll<HTMLButtonElement>('.option')];
    const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
    const demo = createDemo(el);
    let completeTimer = 0;
    const optionFor = (word: string) => options.find((o) => o.dataset.word === word)!;
    // A demonstração mostra o gesto (olhar a sombra, tocar numa opção) sem apontar a resposta.
    const showDemo = () => demo.run([blank, el.querySelector('.quiz__options')!]);

    function apply(effect: ChoiceEffect) {
      switch (effect.type) {
        case 'discarded': {
          const o = optionFor(effect.option);
          o.classList.add('is-discarded');
          o.disabled = true;
          nudge(o);
          nudge(rabbitBox, 'is-thinking');
          break;
        }
        case 'autoHelp':
          optionFor(effect.option).classList.add('is-hint');
          hooks.onHelp();
          break;
        case 'completed':
          demo.cancel();
          blank.innerHTML = `${img(answer.art)}`;
          blank.classList.add('is-filled');
          blank.insertAdjacentHTML('afterend', `<span class="quiz__answer word">${esc(answer.word)}</span>`);
          optionFor(effect.option).classList.add('is-right');
          rabbitBox.innerHTML = rabbit('celebrating');
          completeTimer = window.setTimeout(hooks.onComplete, reducedMotion() ? 700 : 1800);
          break;
      }
    }

    el.addEventListener('click', (e) => {
      const o = (e.target as Element).closest<HTMLButtonElement>('.option');
      if (!o || o.disabled) return;
      const r = reduce(state, { type: 'choose', option: o.dataset.word! });
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

  result: (m) => `<div class="result-art result-art--word">${img(m.game.options.find((o) => o.word === m.game.answer)!.art)}</div>`,
};
