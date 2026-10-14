import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { isPlayable, validateContent } from '../../../shared/content.ts';
import { games, missionIconKey } from './index.ts';

it('toda missão jogável do conteúdo real resolve para um jogo e um ícone', () => {
  const data = JSON.parse(readFileSync(new URL('../../public/content/missions.json', import.meta.url), 'utf8'));
  const playable = validateContent(data).missions.filter(isPlayable);
  expect(playable.length).toBeGreaterThan(80);
  for (const m of playable) {
    expect(games[m.type], m.id).toBeDefined();
    expect(missionIconKey(m), m.id).toBeTruthy();
  }
});
