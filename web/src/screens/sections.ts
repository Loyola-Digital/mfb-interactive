// Cabeçalho das três abas principais (Exercícios, Provas, Teste de alinhamento) e seletor de apostila.
import type { BookId, Mission } from '../../../shared/content.ts';
import type { App } from '../main.ts';
import { esc, logo } from '../ui.ts';

export type Section = 'exercicios' | 'provas' | 'alinhamento';

const SECTIONS: [Section, string, string][] = [
  ['exercicios', 'Exercícios', '#/'],
  ['provas', 'Provas', '#/provas'],
  ['alinhamento', 'Teste de alinhamento', '#/alinhamento'],
];

/** Missões da apostila na ordem do livro: só exercícios, ou só provas. */
export function bookList(app: App, test: boolean, id: BookId = app.book.id): Mission[] {
  const book = app.books.find((b) => b.id === id);
  return book ? book.chapters.flatMap((c) => c.missions).filter((m) => Boolean(m.test) === test) : [];
}

/** Para onde voltar depois de uma missão: a aba de onde ela vem. */
export const sectionOf = (m: Mission) => (m.test ? '#/provas' : '#/');

export function sectionHeader(current: Section): string {
  return `<header class="topbar topbar--garden">${logo}<a class="mfb-btn mfb-btn--outline mfb-btn--sm" href="#/pais">Área dos pais</a></header>
    <nav class="section-tabs" aria-label="Seções">
      ${SECTIONS.map(([id, label, href]) => `<a class="section-tab${id === current ? ' is-current' : ''}" href="${href}"${id === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>`;
}

export function bookTabs(app: App): string {
  return `<nav class="book-tabs" aria-label="Apostilas">${app.books.map((b) => `<button type="button" class="book-tab${b.id === app.book.id ? ' is-current' : ''}"
      data-book="${b.id}" aria-pressed="${b.id === app.book.id}">${esc(b.title)}</button>`).join('')}</nav>`;
}

/** Troca de apostila pelas abas e redesenha a tela atual. */
export function bindBookTabs(app: App, rerender: () => void) {
  // Em tela estreita a aba atual pode ficar fora da faixa rolável.
  const current = app.root.querySelector<HTMLElement>('.book-tab.is-current');
  const strip = current?.parentElement;
  if (current && strip) strip.scrollLeft = current.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft - 16;
  app.root.querySelector('.book-tabs')?.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest<HTMLElement>('[data-book]');
    if (!tab || tab.dataset.book === app.book.id) return;
    app.chooseBook(tab.dataset.book as BookId);
    rerender();
  });
}
