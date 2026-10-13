// Quebra-cabeça de palavra/frase: bicho grande, tabuleiro com os contornos e peças espalhadas.
// A peça encaixa arrastando até o espaço ou tocando na peça e depois no espaço (o PRD exige que só toque baste).
import { img, rabbit } from '../art.ts';
import { esc, reducedMotion, shuffled } from '../ui.ts';
import { createDemo, nudge } from './demo.ts';
import { init, reduce, type JigsawEffect } from './jigsaw.ts';
import type { GameHandle, GameHooks } from './types.ts';

export interface JigsawPiece {
  /** Conteúdo da peça (letra, palavra ou desenho + palavra). */
  face: string;
  label: string;
  /** Largura do corpo da peça, sem a orelha. */
  width: number;
}

const H = 80; // altura das peças
const R = 13; // raio da orelha
const KNOB = R * 1.25; // quanto a orelha avança na peça vizinha
const PAD = 4; // folga para o contorno não cortar
const COLORS = ['coral', 'yellow', 'sky', 'leaf'];

/** Contorno de peça: orelha à direita (se não for a última) e recorte à esquerda (se não for a primeira). */
export function piecePath(w: number, notchLeft: boolean, tabRight: boolean): string {
  const m = H / 2;
  const a = R * 0.55;
  let d = `M0,0 H${w}`;
  d += tabRight
    ? ` V${m - a} C${w + R * 0.25},${m - a} ${w + KNOB},${m - R * 1.3} ${w + KNOB},${m} C${w + KNOB},${m + R * 1.3} ${w + R * 0.25},${m + a} ${w},${m + a} V${H}`
    : ` V${H}`;
  d += ` H0`;
  d += notchLeft
    ? ` V${m + a} C${R * 0.25},${m + a} ${KNOB},${m + R * 1.3} ${KNOB},${m} C${KNOB},${m - R * 1.3} ${R * 0.25},${m - a} 0,${m - a} Z`
    : ' Z';
  return d;
}

function shape(i: number, n: number, w: number, cls: string): string {
  const vbW = w + KNOB + PAD * 2;
  return `<svg class="${cls}" width="${vbW}" height="${H + PAD * 2}" viewBox="${-PAD} ${-PAD} ${vbW} ${H + PAD * 2}" aria-hidden="true">
    <path d="${piecePath(w, i > 0, i < n - 1)}"/></svg>`;
}

export function playJigsaw(root: HTMLElement, opts: { kind: string; art: string; pieces: JigsawPiece[]; hooks: GameHooks }): GameHandle {
  const { pieces, hooks } = opts;
  const n = pieces.length;
  let state = init(n);
  const color = (i: number) => COLORS[i % COLORS.length];
  const boardW = pieces.reduce((s, p) => s + p.width, 0);

  root.innerHTML = `<div class="jig game jig--${opts.kind}">
    <div class="jig__art">${img(opts.art)}</div>
    <div class="jig__board" style="width:${boardW}px; height:${H}px">
      ${pieces.map((p, i) => {
        const left = pieces.slice(0, i).reduce((s, q) => s + q.width, 0);
        return `<button type="button" class="jig-slot" data-i="${i}" aria-label="Espaço ${i + 1}" style="left:${left - PAD}px; top:${-PAD}px; --piece: var(--${color(i)})">
          ${shape(i, n, p.width, 'jig-shape')}<span class="jig-face" style="width:${p.width}px">${p.face}</span></button>`;
      }).join('')}
    </div>
    <div class="jig__tray"></div>
    ${pieces.map((p, i) => `<button type="button" class="jig-piece" data-i="${i}" aria-label="${esc(p.label)}" style="--piece: var(--${color(i)})">
        ${shape(i, n, p.width, 'jig-shape')}<span class="jig-face" style="width:${p.width}px">${p.face}</span></button>`).join('')}
    <div class="game-rabbit">${rabbit('waiting')}</div>
  </div>`;

  const el = root.querySelector<HTMLElement>('.jig')!;
  const slots = [...el.querySelectorAll<HTMLButtonElement>('.jig-slot')];
  const pieceEls = [...el.querySelectorAll<HTMLButtonElement>('.jig-piece')];
  const rabbitBox = el.querySelector<HTMLElement>('.game-rabbit')!;
  const demo = createDemo(el);
  const home: { x: number; y: number; rot: number }[] = [];
  let selected: number | null = null;
  let completeTimer = 0;

  /** Posição (no sistema do jogo) de onde a peça i fica encaixada. */
  function slotPos(i: number) {
    const base = el.getBoundingClientRect();
    const r = slots[i].getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top };
  }

  function setPos(p: HTMLElement, x: number, y: number, rot: number) {
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.rotate = `${rot}deg`;
  }

  /** Espalha as peças pela bandeja numa grade embaralhada, com leve giro. */
  function scatter() {
    const base = el.getBoundingClientRect();
    const tray = el.querySelector('.jig__tray')!.getBoundingClientRect();
    const order = shuffled(pieces.map((_, i) => i));
    const cols = Math.max(1, Math.min(order.length, Math.floor(tray.width / 130)));
    const rows = Math.ceil(order.length / cols);
    const cellW = tray.width / cols, cellH = tray.height / rows;
    order.forEach((i, k) => {
      const p = pieceEls[i];
      const w = p.offsetWidth, h = p.offsetHeight;
      const cx = tray.left - base.left + (k % cols + 0.5) * cellW;
      const cy = tray.top - base.top + (Math.floor(k / cols) + 0.5) * cellH;
      const jitter = (s: number) => (Math.random() - 0.5) * s;
      const rot = reducedMotion() ? 0 : jitter(26);
      home[i] = { x: Math.max(0, Math.min(base.width - w, cx - w / 2 + jitter(Math.max(0, cellW - w) * 0.6))), y: cy - h / 2 + jitter(Math.max(0, cellH - h) * 0.5), rot };
      if (!state.filled[i]) setPos(p, home[i].x, home[i].y, rot);
    });
  }

  function relayout() {
    scatter();
    state.filled.forEach((f, i) => {
      if (!f) return;
      const s = slotPos(i);
      setPos(pieceEls[i], s.x, s.y, 0);
    });
  }

  function select(i: number | null) {
    selected = i;
    pieceEls.forEach((p, j) => p.classList.toggle('is-lifted', j === i));
    slots.forEach((s, j) => s.classList.toggle('is-target', i !== null && !state.filled[j]));
  }

  function backHome(i: number) {
    const p = pieceEls[i];
    p.style.translate = '';
    setPos(p, home[i].x, home[i].y, home[i].rot);
  }

  function apply(effect: JigsawEffect) {
    switch (effect.type) {
      case 'placed': {
        const p = pieceEls[effect.piece];
        const s = slotPos(effect.piece);
        p.style.translate = '';
        setPos(p, s.x, s.y, 0);
        p.classList.add('is-placed');
        p.disabled = true;
        slots[effect.piece].classList.add('is-filled');
        slots.forEach((x) => x.classList.remove('is-hint'));
        select(null);
        break;
      }
      case 'invalid':
        select(null);
        backHome(effect.piece);
        nudge(pieceEls[effect.piece]);
        nudge(slots[effect.slot]);
        nudge(rabbitBox, 'is-thinking');
        break;
      case 'autoHelp':
        slots[effect.piece].classList.add('is-hint');
        hooks.onHelp();
        demo.run([pieceEls[effect.piece], slots[effect.piece]]);
        break;
      case 'completed':
        demo.cancel();
        el.classList.add('is-complete');
        rabbitBox.innerHTML = rabbit('celebrating');
        completeTimer = window.setTimeout(hooks.onComplete, reducedMotion() ? 700 : 2000);
        break;
    }
  }

  function attempt(piece: number, slot: number) {
    const r = reduce(state, { type: 'place', piece, slot });
    state = r.state;
    if (r.effects.length === 0) backHome(piece);
    r.effects.forEach(apply);
  }

  // Arrastar ou tocar: o mesmo gesto começa no pointerdown da peça.
  let drag: { i: number; x0: number; y0: number; moved: boolean } | null = null;
  el.addEventListener('pointerdown', (e) => {
    const p = (e.target as Element).closest<HTMLButtonElement>('.jig-piece');
    if (!p || p.disabled) return;
    drag = { i: Number(p.dataset.i), x0: e.clientX, y0: e.clientY, moved: false };
    p.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    if (!drag.moved) {
      drag.moved = true;
      select(drag.i);
      pieceEls[drag.i].classList.add('is-dragging');
    }
    pieceEls[drag.i].style.translate = `${dx}px ${dy}px`;
  });
  el.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const { i, moved } = drag;
    drag = null;
    const p = pieceEls[i];
    p.classList.remove('is-dragging');
    if (!moved) return select(selected === i ? null : i); // toque: pega ou solta a peça
    p.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.jig-slot');
    p.style.pointerEvents = '';
    if (target) attempt(i, Number(target.dataset.i));
    else {
      backHome(i); // soltou fora do tabuleiro: não é tentativa
      select(null);
    }
  });
  el.addEventListener('pointercancel', () => {
    if (drag) backHome(drag.i);
    drag = null;
  });
  // Toque no espaço com uma peça "na mão".
  el.addEventListener('click', (e) => {
    const s = (e.target as Element).closest<HTMLElement>('.jig-slot');
    if (s && selected !== null) attempt(selected, Number(s.dataset.i));
  });

  const onResize = () => relayout();
  window.addEventListener('resize', onResize);
  // A tela já está no documento: dá para medir e espalhar as peças sem esperar um quadro.
  relayout();
  el.classList.add('is-ready');
  if (hooks.demoFirst) {
    requestAnimationFrame(() => demo.run([pieceEls[0], slots[0]]));
    hooks.onDemoSeen();
  }

  return {
    help() {
      if (state.completed) return;
      hooks.onHelp();
      const i = state.filled.indexOf(false);
      slots[i].classList.add('is-hint');
      demo.run([pieceEls[i], slots[i]]);
    },
    destroy() {
      demo.cancel();
      clearTimeout(completeTimer);
      window.removeEventListener('resize', onResize);
    },
  };
}
