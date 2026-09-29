// Esquema do arquivo de conteúdo das missões (web/public/content/missions.json).

export const PAINTS = ['leaf', 'yellow', 'coral', 'sky'] as const;
export type Paint = (typeof PAINTS)[number];

export const GAME_TYPES = ['colors', 'paths', 'quantities', 'sentence', 'quiz', 'spelling'] as const;
export type GameType = (typeof GAME_TYPES)[number];

export interface Point {
  x: number; // % da largura da cena
  y: number; // % da altura da cena
}

export interface ColorsGame {
  drawing: string;
  paints: Paint[];
  target: Paint;
}

export interface PathsGame {
  start: Point;
  points: Point[];
  goal: Point;
  goalArt: string;
}

export interface QuantitiesGame {
  slots: number;
  numeral: string;
}

export interface SentenceGame {
  /** Palavras na ordem; a última leva o desenho `art`. */
  words: string[];
  art: string;
}

export interface QuizOption {
  word: string;
  art: string;
}

export interface QuizGame {
  /** Começo da frase antes do espaço, ex.: "It's a". */
  frame: string;
  options: QuizOption[];
  /** `word` da opção certa. */
  answer: string;
}

export interface SpellingGame {
  /** Palavra em letras maiúsculas, ex.: "BEE". */
  word: string;
  art: string;
}

interface MissionBase {
  id: string;
  version: number;
  title: string;
  available: boolean;
  garden: Point;
  /** Ilustração do ponto no jardim (chave em web/src/art.ts). */
  icon: string;
}

interface Texts {
  bookRef: string;
  goal: string;
  word: string;
  meaning: string;
  adultTip: string;
  offScreen: string;
}

type Playable<T extends GameType, G> = MissionBase & Texts & { type: T; game: G };

export type PlayableMission =
  | Playable<'colors', ColorsGame>
  | Playable<'paths', PathsGame>
  | Playable<'quantities', QuantitiesGame>
  | Playable<'sentence', SentenceGame>
  | Playable<'quiz', QuizGame>
  | Playable<'spelling', SpellingGame>;

/** Missões "em breve" só precisam do que o jardim mostra. */
export type Mission = PlayableMission | (MissionBase & Partial<Texts> & { type: GameType; available: false; game?: undefined });

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isPct = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 100;
const isPoint = (v: unknown): v is Point => isObj(v) && isPct(v.x) && isPct(v.y);

export function isPlayable(m: Mission): m is PlayableMission {
  return m.available;
}

/** Valida o JSON de conteúdo e devolve as missões, ou lança Error com o primeiro problema encontrado. */
export function validateMissions(data: unknown): Mission[] {
  if (!isObj(data) || !Array.isArray(data.missions)) throw new Error('conteúdo sem lista "missions"');
  const ids = new Set<string>();
  return data.missions.map((m, i) => {
    const where = `missão ${i + 1}`;
    if (!isObj(m)) throw new Error(`${where}: não é um objeto`);
    if (!isText(m.id) || !/^M\d{2}$/.test(m.id)) throw new Error(`${where}: id inválido`);
    if (ids.has(m.id)) throw new Error(`${m.id}: id repetido`);
    ids.add(m.id);
    if (typeof m.version !== 'number') throw new Error(`${m.id}: version ausente`);
    if (!GAME_TYPES.includes(m.type as GameType)) throw new Error(`${m.id}: type inválido`);
    if (!isText(m.title)) throw new Error(`${m.id}: title ausente`);
    if (typeof m.available !== 'boolean') throw new Error(`${m.id}: available ausente`);
    if (!isPoint(m.garden)) throw new Error(`${m.id}: garden ausente`);
    if (!isText(m.icon)) throw new Error(`${m.id}: icon ausente`);
    if (m.available) {
      for (const f of ['bookRef', 'goal', 'word', 'meaning', 'adultTip', 'offScreen'] as const) {
        if (!isText(m[f])) throw new Error(`${m.id}: ${f} ausente`);
      }
      if (!isObj(m.game)) throw new Error(`${m.id}: game ausente`);
      VALIDATORS[m.type as GameType](m.id as string, m.game);
    }
    return m as unknown as Mission;
  });
}

function validateColors(id: string, game: Record<string, unknown>): void {
  if (!isText(game.drawing)) throw new Error(`${id}: game.drawing ausente`);
  const paints = game.paints;
  if (!Array.isArray(paints) || paints.length < 2 || paints.length > 3) throw new Error(`${id}: game.paints precisa de 2 a 3 tintas`);
  if (!paints.every((p) => PAINTS.includes(p as Paint))) throw new Error(`${id}: game.paints com tinta desconhecida`);
  if (new Set(paints).size !== paints.length) throw new Error(`${id}: game.paints com tinta repetida`);
  if (!paints.includes(game.target)) throw new Error(`${id}: game.target fora das tintas`);
}

function validatePaths(id: string, game: Record<string, unknown>): void {
  if (!isPoint(game.start) || !isPoint(game.goal)) throw new Error(`${id}: game.start e game.goal precisam de x e y entre 0 e 100`);
  const points = game.points;
  if (!Array.isArray(points) || points.length < 2 || points.length > 6 || !points.every(isPoint)) {
    throw new Error(`${id}: game.points precisa de 2 a 6 pontos`);
  }
  if (!isText(game.goalArt)) throw new Error(`${id}: game.goalArt ausente`);
}

function validateQuantities(id: string, game: Record<string, unknown>): void {
  if (!Number.isInteger(game.slots) || (game.slots as number) < 1 || (game.slots as number) > 5) throw new Error(`${id}: game.slots precisa ser de 1 a 5`);
  if (!isText(game.numeral)) throw new Error(`${id}: game.numeral ausente`);
}

function validateSentence(id: string, game: Record<string, unknown>): void {
  const words = game.words;
  if (!Array.isArray(words) || words.length < 2 || words.length > 4 || !words.every(isText)) throw new Error(`${id}: game.words precisa de 2 a 4 palavras`);
  if (!isText(game.art)) throw new Error(`${id}: game.art ausente`);
}

function validateQuiz(id: string, game: Record<string, unknown>): void {
  if (!isText(game.frame)) throw new Error(`${id}: game.frame ausente`);
  const options = game.options;
  if (!Array.isArray(options) || options.length < 2 || options.length > 4 || !options.every((o) => isObj(o) && isText(o.word) && isText(o.art))) {
    throw new Error(`${id}: game.options precisa de 2 a 4 opções com word e art`);
  }
  if (!options.some((o) => o.word === game.answer)) throw new Error(`${id}: game.answer fora das opções`);
}

function validateSpelling(id: string, game: Record<string, unknown>): void {
  if (typeof game.word !== 'string' || !/^[A-Z]{2,6}$/.test(game.word)) throw new Error(`${id}: game.word precisa de 2 a 6 letras maiúsculas`);
  if (!isText(game.art)) throw new Error(`${id}: game.art ausente`);
}

const VALIDATORS: Record<GameType, (id: string, game: Record<string, unknown>) => void> = {
  colors: validateColors,
  paths: validatePaths,
  quantities: validateQuantities,
  sentence: validateSentence,
  quiz: validateQuiz,
  spelling: validateSpelling,
};
