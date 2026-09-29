import { describe, expect, it } from 'vitest';
import { init, reduce, type ColorsEvent, type ColorsState } from './colors.ts';

const game = { drawing: 'frog', paints: ['leaf', 'coral'] as const, target: 'leaf' as const };
const start = () => init({ ...game, paints: [...game.paints] }, () => 0.99);

function run(events: ColorsEvent[], state: ColorsState = start()) {
  const effects = [];
  for (const e of events) {
    const r = reduce(state, e);
    state = r.state;
    effects.push(...r.effects);
  }
  return { state, effects };
}

const pick = (paint: 'leaf' | 'coral' | 'sky'): ColorsEvent => ({ type: 'selectPaint', paint });
const tap: ColorsEvent = { type: 'tapDrawing' };

describe('jogo de Cores', () => {
  it('selecionar tinta destaca só ela e trocar não reinicia', () => {
    const { state, effects } = run([pick('coral'), pick('leaf')]);
    expect(state.selected).toBe('leaf');
    expect(effects.map((e) => e.type)).toEqual(['selected', 'selected']);
    expect(state.completed).toBe(false);
  });

  it('ignora tinta que não está na missão', () => {
    expect(run([pick('sky')]).state.selected).toBeNull();
  });

  it('cor do modelo aplicada conclui', () => {
    const { state, effects } = run([pick('leaf'), tap]);
    expect(state).toMatchObject({ applied: 'leaf', completed: true });
    expect(effects.at(-1)).toEqual({ type: 'completed' });
  });

  it('cor diferente vira prévia, não conclui, e pode ser corrigida', () => {
    const errado = run([pick('coral'), tap]);
    expect(errado.state).toMatchObject({ applied: 'coral', completed: false, wrongStreak: 1 });
    expect(errado.effects.at(-1)).toEqual({ type: 'preview', paint: 'coral' });
    const corrigido = run([pick('leaf'), tap], errado.state);
    expect(corrigido.state).toMatchObject({ applied: 'leaf', completed: true });
  });

  it('tocar no desenho sem tinta não é tentativa', () => {
    const { state, effects } = run([tap]);
    expect(effects).toEqual([{ type: 'noPaint' }]);
    expect(state.wrongStreak).toBe(0);
  });

  it('uma aplicação errada não aciona ajuda; duas seguidas acionam destacando a tinta certa', () => {
    expect(run([pick('coral'), tap]).effects.some((e) => e.type === 'autoHelp')).toBe(false);
    const { state, effects } = run([pick('coral'), tap, tap]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', paint: 'leaf' });
    expect(state.completed).toBe(false);
    expect(state.wrongStreak).toBe(0);
  });

  it('selecionar tinta entre aplicações erradas não zera a sequência (só aplicar conta)', () => {
    const { effects } = run([pick('coral'), tap, pick('leaf'), pick('coral'), tap]);
    expect(effects.at(-1)).toEqual({ type: 'autoHelp', paint: 'leaf' });
  });

  it('toque duplo com a cor certa conclui uma única vez e ignora eventos depois', () => {
    const { effects, state } = run([pick('leaf'), tap, tap, pick('coral'), tap]);
    expect(effects.filter((e) => e.type === 'completed')).toHaveLength(1);
    expect(state.applied).toBe('leaf');
  });

  it('a ordem das tintas varia com o sorteio mantendo o conjunto', () => {
    const a = init({ ...game, paints: [...game.paints] }, () => 0.99).paints;
    const b = init({ ...game, paints: [...game.paints] }, () => 0).paints;
    expect(a).not.toEqual(b);
    expect([...a].sort()).toEqual([...b].sort());
  });
});
