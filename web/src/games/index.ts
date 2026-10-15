import { isPlayable, type Mission, type PlayableMission } from '../../../shared/content.ts';
import { colorsGame } from './colors-view.ts';
import { matchGame } from './match-view.ts';
import { pathsGame } from './paths-view.ts';
import { pickGame } from './pick-view.ts';
import { quantitiesGame } from './quantities-view.ts';
import { quizGame } from './quiz-view.ts';
import { sentenceGame } from './sentence-view.ts';
import { spellingGame } from './spelling-view.ts';
import type { GameHandle, GameHooks } from './types.ts';

// Um módulo por tipo de jogo. Um tipo novo entra aqui e no esquema de conteúdo.
export const games = {
  colors: colorsGame,
  paths: pathsGame,
  quantities: quantitiesGame,
  sentence: sentenceGame,
  quiz: quizGame,
  spelling: spellingGame,
  pick: pickGame,
  match: matchGame,
};

export function playMission(root: HTMLElement, m: PlayableMission, hooks: GameHooks): GameHandle {
  switch (m.type) {
    case 'colors': return colorsGame.play(root, m, hooks);
    case 'paths': return pathsGame.play(root, m, hooks);
    case 'quantities': return quantitiesGame.play(root, m, hooks);
    case 'sentence': return sentenceGame.play(root, m, hooks);
    case 'quiz': return quizGame.play(root, m, hooks);
    case 'spelling': return spellingGame.play(root, m, hooks);
    case 'pick': return pickGame.play(root, m, hooks);
    case 'match': return matchGame.play(root, m, hooks);
  }
}

export function missionResult(m: PlayableMission): string {
  switch (m.type) {
    case 'colors': return colorsGame.result(m);
    case 'paths': return pathsGame.result(m);
    case 'quantities': return quantitiesGame.result(m);
    case 'sentence': return sentenceGame.result(m);
    case 'quiz': return quizGame.result(m);
    case 'spelling': return spellingGame.result(m);
    case 'pick': return pickGame.result(m);
    case 'match': return matchGame.result(m);
  }
}

/** Ícone do ponto no jardim: o da missão ou a primeira figura do jogo. */
export function missionIconKey(m: Mission): string {
  if (m.icon) return m.icon;
  if (!isPlayable(m)) return 'pedra';
  switch (m.type) {
    case 'colors': return m.game.drawing;
    case 'paths': return m.game.goalArt;
    case 'quantities': return 'tulipa';
    case 'sentence': case 'spelling': return m.game.art;
    case 'quiz': return m.game.options[0].art;
    case 'pick': {
      const c = [m.game.rounds[0].prompt, ...m.game.rounds[0].options].find((x) => x.art);
      const p = m.game.rounds[0].prompt;
      return c?.art ?? (p.shape ? `shape:${p.shape}` : `letras:${(p.text ?? '?').slice(0, 3)}`);
    }
    case 'match': return m.game.pairs.flat().find((x) => x.art)?.art ?? 'pedra';
  }
}
