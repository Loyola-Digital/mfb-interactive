// Esquema do arquivo de conteúdo (web/public/content/missions.json): apostila → capítulo → missões.

export const BOOK_IDS = ['CO1', 'CO2', 'EX1'] as const;
export type BookId = (typeof BOOK_IDS)[number];

export const PAINTS = ['leaf', 'yellow', 'coral', 'sky'] as const;
export type Paint = (typeof PAINTS)[number];

export const SHAPES = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond'] as const;
export type Shape = (typeof SHAPES)[number];

export const GAME_TYPES = ['colors', 'paths', 'quantities', 'sentence', 'quiz', 'spelling', 'pick', 'match'] as const;
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

/** Carta do Escolher/Ligar: figura, texto, figura repetida, forma desenhada ou figura em tamanho grande/pequeno. */
export interface Card {
  art?: string;
  text?: string;
  /** Repete `art` esta quantidade de vezes (contar). */
  count?: number;
  shape?: Shape;
  size?: 'big' | 'small';
}

export interface PickRound {
  prompt: Card;
  options: Card[];
  /** Índice da opção certa. */
  answer: number;
}

export interface PickGame {
  rounds: PickRound[];
}

export interface MatchGame {
  pairs: [Card, Card][];
}

interface MissionBase {
  id: string;
  version: number;
  title: string;
  available: boolean;
  /** Ilustração do ponto no jardim (chave de arte); sem ela, a primeira figura do jogo. */
  icon?: string;
  /** Prova: Escolher sem ajuda, conta acertos. */
  test?: boolean;
}

interface Texts {
  bookRef: string;
  goal: string;
  word: string;
  meaning: string;
  adultTip: string;
  offScreen: string;
}

/** Onde a missão está; preenchido ao carregar. */
interface Place {
  book: BookId;
  chapter: string;
}

type Playable<T extends GameType, G> = MissionBase & Texts & Place & { type: T; game: G };

export type PlayableMission =
  | Playable<'colors', ColorsGame>
  | Playable<'paths', PathsGame>
  | Playable<'quantities', QuantitiesGame>
  | Playable<'sentence', SentenceGame>
  | Playable<'quiz', QuizGame>
  | Playable<'spelling', SpellingGame>
  | Playable<'pick', PickGame>
  | Playable<'match', MatchGame>;

/** Missões "em breve" só precisam do que o jardim mostra. */
export type Mission = PlayableMission | (MissionBase & Partial<Texts> & Place & { type: GameType; available: false; game?: undefined });

export interface Chapter {
  title: string;
  missions: Mission[];
}

export interface Book {
  id: BookId;
  title: string;
  /** Para quem é, em uma linha. */
  audience: string;
  chapters: Chapter[];
}

export interface PlacementLevel {
  book: BookId;
  rounds: PickRound[];
}

export interface Content {
  books: Book[];
  /** Todas as missões, na ordem das apostilas. */
  missions: Mission[];
  placement: PlacementLevel[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isPct = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 100;
const isPoint = (v: unknown): v is Point => isObj(v) && isPct(v.x) && isPct(v.y);
const isInt = (v: unknown, min: number, max: number) => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

export const isBookId = (v: unknown): v is BookId => BOOK_IDS.includes(v as BookId);

export function isPlayable(m: Mission): m is PlayableMission {
  return m.available;
}

/** Valida o JSON de conteúdo, ou lança Error com o primeiro problema encontrado. */
export function validateContent(data: unknown): Content {
  if (!isObj(data) || !Array.isArray(data.books)) throw new Error('conteúdo sem lista "books"');
  const ids = new Set<string>();
  const missions: Mission[] = [];
  const books = data.books.map((b, bi): Book => {
    if (!isObj(b) || !isBookId(b.id)) throw new Error(`apostila ${bi + 1}: id inválido`);
    if (BOOK_IDS[bi] !== b.id) throw new Error(`${b.id}: fora da ordem ${BOOK_IDS.join(', ')}`);
    if (!isText(b.title) || !isText(b.audience)) throw new Error(`${b.id}: title e audience obrigatórios`);
    if (!Array.isArray(b.chapters) || b.chapters.length === 0) throw new Error(`${b.id}: sem capítulos`);
    const book = b.id;
    const chapters = b.chapters.map((c, ci): Chapter => {
      if (!isObj(c) || !isText(c.title)) throw new Error(`${book} capítulo ${ci + 1}: title ausente`);
      if (!Array.isArray(c.missions) || c.missions.length === 0) throw new Error(`${book} capítulo ${ci + 1}: sem missões`);
      const list = c.missions.map((m) => validateMission(m, book, c.title as string, ids));
      missions.push(...list);
      return { title: c.title as string, missions: list };
    });
    return { id: book, title: b.title as string, audience: b.audience as string, chapters };
  });
  if (books.length !== BOOK_IDS.length) throw new Error(`conteúdo precisa das apostilas ${BOOK_IDS.join(', ')}`);

  if (!Array.isArray(data.placement) || data.placement.length !== BOOK_IDS.length) throw new Error('placement precisa de um nível por apostila');
  const placement = data.placement.map((l, i): PlacementLevel => {
    if (!isObj(l) || l.book !== BOOK_IDS[i]) throw new Error(`placement ${i + 1}: book fora da ordem`);
    if (!Array.isArray(l.rounds) || l.rounds.length !== 4) throw new Error(`placement ${l.book}: precisa de 4 rodadas`);
    l.rounds.forEach((r, ri) => validateRound(`placement ${l.book} rodada ${ri + 1}`, r));
    return { book: l.book as BookId, rounds: l.rounds as PickRound[] };
  });

  return { books, missions, placement };
}

function validateMission(m: unknown, book: BookId, chapter: string, ids: Set<string>): Mission {
  if (!isObj(m)) throw new Error(`${book}: missão não é um objeto`);
  const where = isText(m.id) ? m.id : `${book} (sem id)`;
  if (!isText(m.id) || !new RegExp(`^${book}-(\\d{2}|P\\d)$`).test(m.id)) throw new Error(`${where}: id inválido (esperado ${book}-NN ou ${book}-PN)`);
  if (ids.has(m.id)) throw new Error(`${m.id}: id repetido`);
  ids.add(m.id);
  if (typeof m.version !== 'number') throw new Error(`${m.id}: version ausente`);
  if (!GAME_TYPES.includes(m.type as GameType)) throw new Error(`${m.id}: type inválido`);
  if (!isText(m.title)) throw new Error(`${m.id}: title ausente`);
  if (typeof m.available !== 'boolean') throw new Error(`${m.id}: available ausente`);
  if (m.icon !== undefined && !isText(m.icon)) throw new Error(`${m.id}: icon vazio`);
  if (m.test !== undefined && (m.test !== true || m.type !== 'pick')) throw new Error(`${m.id}: prova só pode ser do tipo pick`);
  if (/-P\d/.test(m.id) !== (m.test === true)) throw new Error(`${m.id}: provas usam o id ${book}-PN e test: true`);
  if (m.available) {
    for (const f of ['bookRef', 'goal', 'word', 'meaning', 'adultTip', 'offScreen'] as const) {
      if (!isText(m[f])) throw new Error(`${m.id}: ${f} ausente`);
    }
    if (!isObj(m.game)) throw new Error(`${m.id}: game ausente`);
    VALIDATORS[m.type as GameType](m.id, m.game);
  }
  return { ...m, book, chapter } as unknown as Mission;
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
  if (!isInt(game.slots, 1, 5)) throw new Error(`${id}: game.slots precisa ser de 1 a 5`);
  if (!isText(game.numeral)) throw new Error(`${id}: game.numeral ausente`);
}

function validateSentence(id: string, game: Record<string, unknown>): void {
  const words = game.words;
  if (!Array.isArray(words) || words.length < 2 || words.length > 6 || !words.every(isText)) throw new Error(`${id}: game.words precisa de 2 a 6 palavras`);
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

function validateCard(where: string, c: unknown): void {
  if (!isObj(c)) throw new Error(`${where}: carta não é um objeto`);
  if (c.art === undefined && c.text === undefined && c.shape === undefined) throw new Error(`${where}: carta precisa de art, text ou shape`);
  if (c.art !== undefined && !isText(c.art)) throw new Error(`${where}: art vazio`);
  if (c.text !== undefined && !isText(c.text)) throw new Error(`${where}: text vazio`);
  if (c.shape !== undefined && !SHAPES.includes(c.shape as Shape)) throw new Error(`${where}: shape desconhecida`);
  if (c.count !== undefined && (!isInt(c.count, 0, 10) || c.art === undefined)) throw new Error(`${where}: count de 0 a 10 com art`);
  if (c.size !== undefined && c.size !== 'big' && c.size !== 'small') throw new Error(`${where}: size precisa ser big ou small`);
}

function validateRound(where: string, r: unknown): void {
  if (!isObj(r)) throw new Error(`${where}: não é um objeto`);
  validateCard(`${where} prompt`, r.prompt);
  if (!Array.isArray(r.options) || r.options.length < 2 || r.options.length > 4) throw new Error(`${where}: precisa de 2 a 4 opções`);
  r.options.forEach((o, i) => validateCard(`${where} opção ${i + 1}`, o));
  if (!isInt(r.answer, 0, r.options.length - 1)) throw new Error(`${where}: answer fora das opções`);
  // Opções erradas podem se repetir ("qual é diferente?"); a certa precisa ser única.
  const keys = r.options.map((o) => JSON.stringify(o));
  if (keys.filter((k) => k === keys[r.answer as number]).length > 1) throw new Error(`${where}: a opção certa aparece repetida`);
}

function validatePick(id: string, game: Record<string, unknown>): void {
  const rounds = game.rounds;
  if (!Array.isArray(rounds) || rounds.length < 2 || rounds.length > 8) throw new Error(`${id}: game.rounds precisa de 2 a 8 rodadas`);
  rounds.forEach((r, i) => validateRound(`${id} rodada ${i + 1}`, r));
}

function validateMatch(id: string, game: Record<string, unknown>): void {
  const pairs = game.pairs;
  if (!Array.isArray(pairs) || pairs.length < 3 || pairs.length > 6) throw new Error(`${id}: game.pairs precisa de 3 a 6 pares`);
  pairs.forEach((p, i) => {
    if (!Array.isArray(p) || p.length !== 2) throw new Error(`${id} par ${i + 1}: precisa de duas cartas`);
    p.forEach((c, j) => validateCard(`${id} par ${i + 1} carta ${j + 1}`, c));
  });
  for (const side of [0, 1]) {
    const keys = pairs.map((p) => JSON.stringify(p[side]));
    if (new Set(keys).size !== keys.length) throw new Error(`${id}: cartas repetidas na coluna ${side + 1}`);
  }
}

const VALIDATORS: Record<GameType, (id: string, game: Record<string, unknown>) => void> = {
  colors: validateColors,
  paths: validatePaths,
  quantities: validateQuantities,
  sentence: validateSentence,
  quiz: validateQuiz,
  spelling: validateSpelling,
  pick: validatePick,
  match: validateMatch,
};

/** Todas as chaves de arte que o conteúdo usa (para conferir que os arquivos existem). */
export function artKeys(content: Content): Set<string> {
  const keys = new Set<string>();
  const card = (c: Card) => c.art && keys.add(c.art);
  for (const m of content.missions) {
    if (m.icon && !m.icon.includes(':') && m.icon !== 'tulipas') keys.add(m.icon);
    if (!isPlayable(m)) continue;
    switch (m.type) {
      case 'colors': break;
      case 'paths': keys.add(m.game.goalArt); break;
      case 'quantities': break;
      case 'sentence': keys.add(m.game.art); break;
      case 'quiz': m.game.options.forEach((o) => keys.add(o.art)); break;
      case 'spelling': keys.add(m.game.art); break;
      case 'pick': m.game.rounds.forEach((r) => { card(r.prompt); r.options.forEach(card); }); break;
      case 'match': m.game.pairs.forEach((p) => p.forEach(card)); break;
    }
  }
  content.placement.forEach((l) => l.rounds.forEach((r) => { card(r.prompt); r.options.forEach(card); }));
  return keys;
}
