// Regras do jogo de Quantidades, sem DOM: pegar uma tulipa no cesto e plantar uma por cova.

export interface QuantitiesState {
  filled: boolean[];
  holding: boolean;
  wrongStreak: number;
  completed: boolean;
}

export type QuantitiesEvent = { type: 'tapBasket' } | { type: 'tapSlot'; index: number };

export type QuantitiesEffect =
  | { type: 'picked' }
  | { type: 'planted'; index: number }
  | { type: 'emptyHand' } // tocou na cova sem tulipa: dica, não é tentativa
  | { type: 'invalid'; index: number } // cova já ocupada
  | { type: 'autoHelp'; index: number } // duas inválidas seguidas: indica a próxima cova vazia
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export const init = (slots: number): QuantitiesState => ({ filled: Array(slots).fill(false), holding: false, wrongStreak: 0, completed: false });

export function reduce(state: QuantitiesState, event: QuantitiesEvent): { state: QuantitiesState; effects: QuantitiesEffect[] } {
  if (state.completed) return { state, effects: [] };

  if (event.type === 'tapBasket') {
    if (state.holding) return { state, effects: [] };
    return { state: { ...state, holding: true }, effects: [{ type: 'picked' }] };
  }

  const i = event.index;
  if (i < 0 || i >= state.filled.length) return { state, effects: [] };
  if (!state.holding) return { state, effects: [{ type: 'emptyHand' }] };

  if (state.filled[i]) {
    const wrongStreak = state.wrongStreak + 1;
    const effects: QuantitiesEffect[] = [{ type: 'invalid', index: i }];
    if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', index: state.filled.indexOf(false) });
    return { state: { ...state, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
  }

  const filled = state.filled.map((f, j) => f || j === i);
  const completed = filled.every(Boolean);
  const effects: QuantitiesEffect[] = [{ type: 'planted', index: i }];
  if (completed) effects.push({ type: 'completed' });
  return { state: { filled, holding: false, wrongStreak: 0, completed }, effects };
}
