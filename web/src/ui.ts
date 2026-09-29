import logoUrl from '../../design-system/assets/Logos/logo-mfb-dark.png';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

/** Embaralha sem deixar na ordem original (senão a montagem vira trivial). */
export function shuffled<T>(items: T[], rng: () => number = Math.random): T[] {
  if (items.length < 2 || new Set(items).size < 2) return [...items];
  for (;;) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.some((x, i) => x !== items[i])) return a;
  }
}

export const reducedMotion =() => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const logo = `<img class="logo" src="${logoUrl}" alt="Meu Filho Bilíngue">`;

export function mount(root: HTMLElement, markup: string): HTMLElement {
  root.innerHTML = markup;
  root.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  return root;
}

/** Confirmação com <dialog> nativo. Resolve true só se o adulto confirmar. */
export function confirmDialog(message: string, confirmLabel: string, cancelLabel = 'Cancelar'): Promise<boolean> {
  const dialog = document.createElement('dialog');
  dialog.className = 'confirm mfb-card';
  dialog.innerHTML = `<p class="body-strong">${esc(message)}</p>
    <form method="dialog" class="actions">
      <button class="mfb-btn mfb-btn--outline" value="no">${esc(cancelLabel)}</button>
      <button class="mfb-btn mfb-btn--primary" value="yes">${esc(confirmLabel)}</button>
    </form>`;
  document.body.append(dialog);
  dialog.showModal();
  // Resolve no submit/cancel, sem depender do evento close (que o Chrome adia em aba oculta).
  return new Promise((resolve) => {
    const done = (answer: boolean) => {
      dialog.close();
      dialog.remove();
      resolve(answer);
    };
    dialog.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault();
      done((e.submitter as HTMLButtonElement | null)?.value === 'yes');
    });
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      done(false);
    });
  });
}
