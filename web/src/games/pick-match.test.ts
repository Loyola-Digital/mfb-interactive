import { describe, expect, it } from 'vitest';
import { suggest } from '../screens/placement.ts';
import * as match from './match.ts';
import * as pick from './pick.ts';

const play = <S, E, F>(reduce: (s: S, e: E) => { state: S; effects: F[] }, state: S, events: E[]) => {
  const effects: F[] = [];
  for (const e of events) {
    const r = reduce(state, e);
    state = r.state;
    effects.push(...r.effects);
  }
  return { state, effects };
};
const choose = (option: number) => ({ type: 'choose' as const, option });

describe('Escolher', () => {
  it('certa passa de rodada; a última conclui uma única vez', () => {
    const { state, effects } = play(pick.reduce, pick.init([1, 0]), [choose(1), choose(0), choose(0)]);
    expect(effects.map((e) => e.type)).toEqual(['answered', 'roundDone', 'answered', 'completed']);
    expect(state.completed).toBe(true);
  });

  it('errada descarta, não conta de novo e dois erros destacam a certa', () => {
    const { effects } = play(pick.reduce, pick.init([2, 0]), [choose(0), choose(0), choose(1)]);
    expect(effects).toEqual([{ type: 'discarded', option: 0 }, { type: 'discarded', option: 1 }, { type: 'autoHelp', option: 2 }]);
  });

  it('na prova a primeira escolha vale, sem descarte nem ajuda, e conta os acertos', () => {
    const { effects } = play(pick.reduce, pick.init([1, 0, 2], true), [choose(0), choose(0), choose(1)]);
    expect(effects.filter((e) => e.type === 'discarded' || e.type === 'autoHelp')).toEqual([]);
    expect(effects.at(-1)).toEqual({ type: 'completed', option: 1, right: 1, total: 3 });
  });
});

describe('Ligar', () => {
  const tap = (side: match.Side, pair: number) => ({ type: 'tap' as const, side, pair });

  it('par certo liga e trava; todos ligados conclui uma vez', () => {
    const { state, effects } = play(match.reduce, match.init(2), [tap('a', 0), tap('b', 0), tap('b', 0), tap('b', 1), tap('a', 1), tap('a', 1)]);
    expect(effects.filter((e) => e.type === 'paired')).toHaveLength(2);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
    expect(state.completed).toBe(true);
  });

  it('mesmo lado só troca a seleção; dois erros seguidos destacam o par certo', () => {
    const { effects } = play(match.reduce, match.init(3), [tap('a', 0), tap('a', 1), tap('b', 0), tap('a', 2), tap('b', 1)]);
    expect(effects.filter((e) => e.type === 'mismatch')).toEqual([{ type: 'mismatch', a: 1, b: 0 }, { type: 'mismatch', a: 2, b: 1 }]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', pair: 2 });
  });
});

describe('alinhamento', () => {
  const levels = ['CO1', 'CO2', 'EX1'] as const;
  it('sugere o nível em que a criança parou, ou o último se passou em todos', () => {
    expect(suggest([...levels], [4, 1])).toBe('CO2');
    expect(suggest([...levels], [2])).toBe('CO1');
    expect(suggest([...levels], [3, 3, 4])).toBe('EX1');
  });
});
