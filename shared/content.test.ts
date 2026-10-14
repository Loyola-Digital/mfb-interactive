import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { artKeys, isPlayable, validateContent, type PlayableMission } from './content.ts';

const texts = { bookRef: 'p. 26', goal: 'Objetivo.', word: 'green', meaning: 'verde', adultTip: 'Mostre o modelo.', offScreen: 'Procure algo.' };
const base = { version: 1, available: true, icon: 'sapo', ...texts };
const colors = { ...base, id: 'CO1-03', type: 'colors', title: 'O sapinho verde', game: { drawing: 'sapo', paints: ['leaf', 'coral'], target: 'leaf' } };
const paths = {
  ...base, id: 'CO1-01', type: 'paths', title: 'Caminho',
  game: { start: { x: 50, y: 90 }, points: [{ x: 50, y: 70 }, { x: 50, y: 50 }], goal: { x: 50, y: 10 }, goalArt: 'portao' },
};
const quantities = { ...base, id: 'CO1-05', type: 'quantities', title: 'Uma flor', game: { slots: 1, numeral: '1' } };
const soon = { id: 'CO1-09', version: 1, type: 'paths', title: 'Depois', available: false };
const round = { prompt: { text: 'B' }, options: [{ art: 'bear' }, { art: 'cup' }], answer: 0 };
const pick = { ...base, id: 'CO1-06', type: 'pick', title: 'Escolher', game: { rounds: [round, round] } };
const match = { ...base, id: 'CO1-07', type: 'match', title: 'Ligar', game: { pairs: [[{ text: 'A' }, { text: 'a' }], [{ text: 'B' }, { text: 'b' }], [{ text: 'C' }, { text: 'c' }]] } };
const prova = { ...pick, id: 'CO1-P1', test: true, title: 'Prova' };

const book = (id: string, missions: unknown[]) => ({ id, title: id, audience: 'Para todos', chapters: [{ title: 'Capítulo', missions }] });
const placement = ['CO1', 'CO2', 'EX1'].map((b) => ({ book: b, rounds: [round, round, round, round] }));
const ok = (...missions: unknown[]) => validateContent({
  books: [book('CO1', missions), book('CO2', [{ ...soon, id: 'CO2-01' }]), book('EX1', [{ ...soon, id: 'EX1-01' }])],
  placement,
}).missions.filter((m) => m.book === 'CO1');

describe('validateContent', () => {
  it('aceita os tipos jogáveis e missão "em breve", com apostila e capítulo', () => {
    const list = ok(colors, paths, quantities, soon, pick, match, prova);
    expect(list).toHaveLength(7);
    expect(list[0]).toMatchObject({ book: 'CO1', chapter: 'Capítulo' });
  });

  it('recusa missão jogável sem texto obrigatório', () => {
    const { word: _w, ...semPalavra } = colors;
    expect(() => ok(semPalavra)).toThrow('word');
  });

  it('recusa id fora do formato da apostila e id repetido', () => {
    expect(() => ok({ ...colors, id: 'M03' })).toThrow('id inválido');
    expect(() => ok({ ...colors, id: 'CO2-03' })).toThrow('id inválido');
    expect(() => ok(colors, colors)).toThrow('repetido');
  });

  it('recusa apostilas fora da ordem, apostila sem capítulo e placement incompleto', () => {
    expect(() => validateContent({ books: [book('CO2', [colors])], placement })).toThrow('ordem');
    expect(() => validateContent({ books: [{ id: 'CO1', title: 'x', audience: 'y', chapters: [] }], placement })).toThrow('capítulos');
    expect(() => validateContent({ books: [book('CO1', [colors]), book('CO2', [{ ...soon, id: 'CO2-01' }]), book('EX1', [{ ...soon, id: 'EX1-01' }])], placement: placement.slice(0, 2) })).toThrow('placement');
  });

  it('Cores, Caminhos e Quantidades: recusam o formato errado', () => {
    expect(() => ok({ ...colors, game: { ...colors.game, target: 'sky' } })).toThrow('target');
    expect(() => ok({ ...paths, game: { ...paths.game, points: [{ x: 50, y: 50 }] } })).toThrow('points');
    expect(() => ok({ ...quantities, game: { slots: 0, numeral: '0' } })).toThrow('slots');
  });

  it('Frase, Quiz e Palavra: aceitam o formato certo e recusam o errado', () => {
    const sentence = { ...base, id: 'CO1-10', type: 'sentence', title: 'Frase', game: { words: ['I', 'am', 'in', 'bed'], art: 'bed' } };
    const quiz = { ...base, id: 'CO1-11', type: 'quiz', title: 'Quiz', game: { frame: 'a', options: [{ word: 'bee', art: 'abelha' }, { word: 'frog', art: 'sapo' }], answer: 'bee' } };
    const spelling = { ...base, id: 'CO1-12', type: 'spelling', title: 'Palavra', game: { word: 'BEE', art: 'abelha' } };
    expect(ok(sentence, quiz, spelling)).toHaveLength(3);
    expect(() => ok({ ...sentence, game: { words: ['bee'], art: 'abelha' } })).toThrow('words');
    expect(() => ok({ ...quiz, game: { ...quiz.game, answer: 'cat' } })).toThrow('answer');
    expect(() => ok({ ...spelling, game: { word: 'bee', art: 'abelha' } })).toThrow('maiúsculas');
  });

  it('Escolher: recusa rodadas de menos, resposta fora das opções e carta vazia', () => {
    expect(() => ok({ ...pick, game: { rounds: [round] } })).toThrow('rounds');
    expect(() => ok({ ...pick, game: { rounds: [round, { ...round, answer: 2 }] } })).toThrow('answer');
    expect(() => ok({ ...pick, game: { rounds: [round, { ...round, prompt: {} }] } })).toThrow('carta precisa');
    expect(() => ok({ ...pick, game: { rounds: [round, { ...round, prompt: { shape: 'star' } }] } })).toThrow('shape');
    expect(() => ok({ ...pick, game: { rounds: [round, { ...round, prompt: { text: '3', count: 3 } }] } })).toThrow('count');
  });

  it('Ligar: recusa pares de menos e carta repetida na mesma coluna', () => {
    expect(() => ok({ ...match, game: { pairs: match.game.pairs.slice(0, 2) } })).toThrow('pairs');
    expect(() => ok({ ...match, game: { pairs: [...match.game.pairs, [{ text: 'A' }, { text: 'z' }]] } })).toThrow('repetidas');
  });

  it('Prova: só do tipo Escolher e com id PN', () => {
    expect(() => ok({ ...prova, id: 'CO1-08' })).toThrow('provas');
    expect(() => ok({ ...pick, id: 'CO1-P2' })).toThrow('provas');
    expect(() => ok({ ...match, id: 'CO1-P3', test: true })).toThrow('pick');
  });
});

describe('arquivo real de conteúdo', () => {
  const content = validateContent(JSON.parse(readFileSync(new URL('../web/public/content/missions.json', import.meta.url), 'utf8')));
  const byId = (id: string) => content.missions.find((m) => m.id === id) as PlayableMission;

  it('tem as três apostilas na ordem, todas as missões jogáveis', () => {
    expect(content.books.map((b) => b.id)).toEqual(['CO1', 'CO2', 'EX1']);
    expect(content.missions.every(isPlayable)).toBe(true);
    for (const b of content.books) expect(b.chapters.flatMap((c) => c.missions).length, b.id).toBeGreaterThanOrEqual(20);
  });

  it('cada prova fecha o seu capítulo e todo capítulo com prova tem exercícios antes', () => {
    for (const b of content.books) for (const c of b.chapters) {
      const tests = c.missions.filter((m) => m.test);
      expect(tests.length, `${b.id} ${c.title}`).toBeLessThanOrEqual(1);
      if (tests.length) expect(c.missions.at(-1)!.test, `${b.id} ${c.title}`).toBe(true);
    }
    expect(content.missions.filter((m) => m.test).length).toBeGreaterThanOrEqual(12);
  });

  it('toda figura usada existe (arte empacotada ou recorte em public/content/img)', () => {
    const bundled = new Set(['abelha', 'banana', 'cenouras', 'cesto', 'coelho', 'cova', 'pedra', 'portao', 'sapo', 'tulipa']);
    for (const key of artKeys(content)) {
      expect(bundled.has(key) || existsSync(new URL(`../web/public/content/img/${key}.webp`, import.meta.url)), key).toBe(true);
    }
  });

  it('as missões antigas continuam na Curious Ones 1 com o mesmo jogo', () => {
    expect(byId('CO1-01')).toMatchObject({ type: 'paths', game: { goalArt: 'portao' } });
    expect(byId('CO1-03')).toMatchObject({ type: 'colors', word: 'green', game: { target: 'leaf' } });
    expect(byId('CO1-04')).toMatchObject({ type: 'colors', word: 'yellow', game: { target: 'yellow' } });
    expect(byId('CO1-09')).toMatchObject({ type: 'quantities', game: { slots: 1 } });
    expect(byId('CO1-24')).toMatchObject({ type: 'spelling', game: { word: 'FROG', art: 'sapo' } });
  });

  it('o teste de alinhamento tem 4 rodadas por apostila', () => {
    expect(content.placement.map((l) => [l.book, l.rounds.length])).toEqual([['CO1', 4], ['CO2', 4], ['EX1', 4]]);
  });
});
