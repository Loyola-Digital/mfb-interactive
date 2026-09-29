// Regras do quiz de escolha única, sem DOM. Opção errada fica descartada e não conta de novo.

export interface ChoiceState {
  answer: string;
  discarded: string[];
  wrongStreak: number;
  completed: boolean;
}

export type ChoiceEvent = { type: 'choose'; option: string };

export type ChoiceEffect =
  | { type: 'discarded'; option: string }
  | { type: 'autoHelp'; option: string }
  | { type: 'completed'; option: string };

export const WRONG_BEFORE_HELP = 2;

export const init = (answer: string): ChoiceState => ({ answer, discarded: [], wrongStreak: 0, completed: false });

export function reduce(state: ChoiceState, event: ChoiceEvent): { state: ChoiceState; effects: ChoiceEffect[] } {
  const o = event.option;
  if (state.completed || state.discarded.includes(o)) return { state, effects: [] };
  if (o === state.answer) return { state: { ...state, completed: true }, effects: [{ type: 'completed', option: o }] };

  const wrongStreak = state.wrongStreak + 1;
  const effects: ChoiceEffect[] = [{ type: 'discarded', option: o }];
  if (wrongStreak >= WRONG_BEFORE_HELP) effects.push({ type: 'autoHelp', option: state.answer });
  return { state: { ...state, discarded: [...state.discarded, o], wrongStreak: wrongStreak >= WRONG_BEFORE_HELP ? 0 : wrongStreak }, effects };
}
