// Montar a palavra: o bicho na tela e as letras como peças de quebra-cabeça espalhadas.
import { img } from '../art.ts';
import { playJigsaw } from './jigsaw-view.ts';
import type { GameModule } from './types.ts';

export const spellingGame: GameModule<'spelling'> = {
  play: (root, mission, hooks) =>
    playJigsaw(root, {
      kind: 'spelling',
      art: mission.game.art,
      hooks,
      pieces: [...mission.game.word].map((l, i) => ({ face: `<span class="jig-letter">${l}</span>`, label: `Peça ${i + 1}: letra ${l}`, width: 66 })),
    }),

  result: (m) => `<div class="result-art result-art--word">${img(m.game.art)}</div>`,
};
