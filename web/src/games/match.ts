// Regras do Ligar, sem DOM. O par i liga a carta i da esquerda à carta i da direita.

export type Side = 'a' | 'b';

export interface MatchState {
  matched: boolean[];
  selected: { side: Side; pair: number } | null;
  wrongStreak: number;
  completed: boolean;
}

export type MatchEvent = { type: 'tap'; side: Side; pair: number };

export type MatchEffect =
  | { type: 'selected'; side: Side; pair: number | null }
  | { type: 'paired'; pair: number }
  | { type: 'mismatch'; a: number; b: number }
  | { type: 'autoHelp'; pair: number }
  | { type: 'completed' };

export const WRONG_BEFORE_HELP = 2;

export const init = (pairs: number): MatchState => ({ matched: Array(pairs).fill(false), selected: null, wrongStreak: 0, completed: false });

export function reduce(state: MatchState, event: MatchEvent): { state: MatchState; effects: MatchEffect[] } {
  const { side, pair } = event;
  if (state.completed || state.matched[pair]) return { state, effects: [] };
  const sel = state.selected;
  // Primeira carta, ou outra carta do mesmo lado: só troca a seleção. Tocar de novo na mesma solta.
  if (!sel || sel.side === side) {
    const same = sel?.side === side && sel.pair === pair;
    return { state: { ...state, selected: same ? null : { side, pair } }, effects: [{ type: 'selected', side, pair: same ? null : pair }] };
  }
  if (sel.pair === pair) {
    const matched = state.matched.map((m, i) => m || i === pair);
    const completed = matched.every(Boolean);
    const effects: MatchEffect[] = [{ type: 'paired', pair }];
    if (completed) effects.push({ type: 'completed' });
    return { state: { matched, selected: null, wrongStreak: 0, completed }, effects };
  }
  const [a, b] = sel.side === 'a' ? [sel.pair, pair] : [pair, sel.pair];
  const wrongStreak = state.wrongStreak + 1;
  const effects: MatchEffect[] = [{ type: 'mismatch', a, b }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', pair: sel.pair });
  return { state: { ...state, selected: null, wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
