import { describe, expect, it } from 'vitest';
import { aggregate, isValidEvent, uuid, type ProgressEvent } from './progress.ts';

let n = 0;
const ev = (type: ProgressEvent['type'], attemptId: string | null = null, extra: Partial<ProgressEvent> = {}): ProgressEvent => ({
  id: `evento-${++n}`,
  type,
  missionId: type === 'welcomeSeen' ? null : 'CO1-03',
  attemptId,
  at: n,
  ...extra,
});

describe('aggregate', () => {
  it('concluir com ajuda na mesma tentativa marca concluída e com ajuda, não pulada', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('help', 'tent-0001'), ev('completed', 'tent-0001')]);
    expect(p.missions['CO1-03']).toMatchObject({ completed: true, completedWithHelp: true, skips: 0, plays: 1, helpCount: 1 });
  });

  it('ajuda em outra tentativa não marca a conclusão como com ajuda', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('completed', 'tent-0001'), ev('started', 'tent-0002'), ev('help', 'tent-0002')]);
    expect(p.missions['CO1-03']).toMatchObject({ completed: true, completedWithHelp: false, plays: 2, helpCount: 1 });
  });

  it('pular depois de concluir mantém concluída e registra o pulo', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('completed', 'tent-0001'), ev('started', 'tent-0002'), ev('skipped', 'tent-0002')]);
    expect(p.missions['CO1-03']).toMatchObject({ completed: true, skips: 1 });
  });

  it('pular sem concluir não conta como concluída', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('skipped', 'tent-0001')]);
    expect(p.missions['CO1-03']).toMatchObject({ completed: false, skips: 1 });
  });

  it('eventos de dois aparelhos se somam, em qualquer ordem', () => {
    const celular = [ev('started', 'tent-cel1'), ev('completed', 'tent-cel1')];
    const tablet = [ev('started', 'tent-tab1'), ev('skipped', 'tent-tab1')];
    expect(aggregate([...tablet, ...celular]).missions['CO1-03']).toMatchObject({ completed: true, skips: 1, plays: 2 });
  });

  it('evento repetido pelo mesmo id conta uma vez', () => {
    const e = ev('started', 'tent-0001');
    expect(aggregate([e, e, { ...e }]).missions['CO1-03'].plays).toBe(1);
  });

  it('boas-vindas e demonstração vista', () => {
    const p = aggregate([ev('welcomeSeen'), ev('demoSeen')]);
    expect(p.welcomeSeen).toBe(true);
    expect(p.missions['CO1-03'].demoSeen).toBe(true);
  });

  it('sem eventos devolve progresso vazio', () => {
    expect(aggregate([])).toEqual({ welcomeSeen: false, missions: {}, book: null, placement: null });
  });

  it('prova guarda o resultado da última vez pelo relógio e conta as vezes', () => {
    const p = aggregate([
      ev('completed', 'a', { at: 200, data: { right: 2, total: 6 } }),
      ev('completed', 'b', { at: 100, data: { right: 5, total: 6 } }),
    ]);
    expect(p.missions['CO1-03']).toMatchObject({ scored: 2, lastScore: { right: 2, total: 6 } });
  });

  it('apostila atual é o último bookChosen; sugestão é o último placement', () => {
    const p = aggregate([
      ev('bookChosen', null, { missionId: null, at: 300, data: { book: 'EX1' } }),
      ev('bookChosen', null, { missionId: null, at: 100, data: { book: 'CO1' } }),
      ev('placement', null, { missionId: null, at: 50, data: { book: 'CO2' } }),
    ]);
    expect(p).toMatchObject({ book: 'EX1', placement: 'CO2' });
  });
});

describe('isValidEvent', () => {
  it('aceita evento bem formado e recusa malformados', () => {
    const ok = { id: uuid(), type: 'started', missionId: 'CO1-03', attemptId: uuid(), at: Date.now() };
    expect(isValidEvent(ok)).toBe(true);
    expect(isValidEvent({ ...ok, type: 'hack' })).toBe(false);
    expect(isValidEvent({ ...ok, missionId: 'X' })).toBe(false);
    expect(isValidEvent({ ...ok, missionId: null })).toBe(false);
    expect(isValidEvent({ ...ok, type: 'welcomeSeen', missionId: null })).toBe(true);
    expect(isValidEvent({ ...ok, id: 'x' })).toBe(false);
    expect(isValidEvent({ ...ok, at: 'ontem' })).toBe(false);
    expect(isValidEvent(null)).toBe(false);
  });

  it('valida data: acertos só em completed, apostila só em placement e bookChosen', () => {
    const done = { id: uuid(), type: 'completed', missionId: 'CO1-P1', attemptId: uuid(), at: 1 };
    expect(isValidEvent({ ...done, data: { right: 3, total: 4 } })).toBe(true);
    expect(isValidEvent({ ...done, data: { right: 5, total: 4 } })).toBe(false);
    expect(isValidEvent({ ...done, data: { right: 1, total: 4, extra: 1 } })).toBe(false);
    expect(isValidEvent({ ...done, type: 'started', data: { right: 1, total: 4 } })).toBe(false);
    const choose = { id: uuid(), type: 'bookChosen', missionId: null, attemptId: null, at: 1 };
    expect(isValidEvent({ ...choose, data: { book: 'CO2' } })).toBe(true);
    expect(isValidEvent({ ...choose, data: { book: 'XX' } })).toBe(false);
    expect(isValidEvent(choose)).toBe(false);
    expect(isValidEvent({ ...choose, type: 'placement', missionId: 'CO1-01', data: { book: 'CO1' } })).toBe(false);
  });
});
