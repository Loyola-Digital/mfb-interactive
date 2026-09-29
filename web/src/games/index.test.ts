import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { isPlayable, validateMissions } from '../../../shared/content.ts';
import { games } from './index.ts';

it('toda missão jogável do conteúdo real resolve para um jogo', () => {
  const data = JSON.parse(readFileSync(new URL('../../public/content/missions.json', import.meta.url), 'utf8'));
  const playable = validateMissions(data).filter(isPlayable);
  expect(playable).toHaveLength(13);
  for (const m of playable) expect(games[m.type], m.id).toBeDefined();
});
