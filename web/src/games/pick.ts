// Regras do Escolher, sem DOM: rodadas em sequência, cada uma com o redutor de escolha.
// Na prova, a primeira escolha é a resposta da rodada e só se contam os acertos.
import * as choice from './choice.ts';

export interface PickState {
  answers: number[];
  test: boolean;
  round: number;
  choice: choice.ChoiceState;
  right: number;
  completed: boolean;
}

export type PickEvent = { type: 'choose'; option: number };

export type PickEffect =
  | { type: 'discarded'; option: number }
  | { type: 'autoHelp'; option: number }
  | { type: 'answered'; option: number; correct: boolean }
  | { type: 'roundDone'; option: number; next: number }
  | { type: 'completed'; option: number; right: number; total: number };

const roundChoice = (answer: number) => choice.init(String(answer));

export const init = (answers: number[], test = false): PickState => ({
  answers, test, round: 0, choice: roundChoice(answers[0]), right: 0, completed: false,
});

export function reduce(state: PickState, event: PickEvent): { state: PickState; effects: PickEffect[] } {
  if (state.completed) return { state, effects: [] };
  const o = event.option;
  const last = state.round === state.answers.length - 1;
  const advance = (s: PickState, effects: PickEffect[]) => {
    if (last) return { state: { ...s, completed: true }, effects: [...effects, { type: 'completed' as const, option: o, right: s.right, total: s.answers.length }] };
    const next = s.round + 1;
    return { state: { ...s, round: next, choice: roundChoice(s.answers[next]) }, effects: [...effects, { type: 'roundDone' as const, option: o, next }] };
  };

  if (state.test) {
    const correct = o === state.answers[state.round];
    return advance({ ...state, right: state.right + (correct ? 1 : 0) }, [{ type: 'answered', option: o, correct }]);
  }

  const r = choice.reduce(state.choice, { type: 'choose', option: String(o) });
  if (r.effects.length === 0) return { state, effects: [] };
  const s = { ...state, choice: r.state };
  if (r.state.completed) return advance({ ...s, right: s.right + 1 }, [{ type: 'answered', option: o, correct: true }]);
  return {
    state: s,
    effects: r.effects.map((e) => (e.type === 'autoHelp' ? { type: 'autoHelp' as const, option: Number(e.option) } : { type: 'discarded' as const, option: Number(e.option) })),
  };
}
