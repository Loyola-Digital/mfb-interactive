import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateMissions, type PlayableMission } from './content.ts';

const texts = { bookRef: 'p. 26', goal: 'Objetivo.', word: 'green', meaning: 'verde', adultTip: 'Mostre o modelo.', offScreen: 'Procure algo.' };
const base = { version: 1, available: true, garden: { x: 50, y: 50 }, icon: 'sapo', ...texts };
const colors = { ...base, id: 'M03', type: 'colors', title: 'O sapinho verde', game: { drawing: 'sapo', paints: ['leaf', 'coral'], target: 'leaf' } };
const paths = {
  ...base, id: 'M01', type: 'paths', title: 'Caminho',
  game: { start: { x: 50, y: 90 }, points: [{ x: 50, y: 70 }, { x: 50, y: 50 }], goal: { x: 50, y: 10 }, goalArt: 'portao' },
};
const quantities = { ...base, id: 'M05', type: 'quantities', title: 'Uma flor', game: { slots: 1, numeral: '1' } };
const soon = { id: 'M09', version: 1, type: 'paths', title: 'Depois', available: false, garden: { x: 10, y: 80 }, icon: 'pedra' };

const ok = (...missions: unknown[]) => validateMissions({ missions });

describe('validateMissions', () => {
  it('aceita os três tipos jogáveis e missão "em breve"', () => {
    expect(ok(colors, paths, quantities, soon)).toHaveLength(4);
  });

  it('recusa missão jogável sem texto obrigatório ou sem ícone', () => {
    const { word: _w, ...semPalavra } = colors;
    expect(() => ok(semPalavra)).toThrow('word');
    const { icon: _i, ...semIcone } = colors;
    expect(() => ok(semIcone)).toThrow('icon');
  });

  it('Cores: recusa tinta-alvo fora das tintas e quantidade errada de tintas', () => {
    expect(() => ok({ ...colors, game: { ...colors.game, target: 'sky' } })).toThrow('target');
    expect(() => ok({ ...colors, game: { ...colors.game, paints: ['leaf'] } })).toThrow('paints');
  });

  it('Caminhos: recusa pontos de menos e coordenada fora da cena', () => {
    expect(() => ok({ ...paths, game: { ...paths.game, points: [{ x: 50, y: 50 }] } })).toThrow('points');
    expect(() => ok({ ...paths, game: { ...paths.game, goal: { x: 120, y: 10 } } })).toThrow('goal');
    expect(() => ok({ ...paths, game: { ...paths.game, goalArt: '' } })).toThrow('goalArt');
  });

  it('Quantidades: recusa número de covas inválido e numeral ausente', () => {
    expect(() => ok({ ...quantities, game: { slots: 0, numeral: '0' } })).toThrow('slots');
    expect(() => ok({ ...quantities, game: { slots: 1.5, numeral: '1' } })).toThrow('slots');
    expect(() => ok({ ...quantities, game: { slots: 1 } })).toThrow('numeral');
  });

  it('Frase, Quiz e Palavra: aceitam o formato certo e recusam o errado', () => {
    const sentence = { ...base, id: 'M07', type: 'sentence', title: 'Frase', game: { words: ["It's", 'a', 'bee'], art: 'abelha' } };
    const quiz = { ...base, id: 'M10', type: 'quiz', title: 'Quiz', game: { frame: "It's a", options: [{ word: 'bee', art: 'abelha' }, { word: 'frog', art: 'sapo' }], answer: 'bee' } };
    const spelling = { ...base, id: 'M12', type: 'spelling', title: 'Palavra', game: { word: 'BEE', art: 'abelha' } };
    expect(ok(sentence, quiz, spelling)).toHaveLength(3);
    expect(() => ok({ ...sentence, game: { words: ['bee'], art: 'abelha' } })).toThrow('words');
    expect(() => ok({ ...quiz, game: { ...quiz.game, answer: 'cat' } })).toThrow('answer');
    expect(() => ok({ ...quiz, game: { ...quiz.game, options: [{ word: 'bee' }] } })).toThrow('options');
    expect(() => ok({ ...spelling, game: { word: 'bee', art: 'abelha' } })).toThrow('maiúsculas');
  });

  it('recusa id repetido e formato sem lista', () => {
    expect(() => ok(colors, colors)).toThrow('repetido');
    expect(() => validateMissions([])).toThrow();
  });
});

describe('arquivo real de conteúdo', () => {
  const missions = validateMissions(JSON.parse(readFileSync(new URL('../web/public/content/missions.json', import.meta.url), 'utf8')));
  const byId = (id: string) => missions.find((m) => m.id === id) as PlayableMission;

  it('tem as 13 missões, todas jogáveis', () => {
    expect(missions.map((m) => m.id)).toEqual(Array.from({ length: 13 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`));
    expect(missions.every((m) => m.available)).toBe(true);
  });

  it('M07–M09 seguem a spec sentence-game', () => {
    for (const [id, animal, art] of [['M07', 'bee', 'abelha'], ['M08', 'frog', 'sapo'], ['M09', 'rabbit', 'coelho']]) {
      expect(byId(id)).toMatchObject({ type: 'sentence', game: { words: ["It's", 'a', animal], art } });
    }
  });

  it('M10 e M11 seguem a spec quiz-game', () => {
    const answers = { M10: 'bee', M11: 'rabbit' };
    for (const [id, answer] of Object.entries(answers)) {
      const m = byId(id);
      if (m.type !== 'quiz') throw new Error('tipo');
      expect(m.game.answer).toBe(answer);
      expect(m.game.options.map((o) => o.word).sort()).toEqual(['bee', 'frog', 'rabbit']);
    }
  });

  it('M12 e M13 seguem a spec spelling-game', () => {
    expect(byId('M12')).toMatchObject({ type: 'spelling', game: { word: 'BEE', art: 'abelha' } });
    expect(byId('M13')).toMatchObject({ type: 'spelling', game: { word: 'FROG', art: 'sapo' } });
  });

  it('M01 e M02 seguem a spec paths-game', () => {
    const m01 = byId('M01'), m02 = byId('M02');
    expect(m01).toMatchObject({ type: 'paths', word: 'rabbit', meaning: 'coelho', game: { goalArt: 'portao' } });
    expect(m02).toMatchObject({ type: 'paths', word: 'rabbit', meaning: 'coelho', game: { goalArt: 'cenouras' } });
    if (m01.type !== 'paths' || m02.type !== 'paths') throw new Error('tipo');
    expect(m01.game.points).toHaveLength(3);
    expect(new Set(m01.game.points.map((p) => p.x)).size).toBe(1); // linha reta
    expect(m02.game.points).toHaveLength(4);
    expect(new Set(m02.game.points.map((p) => p.x)).size).toBeGreaterThan(1); // curva
  });

  it('M03 e M04 seguem a spec color-game', () => {
    expect(byId('M03')).toMatchObject({ type: 'colors', word: 'green', meaning: 'verde', game: { target: 'leaf' } });
    expect(byId('M04')).toMatchObject({ type: 'colors', word: 'yellow', meaning: 'amarelo', game: { target: 'yellow' } });
    const m03 = byId('M03'), m04 = byId('M04');
    if (m03.type !== 'colors' || m04.type !== 'colors') throw new Error('tipo');
    expect(m03.game.paints).toHaveLength(2);
    expect(m04.game.paints).toHaveLength(3);
  });

  it('M05 e M06 seguem a spec quantities-game', () => {
    expect(byId('M05')).toMatchObject({ type: 'quantities', word: 'one', meaning: 'um', game: { slots: 1, numeral: '1' } });
    expect(byId('M06')).toMatchObject({ type: 'quantities', word: 'two', meaning: 'dois', game: { slots: 2, numeral: '2' } });
  });
});
