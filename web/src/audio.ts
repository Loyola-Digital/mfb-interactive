// Fala em inglês: a gravação em assets/audio/<nome>.mp3 ou, enquanto ela não existe, a voz do navegador.
import { audioSlug } from '../../shared/content.ts';
import { speakerIcon } from './art.ts';
import { esc } from './ui.ts';

const FILES = import.meta.glob<string>('./assets/audio/*.mp3', { eager: true, query: '?url', import: 'default' });
const fileFor = (text: string): string | undefined => FILES[`./assets/audio/${audioSlug(text)}.mp3`];
/** "/t/": som da letra; a voz do navegador não sabe fazer. */
const isSound = (text: string) => /^\/[a-z]+\/$/.test(text.trim());
const synth = () => globalThis.speechSynthesis as SpeechSynthesis | undefined;

let player: HTMLAudioElement | null = null;
let playing: Element | null = null;

const done = () => {
  playing?.classList.remove('is-playing');
  playing = null;
};

/** Há gravação ou voz do navegador para este texto. */
export const canSay = (text: string) => Boolean(fileFor(text)) || (!isSound(text) && Boolean(synth()));

/** Fala o texto; `button` pisca enquanto toca. */
export function say(text: string, button?: Element | null) {
  stop();
  if (!canSay(text)) return;
  playing = button ?? null;
  playing?.classList.add('is-playing');
  const url = fileFor(text);
  if (url) {
    player ??= new Audio();
    player.onended = player.onerror = done;
    player.src = url;
    player.play().catch(done);
    return;
  }
  const s = synth()!;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.8;
  u.voice = s.getVoices().find((v) => v.lang.replace('_', '-') === 'en-US') ?? null;
  u.onend = u.onerror = done;
  s.speak(u);
}

export function stop() {
  player?.pause();
  synth()?.cancel();
  done();
}

/** Botão de alto-falante. Som de letra sem gravação: mostra ao adulto o que dizer. */
export function speaker(text: string, big = false): string {
  const button = `<button type="button" class="speaker${big ? ' speaker--big' : ''}" data-say="${esc(text)}" aria-label="Ouvir de novo">${speakerIcon}</button>`;
  return canSay(text) ? button : `${button}<span class="speaker__say small">Diga: ${esc(text)}</span>`;
}

// WAV vazio: tocar no primeiro toque libera o áudio no iPhone para as falas automáticas depois.
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

/** Alto-falantes da página inteira e liberação do áudio no primeiro toque. */
export function bindSpeakers(doc: Document) {
  doc.addEventListener('pointerdown', () => {
    player ??= new Audio();
    player.src = SILENCE;
    player.play().catch(() => {});
    synth()?.speak(new SpeechSynthesisUtterance(''));
  }, { once: true });
  doc.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-say]');
    if (b) say(b.dataset.say!, b);
  });
}
