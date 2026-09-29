// Regras do jogo de Cores, sem DOM. A tela traduz toques em eventos e reage aos efeitos.
import type { ColorsGame, Paint } from '../../../shared/content.ts';

export interface ColorsState {
  paints: Paint[];
  target: Paint;
  selected: Paint | null;
  /** Cor aplicada no desenho; se diferente do alvo, é prévia reversível. */
  applied: Paint | null;
  wrongStreak: number;
  completed: boolean;
}

export type ColorsEvent = { type: 'selectPaint'; paint: Paint } | { type: 'tapDrawing' };

export type ColorsEffect =
  | { type: 'selected'; paint: Paint }
  | { type: 'preview'; paint: Paint } // aplicação diferente do modelo = tentativa inválida
  | { type: 'noPaint' } // tocou no desenho sem tinta: não é tentativa
  | { type: 'autoHelp'; paint: Paint } // duas aplicações erradas seguidas
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export function init(game: ColorsGame, rng: () => number = Math.random): ColorsState {
  const paints = [...game.paints];
  for (let i = paints.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [paints[i], paints[j]] = [paints[j], paints[i]];
  }
  return { paints, target: game.target, selected: null, applied: null, wrongStreak: 0, completed: false };
}

export function reduce(state: ColorsState, event: ColorsEvent): { state: ColorsState; effects: ColorsEffect[] } {
  if (state.completed) return { state, effects: [] };

  if (event.type === 'selectPaint') {
    if (!state.paints.includes(event.paint)) return { state, effects: [] };
    return { state: { ...state, selected: event.paint }, effects: [{ type: 'selected', paint: event.paint }] };
  }

  const paint = state.selected;
  if (!paint) return { state, effects: [{ type: 'noPaint' }] };
  if (paint === state.target) {
    return { state: { ...state, applied: paint, wrongStreak: 0, completed: true }, effects: [{ type: 'completed' }] };
  }
  const wrongStreak = state.wrongStreak + 1;
  const effects: ColorsEffect[] = [{ type: 'preview', paint }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', paint: state.target });
  return { state: { ...state, applied: paint, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
