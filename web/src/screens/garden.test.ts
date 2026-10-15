import { describe, expect, it } from 'vitest';
import type { Chapter, Mission } from '../../../shared/content.ts';
import { gardenPages } from './garden.ts';

const chapter = (title: string, n: number, tests = 0): Chapter => ({
  title,
  missions: [
    ...Array.from({ length: n }, (_, i) => ({ id: `${title}-${i}` }) as Mission),
    ...Array.from({ length: tests }, (_, i) => ({ id: `${title}-P${i}`, test: true }) as Mission),
  ],
});

describe('telas do jardim', () => {
  it('uma tela por capítulo, sem provas; capítulo grande vira telas do mesmo tamanho', () => {
    const pages = gardenPages([chapter('A', 2, 1), chapter('B', 6), chapter('C', 9), chapter('D', 13), chapter('E', 0, 1)]);
    expect(pages.map((p) => `${p.title}${p.missions.length}`)).toEqual(['A2', 'B6', 'C5', 'C4', 'D5', 'D5', 'D3']);
    expect(pages.flatMap((p) => p.missions).some((m) => m.test)).toBe(false);
  });
});
