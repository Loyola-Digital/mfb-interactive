// Fala: a gravação em assets/audio/<nome>.mp3 ou, enquanto ela não existe, a voz do navegador.
// As falas entram numa fila: `say` interrompe o que está tocando, `sayNext` espera a vez.
import { audioSlug, OOPS, PRAISE, type Instruction } from '../../shared/content.ts';
import { speakerIcon } from './art.ts';
import { esc } from './ui.ts';

const FILES = import.meta.glob<string>('./assets/audio/*.mp3', { eager: true, query: '?url', import: 'default' });
const fileFor = (text: string): string | undefined => FILES[`./assets/audio/${audioSlug(text)}.mp3`];
/** "/t/": som da letra; a voz do navegador não sabe fazer. */
const isSound = (text: string) => /^\/[a-z]+\/$/.test(text.trim());
const synth = () => globalThis.speechSynthesis as SpeechSynthesis | undefined;

/** Texto em inglês, ou `{ text, lang: 'pt-BR' }` para uma fala em português. */
export type Line = string | { text: string; lang: string };
export const pt = (text: string): Line => ({ text, lang: 'pt-BR' });

interface Item { text: string; lang: string; button: Element | null }
const queue: Item[] = [];
let player: HTMLAudioElement | null = null;
let playing: Element | null = null;
let busy = false;
// Cada fala sabe a sua vez: um fim atrasado de uma fala interrompida não pula a seguinte.
let turn = 0;

const unmark = () => {
  playing?.classList.remove('is-playing');
  playing = null;
};

function next() {
  unmark();
  const item = queue.shift();
  busy = Boolean(item);
  if (!item) return;
  const me = ++turn;
  const after = () => { if (me === turn) next(); };
  playing = item.button;
  playing?.classList.add('is-playing');
  const url = fileFor(item.text);
  if (url) {
    player ??= new Audio();
    player.onended = player.onerror = after;
    player.src = url;
    player.play().catch(after);
    return;
  }
  const s = synth();
  if (!s || isSound(item.text)) return after();
  const u = new SpeechSynthesisUtterance(item.text);
  u.lang = item.lang;
  u.rate = item.lang === 'en-US' ? 0.8 : 1;
  u.voice = s.getVoices().find((v) => v.lang.replace('_', '-') === item.lang) ?? null;
  u.onend = u.onerror = after;
  s.speak(u);
}

/** Há gravação ou voz do navegador para este texto. */
export const canSay = (text: string) => Boolean(fileFor(text)) || (!isSound(text) && Boolean(synth()));

/** Põe as falas na fila; `button` pisca enquanto elas tocam. */
export function sayNext(lines: Line | Line[], button?: Element | null) {
  for (const l of [lines].flat()) {
    const item = typeof l === 'string' ? { text: l, lang: 'en-US' } : l;
    if (canSay(item.text)) queue.push({ ...item, button: button ?? null });
  }
  if (!busy) next();
}

/** Interrompe o que está tocando e fala. */
export function say(lines: Line | Line[], button?: Element | null) {
  stop();
  sayNext(lines, button);
}

export function stop() {
  turn++;
  queue.length = 0;
  busy = false;
  player?.pause();
  synth()?.cancel();
  unmark();
}

let praised = 0;
/** "Good job!" e variações, depois do que já está na fila (a palavra certa, por exemplo). */
export const cheer = (before: Line[] = []) => sayNext([...before, PRAISE[praised++ % PRAISE.length]]);
/** Errou: "Oops! Try again." na hora. */
export const oops = () => say(OOPS);

/** Botão de alto-falante. Som de letra sem gravação: mostra ao adulto o que dizer. */
export function speaker(text: string, big = false): string {
  const button = `<button type="button" class="speaker${big ? ' speaker--big' : ''}" data-say="${esc(text)}" aria-label="Ouvir de novo">${speakerIcon}</button>`;
  return canSay(text) ? button : `${button}<span class="speaker__say small">Diga: ${esc(text)}</span>`;
}

/** O que fazer, falado em português e depois em inglês. */
export const instructionLines = (i: Instruction): Line[] => [pt(i.pt), i.en];

// WAV vazio: tocar no primeiro toque libera o áudio no iPhone para as falas automáticas depois.
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

/** Alto-falantes da página inteira e liberação do áudio no primeiro toque. */
export function bindSpeakers(doc: Document) {
  doc.addEventListener('pointerdown', () => {
    player ??= new Audio();
    if (!busy) {
      player.src = SILENCE;
      player.play().catch(() => {});
    }
    synth()?.speak(new SpeechSynthesisUtterance(''));
  }, { once: true });
  doc.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-say]');
    if (!b) return;
    // data-say-pt: instrução, falada em português antes do inglês.
    say(b.dataset.sayPt ? [pt(b.dataset.sayPt), b.dataset.say!] : b.dataset.say!, b);
  });
}
