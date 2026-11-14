import { expect, it } from 'vitest';

// Voz do navegador de mentira: guarda as falas; o teste decide quando cada uma termina.
class Utterance {
  lang = '';
  rate = 1;
  voice = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
}
const spoken: Utterance[] = [];
Object.assign(globalThis, {
  SpeechSynthesisUtterance: Utterance,
  speechSynthesis: { speak: (u: Utterance) => spoken.push(u), cancel: () => {}, getVoices: () => [] },
});
const { pt, say, sayNext } = await import('./audio.ts');
const said = () => spoken.map((u) => `${u.lang} ${u.text}`);

it('fala em fila (português, depois inglês) e uma fala interrompida não pula a seguinte', () => {
  say([pt('Qual é?'), 'Which one?']);
  sayNext('zz bear');
  expect(said()).toEqual(['pt-BR Qual é?']);
  spoken[0].onend!();
  expect(said()).toEqual(['pt-BR Qual é?', 'en-US Which one?']);
  // Errou no meio: "say" corta a fila; o fim atrasado da fala cortada não pode puxar a próxima.
  say('zz oops');
  spoken[1].onerror!();
  expect(said()).toEqual(['pt-BR Qual é?', 'en-US Which one?', 'en-US zz oops']);
  spoken[2].onend!();
  expect(spoken).toHaveLength(3);
});
