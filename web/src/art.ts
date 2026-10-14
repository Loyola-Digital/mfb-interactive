// Ilustrações geradas no Magnific (originais em alta ficam fora do repo) e recortes das apostilas em public/content/img.
import type { Card, Shape } from '../../shared/content.ts';
import { esc } from './ui.ts';
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

/** Figura: arte empacotada, ou recorte da apostila em /content/img/<chave>.webp. */
export const artUrl = (key: string) => art[key] ?? `/content/img/${key}.webp`;

export const img = (key: string, cls = '') => `<img class="${cls}" src="${artUrl(key)}" alt="" draggable="false">`;

// Formas geométricas desenhadas, cada uma com uma cor do design system.
const SHAPE_SVG: Record<Shape, string> = {
  circle: '<circle cx="50" cy="50" r="40" style="fill: var(--yellow)"/>',
  square: '<rect x="12" y="12" width="76" height="76" style="fill: var(--sky)"/>',
  triangle: '<path d="M50 10 L92 88 L8 88 Z" style="fill: var(--coral)"/>',
  rectangle: '<rect x="4" y="24" width="92" height="52" style="fill: var(--leaf)"/>',
  oval: '<ellipse cx="50" cy="50" rx="44" ry="30" style="fill: var(--coral)"/>',
  diamond: '<path d="M50 6 L92 50 L50 94 L8 50 Z" style="fill: var(--sky)"/>',
};

export const shape = (s: Shape) => `<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">${SHAPE_SVG[s]}</svg>`;

/** Carta do Escolher/Ligar: forma, figura (repetida ou em tamanho grande/pequeno) e/ou texto. */
export function card(c: Card): string {
  const parts: string[] = [];
  if (c.shape) parts.push(shape(c.shape));
  if (c.art && c.count !== undefined) {
    parts.push(c.count === 0 ? '<span class="card-count card-count--empty"></span>'
      : `<span class="card-count card-count--${Math.min(c.count, 10)}">${img(c.art).repeat(c.count)}</span>`);
  } else if (c.art) parts.push(img(c.art, c.size ? `card-art card-art--${c.size}` : 'card-art'));
  if (c.text) parts.push(`<span class="card-text${c.art || c.shape ? ' card-text--caption' : ''}">${esc(c.text)}</span>`);
  return parts.join('');
}

/** Rótulo acessível de uma carta. */
export function cardLabel(c: Card): string {
  return [c.text, c.shape, c.count !== undefined ? `${c.count} × ${c.art}` : c.art, c.size === 'big' ? 'grande' : c.size === 'small' ? 'pequeno' : '']
    .filter(Boolean).join(', ');
}

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
  if (kind === 'shape') return shape(value as Shape);
  if (kind === 'letras') return `<span class="icon-letters">${[...value].map((l) => `<span>${l}</span>`).join('')}</span>`;
  return img(key);
}


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
