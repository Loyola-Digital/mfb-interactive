// Regras do quebra-cabeça (palavra ou frase), sem DOM.
// Cada peça tem um formato único e só encaixa no espaço com o mesmo formato (peça i → espaço i), em qualquer ordem.

export interface JigsawState {
  filled: boolean[];
  wrongStreak: number;
  completed: boolean;
}

export type JigsawEvent = { type: 'place'; piece: number; slot: number };

export type JigsawEffect =
  | { type: 'placed'; piece: number }
  | { type: 'invalid'; piece: number; slot: number } // espaço errado: a peça volta
  | { type: 'autoHelp'; piece: number } // duas inválidas seguidas: mostra o espaço certo dessa peça
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export const init = (pieces: number): JigsawState => ({ filled: Array(pieces).fill(false), wrongStreak: 0, completed: false });

export function reduce(state: JigsawState, event: JigsawEvent): { state: JigsawState; effects: JigsawEffect[] } {
  const { piece, slot } = event;
  const n = state.filled.length;
  // Concluído, índice inexistente, peça já encaixada ou espaço já ocupado: nada acontece e não é tentativa.
  if (state.completed || piece < 0 || piece >= n || slot < 0 || slot >= n || state.filled[piece] || state.filled[slot]) {
    return { state, effects: [] };
  }

  if (piece === slot) {
    const filled = state.filled.map((f, i) => f || i === slot);
    const completed = filled.every(Boolean);
    const effects: JigsawEffect[] = [{ type: 'placed', piece }];
    if (completed) effects.push({ type: 'completed' });
    return { state: { filled, wrongStreak: 0, completed }, effects };
  }

  const wrongStreak = state.wrongStreak + 1;
  const effects: JigsawEffect[] = [{ type: 'invalid', piece, slot }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', piece });
  return { state: { ...state, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
