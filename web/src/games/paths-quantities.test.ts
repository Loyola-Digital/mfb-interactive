import { describe, expect, it } from 'vitest';
import * as paths from './paths.ts';
import * as quantities from './quantities.ts';

function run<S, E, F>(reduce: (s: S, e: E) => { state: S; effects: F[] }, state: S, events: E[]) {
  const effects: F[] = [];
  for (const e of events) {
    const r = reduce(state, e);
    state = r.state;
    effects.push(...r.effects);
  }
  return { state, effects };
}

const stone = (index: number): paths.PathsEvent => ({ type: 'tapStone', index });
const walk = (events: paths.PathsEvent[], state = paths.init(3)) => run(paths.reduce, state, events);

describe('jogo de Caminhos', () => {
  it('a próxima pedra avança o coelho e destaca a seguinte', () => {
    const { state, effects } = walk([stone(0)]);
    expect(effects).toEqual([{ type: 'advance', index: 0 }]);
    expect(state.next).toBe(1);
  });

  it('pedra fora de ordem é inválida e não muda o progresso', () => {
    const { state, effects } = walk([stone(0), stone(2)]);
    expect(effects.at(-1)).toEqual({ type: 'invalid', index: 2 });
    expect(state.next).toBe(1);
  });

  it('pedra já alcançada e índice inexistente não contam como tentativa', () => {
    const { state, effects } = walk([stone(0), stone(1), stone(0), stone(-1), stone(9)]);
    expect(effects.filter((e) => e.type === 'invalid')).toHaveLength(0);
    expect(state.wrongStreak).toBe(0);
  });

  it('duas inválidas seguidas reforçam a próxima pedra sem avançar', () => {
    const { state, effects } = walk([stone(0), stone(2), stone(2)]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', index: 1 });
    expect(state.next).toBe(1);
  });

  it('um avanço válido zera a sequência de erros', () => {
    const { effects } = walk([stone(2), stone(0), stone(2)]);
    expect(effects.some((e) => e.type === 'autoHelp')).toBe(false);
  });

  it('a última pedra conclui uma única vez e toques depois são ignorados', () => {
    const { state, effects } = walk([stone(0), stone(1), stone(2), stone(2), stone(1)]);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
    expect(effects.filter((e) => e.type === 'advance')).toHaveLength(3);
    expect(state.completed).toBe(true);
  });
});

const basket: quantities.QuantitiesEvent = { type: 'tapBasket' };
const slot = (index: number): quantities.QuantitiesEvent => ({ type: 'tapSlot', index });
const plant = (events: quantities.QuantitiesEvent[], state = quantities.init(2)) => run(quantities.reduce, state, events);

describe('jogo de Quantidades', () => {
  it('pegar no cesto e tocar na cova vazia planta uma tulipa e esvazia a mão', () => {
    const { state, effects } = plant([basket, slot(0)]);
    expect(effects).toEqual([{ type: 'picked' }, { type: 'planted', index: 0 }]);
    expect(state).toMatchObject({ filled: [true, false], holding: false });
  });

  it('cova sem tulipa na mão é dica, não tentativa', () => {
    const { state, effects } = plant([slot(0)]);
    expect(effects).toEqual([{ type: 'emptyHand' }]);
    expect(state.wrongStreak).toBe(0);
  });

  it('cova ocupada com tulipa na mão é inválida e não planta outra', () => {
    const { state, effects } = plant([basket, slot(0), basket, slot(0)]);
    expect(effects.at(-1)).toEqual({ type: 'invalid', index: 0 });
    expect(state).toMatchObject({ filled: [true, false], holding: true });
  });

  it('toque duplo na mesma cova planta exatamente uma tulipa', () => {
    const { state, effects } = plant([basket, slot(1), slot(1)]);
    expect(effects.filter((e) => e.type === 'planted')).toHaveLength(1);
    expect(effects.at(-1)).toEqual({ type: 'emptyHand' });
    expect(state.filled).toEqual([false, true]);
  });

  it('duas inválidas seguidas indicam a próxima cova vazia', () => {
    const { state, effects } = plant([basket, slot(0), basket, slot(0), slot(0)]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', index: 1 });
    expect(state.completed).toBe(false);
  });

  it('conclui ao encher todas as covas, uma única vez', () => {
    const { state, effects } = plant([basket, slot(0), basket, slot(1), basket, slot(0)]);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
    expect(state.completed).toBe(true);
  });

  it('M05: uma cova conclui com uma tulipa', () => {
    const { state } = plant([basket, slot(0)], quantities.init(1));
    expect(state.completed).toBe(true);
  });
});
