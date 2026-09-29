// Regras de "próximo espaço" para montar frase e palavra, sem DOM.
// Válido é tocar numa peça cuja chave é a do próximo espaço; chaves repetidas (letras) são intercambiáveis.

export interface SequenceState {
  keys: string[];
  next: number;
  wrongStreak: number;
  completed: boolean;
}

export type SequenceEvent = { type: 'tap'; key: string };

export type SequenceEffect =
  | { type: 'placed'; index: number; key: string }
  | { type: 'invalid'; key: string }
  | { type: 'autoHelp'; key: string } // duas inválidas seguidas: indica uma peça certa
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export const init = (keys: string[]): SequenceState => ({ keys, next: 0, wrongStreak: 0, completed: false });

export function reduce(state: SequenceState, event: SequenceEvent): { state: SequenceState; effects: SequenceEffect[] } {
  if (state.completed) return { state, effects: [] };
  const expected = state.keys[state.next];

  if (event.key === expected) {
    const next = state.next + 1;
    const completed = next === state.keys.length;
    const effects: SequenceEffect[] = [{ type: 'placed', index: state.next, key: expected }];
    if (completed) effects.push({ type: 'completed' });
    return { state: { ...state, next, wrongStreak: 0, completed }, effects };
  }

  const wrongStreak = state.wrongStreak + 1;
  const effects: SequenceEffect[] = [{ type: 'invalid', key: event.key }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', key: expected });
  return { state: { ...state, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
