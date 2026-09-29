// Regras do jogo de Caminhos, sem DOM: só a próxima pedra faz o coelho avançar.

export interface PathsState {
  stones: number;
  /** Índice da próxima pedra a tocar; igual a `stones` quando chegou. */
  next: number;
  wrongStreak: number;
  completed: boolean;
}

export type PathsEvent = { type: 'tapStone'; index: number };

export type PathsEffect =
  | { type: 'advance'; index: number }
  | { type: 'invalid'; index: number } // pedra à frente, fora de ordem
  | { type: 'autoHelp'; index: number } // duas inválidas seguidas: reforça a próxima
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export const init = (stones: number): PathsState => ({ stones, next: 0, wrongStreak: 0, completed: false });

export function reduce(state: PathsState, event: PathsEvent): { state: PathsState; effects: PathsEffect[] } {
  const i = event.index;
  // Concluído, pedra já alcançada ou índice inexistente: nada acontece e não é tentativa.
  if (state.completed || i < state.next || i >= state.stones) return { state, effects: [] };

  if (i === state.next) {
    const next = i + 1;
    const completed = next === state.stones;
    const effects: PathsEffect[] = [{ type: 'advance', index: i }];
    if (completed) effects.push({ type: 'completed' });
    return { state: { ...state, next, wrongStreak: 0, completed }, effects };
  }

  const wrongStreak = state.wrongStreak + 1;
  const effects: PathsEffect[] = [{ type: 'invalid', index: i }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', index: state.next });
  return { state: { ...state, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
