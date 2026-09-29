// Ilustrações geradas no Magnific (originais em alta ficam fora do repo).
// Tintas vêm sempre das variáveis do design system: desenhos pintáveis são máscara + traço.
import abelha from './assets/art/abelha.webp';
import banana from './assets/art/banana.webp';
import bananaCor from './assets/art/banana-cor.webp';
import bananaTraco from './assets/art/banana-traco.webp';
import cenouras from './assets/art/cenouras.webp';
import cesto from './assets/art/cesto.webp';
import celebrating from './assets/art/coelho-comemorando.webp';
import waiting from './assets/art/coelho-esperando.webp';
import walking from './assets/art/coelho-caminhando.webp';
import cova from './assets/art/cova.webp';
import pedra from './assets/art/pedra.webp';
import portao from './assets/art/portao.webp';
import sapo from './assets/art/sapo.webp';
import sapoCor from './assets/art/sapo-cor.webp';
import sapoTraco from './assets/art/sapo-traco.webp';
import tulipa from './assets/art/tulipa.webp';

export const art: Record<string, string> = { abelha, banana, cenouras, cesto, coelho: waiting, cova, pedra, portao, sapo, tulipa };

export const img = (key: string, cls = '') => `<img class="${cls}" src="${art[key]}" alt="" draggable="false">`;

export type RabbitPose = 'waiting' | 'walking' | 'celebrating';
const RABBIT: Record<RabbitPose, string> = { waiting, walking, celebrating };

export function rabbit(pose: RabbitPose): string {
  return `<img class="rabbit rabbit--${pose}" src="${RABBIT[pose]}" alt="" aria-hidden="true" draggable="false">`;
}

/**
 * Ilustração da missão no jardim.
 * "tulipas" = duas tulipas; "sombra:abelha" = sombra do desenho; "letras:BEE" = peças de letra.
 */
export function missionIcon(key: string): string {
  if (key === 'tulipas') return `<span class="icon-pair">${img('tulipa')}${img('tulipa')}</span>`;
  const [kind, value] = key.split(':');
  if (kind === 'sombra') return img(value, 'silhouette');
  if (kind === 'letras') return `<span class="icon-letters">${[...value].map((l) => `<span>${l}</span>`).join('')}</span>`;
  return img(key);
}

/** Ícones das peças de frase (forma + cor de token), usados na peça e no encaixe. */
export const shapes: Record<string, string> = {
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8.5-5.3-8.5-11A4.8 4.8 0 0 1 12 6.8 4.8 4.8 0 0 1 20.5 10c0 5.7-8.5 11-8.5 11z"/></svg>',
  circle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>',
};

const PAINTABLE: Record<string, { color: string; line: string }> = {
  sapo: { color: sapoCor, line: sapoTraco },
  banana: { color: bananaCor, line: bananaTraco },
};

/**
 * Desenho pintável: a camada de cor usa `var(--paint)` recortada pela máscara, com o traço por cima.
 * Sem --paint definido, fica branco (desenho ainda sem tinta).
 */
export function paintable(drawing: string, label: string, paint?: string): string {
  const p = PAINTABLE[drawing];
  const style = `--mask: url(${p.color})${paint ? `; --paint: var(--${paint})` : ''}`;
  return `<span class="paintable-art" role="img" aria-label="${label}" style="${style}">
    <span class="paintable-art__color"></span><img class="paintable-art__line" src="${p.line}" alt="" draggable="false">
  </span>`;
}

export const hand = `<svg class="hand" viewBox="0 0 64 64" aria-hidden="true">
  <path class="a-hand" d="M24 58 C14 50 8 40 12 34 C15 30 20 32 22 36 L22 10 C22 5 30 5 30 10 L30 28 L30 24 C30 19 38 19 38 24 L38 30 L38 27 C38 22 46 22 46 27 L46 33 L46 31 C46 26 54 26 54 31 L54 44 C54 52 48 58 40 58 Z"/>
</svg>`;

export const check = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 L10 17 L19 7"/></svg>`;
