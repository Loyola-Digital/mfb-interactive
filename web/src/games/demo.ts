// Demonstração com a mão, comum aos jogos: toca cada alvo em ordem e devolve o controle.
// Nunca executa a jogada. Um toque durante a demonstração só a encerra.
import { hand } from '../art.ts';
import { reducedMotion } from '../ui.ts';

export function createDemo(root: HTMLElement) {
  const box = document.createElement('div');
  box.className = 'demo-hand';
  box.hidden = true;
  box.innerHTML = hand;
  root.append(box);
  let stop: (() => void) | null = null;

  function run(targets: Element[]) {
    stop?.();
    const area = root.getBoundingClientRect();
    const at = (node: Element) => {
      const r = node.getBoundingClientRect();
      return `translate(${r.left - area.left + r.width / 2 - 8}px, ${r.top - area.top + r.height / 2 - 8}px)`;
    };
    const reduced = reducedMotion();
    // Cada alvo: chega, "aperta", solta. Sem movimento reduzido, a mão entra por baixo.
    const frames: Keyframe[] = [];
    const lead = reduced ? 0 : 0.12;
    if (!reduced) frames.push({ transform: `translate(${area.width / 2}px, ${area.height + 40}px) scale(1)`, offset: 0 });
    targets.forEach((t, i) => {
      const seg = (1 - lead) / targets.length;
      const o = lead + i * seg;
      const p = at(t);
      frames.push({ transform: `${p} scale(1)`, offset: o + seg * 0.25 * (reduced && i === 0 ? 0 : 1) });
      frames.push({ transform: `${p} scale(0.82)`, offset: o + seg * 0.6 });
      frames.push({ transform: `${p} scale(1)`, offset: o + seg * 0.8 });
    });
    frames[0].offset = 0;
    frames[frames.length - 1].offset = 1;

    box.hidden = false;
    const anim = box.animate(frames, {
      duration: 1300 * targets.length + (reduced ? 0 : 500),
      easing: reduced ? 'steps(1, end)' : 'ease-in-out',
      fill: 'forwards',
    });
    const swallow = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      const eat = (c: Event) => c.stopPropagation();
      root.addEventListener('click', eat, { capture: true, once: true });
      setTimeout(() => root.removeEventListener('click', eat, true), 600);
      stop?.();
    };
    stop = () => {
      anim.cancel();
      box.hidden = true;
      root.removeEventListener('pointerdown', swallow, true);
      stop = null;
    };
    root.addEventListener('pointerdown', swallow, true);
    anim.finished.then(() => stop?.(), () => {});
  }

  return {
    run,
    cancel: () => stop?.(),
  };
}

/** Reinicia uma animação CSS de "cutucada" num elemento. */
export function nudge(node: Element, cls = 'is-nudged') {
  node.classList.remove(cls);
  void (node as HTMLElement).offsetWidth;
  node.classList.add(cls);
}
