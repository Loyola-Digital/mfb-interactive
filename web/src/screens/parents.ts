import type { BookId, Mission } from '../../../shared/content.ts';
import type { App } from '../main.ts';
import { confirmDialog, esc, logo, mount } from '../ui.ts';
import { syncNotice } from './garden.ts';

export function showParents(app: App) {
  render();

  function render() {
    const state = app.progress.state;
    const practiced = (m: Mission) => (state.missions[m.id]?.plays ?? 0) > 0;

    const row = (m: Mission) => {
        const p = state.missions[m.id];
        if (m.test) {
          const score = p.lastScore;
          return `<li class="report__row">
            <div><strong class="body-strong">${esc(m.title)}</strong>
              <p class="small muted">${score ? `Última vez: acertou ${score.right} de ${score.total}` : 'Ainda não terminada'} · feita até o fim ${p.scored} ${p.scored === 1 ? 'vez' : 'vezes'}</p></div>
            <div class="report__tags"><span class="mfb-pill mfb-pill--coral mfb-pill--sm">prova</span>
              ${score ? `<span class="mfb-pill mfb-pill--sm">${score.right} de ${score.total}</span>` : ''}</div>
          </li>`;
        }
        const tags = [
          '<span class="mfb-pill mfb-pill--sm">praticado</span>',
          p.completed ? '<span class="mfb-pill mfb-pill--leaf mfb-pill--sm">concluído</span>' : '',
          p.completedWithHelp || p.helpCount > 0 ? '<span class="mfb-pill mfb-pill--sky mfb-pill--sm">com ajuda</span>' : '',
          p.skips > 0 ? '<span class="mfb-pill mfb-pill--coral mfb-pill--sm">pulado</span>' : '',
        ].join('');
        const details = [`jogou ${p.plays} ${p.plays === 1 ? 'vez' : 'vezes'}`];
        if (p.helpCount > 0) details.push(`ajuda do app usada ${p.helpCount} ${p.helpCount === 1 ? 'vez' : 'vezes'}`);
        if (p.skips > 0) details.push(`pulada ${p.skips} ${p.skips === 1 ? 'vez' : 'vezes'}`);
        return `<li class="report__row">
          <div><strong class="body-strong">${esc(m.title)}</strong>
            <p class="small muted">Conteúdo apresentado: <span class="word">${esc(m.word ?? '')}</span> = ${esc(m.meaning ?? '')}</p>
            <p class="small muted">${details.join(' · ')}</p></div>
          <div class="report__tags">${tags}</div>
        </li>`;
    };

    const report = app.books.map((b) => {
      const chapters = b.chapters
        .map((c) => ({ c, done: c.missions.filter(practiced) }))
        .filter((x) => x.done.length > 0)
        .map(({ c, done }) => `<h3 class="report__chapter">${esc(c.title)}</h3><ul class="report">${done.map(row).join('')}</ul>`)
        .join('');
      return chapters ? `<h2 class="heading report__book">${esc(b.title)}</h2>${chapters}` : '';
    }).join('');
    const suggestion = app.books.find((b) => b.id === state.placement);

    mount(app.root, `<div class="screen screen--adult">
      <header class="topbar">${logo}<a class="mfb-btn mfb-btn--outline mfb-btn--sm" href="#/">Voltar ao jardim</a></header>
      <section class="mfb-card adult-card">
        <h1 class="title">Área dos pais</h1>
        <p class="muted">O que foi praticado no app, por apostila. Concluir uma brincadeira mostra que ela foi feita, não mede o inglês da criança. Só as provas mostram acertos.</p>
        ${report || '<p class="report__empty">Ainda não há atividades praticadas.</p>'}
      </section>
      <section class="mfb-card adult-card">
        <h2 class="heading">Apostila</h2>
        <p>Apostila atual: <strong class="body-strong">${esc(app.book.title)}</strong></p>
        <p class="small muted">${suggestion ? `O último teste de alinhamento sugeriu ${esc(suggestion.title)}.` : 'O teste de alinhamento ainda não foi feito.'}</p>
        <div class="book-tabs book-tabs--inline">${app.books.map((b) => `<button type="button" class="book-tab${b.id === app.book.id ? ' is-current' : ''}" data-book="${b.id}" aria-pressed="${b.id === app.book.id}">${esc(b.title)}</button>`).join('')}</div>
        <div class="actions"><a class="mfb-btn mfb-btn--outline" href="#/alinhamento">${suggestion ? 'Refazer o teste' : 'Fazer o teste'}</a></div>
      </section>
      ${app.role === 'admin' ? `<section class="mfb-card adult-card">
        <span class="mfb-pill mfb-pill--coral mfb-pill--sm">Administração</span>
        <h2 class="heading">Links de acesso</h2>
        <p class="small muted">Gere links para novas famílias entrarem ou para quem esqueceu a senha.</p>
        <div class="actions"><a class="mfb-btn mfb-btn--primary" href="#/admin">Abrir administração</a></div>
      </section>` : ''}
      <section class="mfb-card adult-card">
        <h2 class="heading">Sua conta</h2>
        <p><span class="muted">E-mail:</span> <strong class="body-strong">${esc(app.email)}</strong></p>
        <p class="small muted">O progresso fica salvo na sua conta e aparece em qualquer aparelho em que você entrar com este e-mail.</p>
        <div class="parents-notes">${syncNotice(app)}</div>
        <div class="actions">
          <button class="mfb-btn mfb-btn--outline" data-logout>Sair da conta</button>
          <button class="mfb-btn mfb-btn--outline danger" data-clear>Apagar progresso</button>
        </div>
        <p class="form-error" role="alert" hidden></p>
      </section>
    </div>`);

    app.root.querySelectorAll<HTMLElement>('[data-book]').forEach((b) => b.addEventListener('click', () => {
      app.chooseBook(b.dataset.book as BookId);
      render();
    }));

    app.root.querySelector('[data-logout]')!.addEventListener('click', async () => {
      const warn = app.progress.pending > 0 ? ' Há progresso ainda não enviado, que será perdido neste aparelho.' : '';
      if (await confirmDialog(`Sair da conta?${warn}`, 'Sair')) await app.logout();
    });

    app.root.querySelector('[data-clear]')!.addEventListener('click', async () => {
      const ok = await confirmDialog('Apagar todo o progresso desta conta, em todos os aparelhos? Não dá para desfazer.', 'Apagar');
      if (!ok) return;
      if (await app.progress.clearAll()) return render();
      const err = app.root.querySelector<HTMLElement>('.form-error')!;
      err.textContent = 'Não foi possível apagar agora. Verifique a internet e tente de novo.';
      err.hidden = false;
    });

    app.onProgressChange(() => {
      const notes = app.root.querySelector('.parents-notes');
      if (notes) notes.innerHTML = syncNotice(app);
    });
  }
}
