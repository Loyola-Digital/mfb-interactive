// Montar a frase: cada palavra é uma peça de quebra-cabeça; a última traz o desenho do bicho.
import { img } from '../art.ts';
import { esc } from '../ui.ts';
import { playJigsaw } from './jigsaw-view.ts';
import type { GameModule } from './types.ts';

export const sentenceGame: GameModule<'sentence'> = {
  play(root, mission, hooks) {
    const { words, art } = mission.game;
    const last = words.length - 1;
    return playJigsaw(root, {
      kind: 'sentence',
      art,
      hooks,
      pieces: words.map((w, i) => ({
        face: i === last ? `${img(art, 'jig-mini')}<span class="jig-word">${esc(w)}</span>` : `<span class="jig-word">${esc(w)}</span>`,
        label: `Peça ${i + 1}: ${w}`,
        width: i === last ? 100 : Math.max(70, 30 + w.length * 15),
      })),
    });
  },

  result: (m) => `<div class="result-art result-art--word">${img(m.game.art)}</div>`,
};
