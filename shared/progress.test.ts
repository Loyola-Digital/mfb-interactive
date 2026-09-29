import { describe, expect, it } from 'vitest';
import { aggregate, isValidEvent, uuid, type ProgressEvent } from './progress.ts';

let n = 0;
const ev = (type: ProgressEvent['type'], attemptId: string | null = null, extra: Partial<ProgressEvent> = {}): ProgressEvent => ({
  id: `evento-${++n}`,
  type,
  missionId: type === 'welcomeSeen' ? null : 'M03',
  attemptId,
  at: n,
  ...extra,
});

describe('aggregate', () => {
  it('concluir com ajuda na mesma tentativa marca concluída e com ajuda, não pulada', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('help', 'tent-0001'), ev('completed', 'tent-0001')]);
    expect(p.missions.M03).toMatchObject({ completed: true, completedWithHelp: true, skips: 0, plays: 1, helpCount: 1 });
  });

  it('ajuda em outra tentativa não marca a conclusão como com ajuda', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('completed', 'tent-0001'), ev('started', 'tent-0002'), ev('help', 'tent-0002')]);
    expect(p.missions.M03).toMatchObject({ completed: true, completedWithHelp: false, plays: 2, helpCount: 1 });
  });

  it('pular depois de concluir mantém concluída e registra o pulo', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('completed', 'tent-0001'), ev('started', 'tent-0002'), ev('skipped', 'tent-0002')]);
    expect(p.missions.M03).toMatchObject({ completed: true, skips: 1 });
  });

  it('pular sem concluir não conta como concluída', () => {
    const p = aggregate([ev('started', 'tent-0001'), ev('skipped', 'tent-0001')]);
    expect(p.missions.M03).toMatchObject({ completed: false, skips: 1 });
  });

  it('eventos de dois aparelhos se somam, em qualquer ordem', () => {
    const celular = [ev('started', 'tent-cel1'), ev('completed', 'tent-cel1')];
    const tablet = [ev('started', 'tent-tab1'), ev('skipped', 'tent-tab1')];
    expect(aggregate([...tablet, ...celular]).missions.M03).toMatchObject({ completed: true, skips: 1, plays: 2 });
  });

  it('evento repetido pelo mesmo id conta uma vez', () => {
    const e = ev('started', 'tent-0001');
    expect(aggregate([e, e, { ...e }]).missions.M03.plays).toBe(1);
  });

  it('boas-vindas e demonstração vista', () => {
    const p = aggregate([ev('welcomeSeen'), ev('demoSeen')]);
    expect(p.welcomeSeen).toBe(true);
    expect(p.missions.M03.demoSeen).toBe(true);
  });

  it('sem eventos devolve progresso vazio', () => {
    expect(aggregate([])).toEqual({ welcomeSeen: false, missions: {} });
  });
});

describe('isValidEvent', () => {
  it('aceita evento bem formado e recusa malformados', () => {
    const ok = { id: uuid(), type: 'started', missionId: 'M03', attemptId: uuid(), at: Date.now() };
    expect(isValidEvent(ok)).toBe(true);
    expect(isValidEvent({ ...ok, type: 'hack' })).toBe(false);
    expect(isValidEvent({ ...ok, missionId: 'X' })).toBe(false);
    expect(isValidEvent({ ...ok, missionId: null })).toBe(false);
    expect(isValidEvent({ ...ok, type: 'welcomeSeen', missionId: null })).toBe(true);
    expect(isValidEvent({ ...ok, id: 'x' })).toBe(false);
    expect(isValidEvent({ ...ok, at: 'ontem' })).toBe(false);
    expect(isValidEvent(null)).toBe(false);
  });
});
