import { describe, expect, it } from 'vitest';
import * as choice from './choice.ts';
import * as jigsaw from './jigsaw.ts';

function run<S, E, F>(reduce: (s: S, e: E) => { state: S; effects: F[] }, state: S, events: E[]) {
  const effects: F[] = [];
  for (const e of events) {
    const r = reduce(state, e);
    state = r.state;
    effects.push(...r.effects);
  }
  return { state, effects };
}

const place = (piece: number, slot: number): jigsaw.JigsawEvent => ({ type: 'place', piece, slot });
const puzzle = (n: number, events: jigsaw.JigsawEvent[]) => run(jigsaw.reduce, jigsaw.init(n), events);

describe('Quebra-cabeça (palavra e frase)', () => {
  it('a peça encaixa só no espaço do seu formato, em qualquer ordem', () => {
    const { state, effects } = puzzle(4, [place(2, 2), place(0, 0)]);
    expect(effects).toEqual([{ type: 'placed', piece: 2 }, { type: 'placed', piece: 0 }]);
    expect(state.filled).toEqual([true, false, true, false]);
  });

  it('espaço errado é inválido e não encaixa', () => {
    const { state, effects } = puzzle(4, [place(1, 3)]);
    expect(effects).toEqual([{ type: 'invalid', piece: 1, slot: 3 }]);
    expect(state.filled.some(Boolean)).toBe(false);
  });

  it('peça já encaixada, espaço ocupado e índices inexistentes não contam como tentativa', () => {
    const { state, effects } = puzzle(3, [place(0, 0), place(0, 1), place(1, 0), place(5, 5), place(-1, 0)]);
    expect(effects.filter((e) => e.type === 'invalid')).toHaveLength(0);
    expect(state.wrongStreak).toBe(0);
  });

  it('duas inválidas seguidas mostram o espaço certo da peça; um encaixe zera a sequência', () => {
    expect(puzzle(3, [place(1, 2), place(2, 0)]).effects.at(-1)).toEqual({ type: 'autoHelp', piece: 2 });
    expect(puzzle(3, [place(1, 2), place(0, 0), place(2, 1)]).effects.some((e) => e.type === 'autoHelp')).toBe(false);
  });

  it('conclui uma única vez quando todas as peças encaixam', () => {
    const { state, effects } = puzzle(3, [place(2, 2), place(0, 0), place(1, 1), place(1, 1)]);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
    expect(state.completed).toBe(true);
  });
});

const choose = (option: string): choice.ChoiceEvent => ({ type: 'choose', option });
const quiz = (events: choice.ChoiceEvent[]) => run(choice.reduce, choice.init('bee'), events);

describe('Quiz da sombra', () => {
  it('opção certa conclui uma única vez', () => {
    const { state, effects } = quiz([choose('bee'), choose('bee')]);
    expect(effects).toEqual([{ type: 'completed', option: 'bee' }]);
    expect(state.completed).toBe(true);
  });

  it('opção errada é descartada, conta uma vez e deixa tentar de novo', () => {
    const { state, effects } = quiz([choose('frog'), choose('frog')]);
    expect(effects).toEqual([{ type: 'discarded', option: 'frog' }]);
    expect(state).toMatchObject({ discarded: ['frog'], completed: false });
    expect(quiz([choose('frog'), choose('bee')]).state.completed).toBe(true);
  });

  it('duas erradas seguidas destacam a certa sem escolhê-la', () => {
    const { state, effects } = quiz([choose('frog'), choose('rabbit')]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', option: 'bee' });
    expect(state.completed).toBe(false);
  });
});
