import { describe, expect, it } from 'vitest';
import * as choice from './choice.ts';
import * as sequence from './sequence.ts';

function run<S, E, F>(reduce: (s: S, e: E) => { state: S; effects: F[] }, state: S, events: E[]) {
  const effects: F[] = [];
  for (const e of events) {
    const r = reduce(state, e);
    state = r.state;
    effects.push(...r.effects);
  }
  return { state, effects };
}

const tap = (key: string): sequence.SequenceEvent => ({ type: 'tap', key });
const build = (keys: string[], events: sequence.SequenceEvent[]) => run(sequence.reduce, sequence.init(keys), events);

describe('Montar a frase / a palavra', () => {
  it('a peça do próximo espaço encaixa e avança', () => {
    const { state, effects } = build(["It's", 'a', 'bee'], [tap("It's")]);
    expect(effects).toEqual([{ type: 'placed', index: 0, key: "It's" }]);
    expect(state.next).toBe(1);
  });

  it('peça de outro espaço é inválida e não tira peças encaixadas', () => {
    const { state, effects } = build(["It's", 'a', 'bee'], [tap("It's"), tap('bee')]);
    expect(effects.at(-1)).toEqual({ type: 'invalid', key: 'bee' });
    expect(state.next).toBe(1);
  });

  it('letras repetidas são intercambiáveis (BEE)', () => {
    const { state } = build(['B', 'E', 'E'], [tap('B'), tap('E'), tap('E')]);
    expect(state.completed).toBe(true);
  });

  it('duas inválidas seguidas indicam a peça certa; um acerto zera', () => {
    const help = build(['F', 'R', 'O', 'G'], [tap('F'), tap('G'), tap('O')]);
    expect(help.effects.at(-1)).toEqual({ type: 'autoHelp', key: 'R' });
    const reset = build(['F', 'R', 'O', 'G'], [tap('G'), tap('F'), tap('G')]);
    expect(reset.effects.some((e) => e.type === 'autoHelp')).toBe(false);
  });

  it('conclui uma única vez e ignora toques depois', () => {
    const { effects } = build(["It's", 'a', 'frog'], [tap("It's"), tap('a'), tap('frog'), tap('frog')]);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
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
