Meu Filho Bilíngue ajuda pais a criarem filhos bilíngues dentro da rotina de casa, com o método da Fernanda Zapparoli. A marca é uma conversa entre pais e filhos: balões de fala coloridos, rabiscos feitos à mão e faixas de cor alegres, com texto sempre escuro e fácil de ler.

## Conteúdo e voz

- Fale com os pais, em "você", em português do Brasil. O inglês aparece como a fala da criança ("Hello!", "Good night!"), nunca como jargão.
- Frases curtas e concretas, ligadas à rotina: café da manhã, hora do banho, história antes de dormir.
- Títulos em sentence case, curtos, quebrados em até 3 linhas. Uma palavra-chave pode levar o rabisco (`mfb-scribble`).
- Botões em caixa alta, com verbo: "QUERO COMEÇAR", "VER PERGUNTAS".
- Faixa etária e números no formato brasileiro: 3–6 anos, R$ 497, 90 atividades.
- Sem emoji na interface; os ícones de tema são pequenos SVGs preenchidos com as cores da marca.

## Cor

- Cores da marca, do logo: `coral` (#FD6560) e `yellow` (#EFD43F), com `yellow-vivid` e `yellow-soft`. Em toda tela, coral e amarelo aparecem antes das cores de apoio.
- Cores de apoio, fora do logo, para a variedade lúdica das referências: `leaf` e `sky`. Elas nunca somam mais área que coral + amarelo na mesma tela.
- Cada cor tem um tint para fundos grandes: `coral-tint`, `yellow-tint`, `leaf-tint`, `sky-tint`.
- Texto é sempre `ink` (ou `ink-muted` para secundário). Sobre `coral`, amarelos, `leaf` e `sky` o texto é `on-accent` (preto). Branco sobre coral não é legível (2.9:1).
- Coral e verde como texto só nas versões `coral-ink` e `leaf-ink`.
- Há um só tema, claro. A marca é para o dia, não tem modo escuro.

## Tipografia

- Títulos em Grandstander (`--font-display`), peso 800: arredondada e com cara de desenho infantil. Estilos `display-hero`, `display`, `title`, `heading`.
- Texto em Poppins (`--font-sans`): `lead`, `body`, `body-strong`, `small`, `button`.
- Empirica Head (`--font-editorial`) é a fonte do site atual. Use só em peças de campanha que precisam conversar com ele, nunca junto com Grandstander.

## Forma, espaço e layout

- A página é uma sequência de faixas de largura total (`mfb-band`) com borda ondulada, alternando cor e branco. Nunca duas faixas da mesma cor seguidas; uma faixa verde ou amarela cheia por página.
- Conteúdo centralizado numa coluna de até 880px dentro de cada faixa, com título à esquerda e ilustração à direita, trocando de lado a cada faixa.
- Cards brancos com `shadow-card` e `radius-lg` sobre faixas coloridas; cards tingidos sem sombra sobre fundo branco.
- Tudo é arredondado: botões, pílulas e balões em `radius-pill`, cards em `radius-lg`, linhas de FAQ em `radius-md`. Nada de canto reto.
- Espaçamento em `space-1` a `space-8`; padding de faixa `space-8` no desktop e 64px no mobile.

## Elementos de assinatura

- **Balão de fala** (`mfb-bubble`): o gesto do logo. Use em grupos de 4 a 6, desalinhados, com olhos, rabisco ou uma fala curta.
- **Rabisco coral** (`mfb-scribble`) sob uma palavra do título.
- **Foto em dois arcos** (`mfb-arch`), com um balão de fala sobreposto.
- **Traço ondulado** grosso em coral ou amarelo passando atrás de fotos e personagens (desenhe como SVG, traço de 18–24px, ponta redonda).
- **Personagens**: a turma do grupo Personagens (Coco, Sol, Nino e Lulu), balões de fala com rosto derivados do logo. No máximo dois por tela. Não crie mascotes fora desse formato.

## Foco e estados

- Foco: `outline` sólido de 2px em `focus-ring`, com 2px de respiro. Já vem em `.mfb :focus-visible`.
- Hover de botão sobe 1px; desabilitado com opacidade .45.

## Logo e fotos

- Use os arquivos do grupo Logos, nunca redesenhe os balões.
- `logo-mfb-dark.png` (texto preto) vai sobre `surface` e sobre as faixas claras e coloridas. `logo-mfb-light.png` (texto branco) só sobre fotos escuras.
- Fotos: pais e crianças em casa, luz natural, rindo juntos. Recorte em `mfb-arch` ou em círculo.

## Como usar

Carregue `tokens.css` e `components/bundle.css` e coloque `class="mfb"` no elemento raiz. Os componentes são classes CSS com prefixo `mfb-` (sem JavaScript):

```html
<body class="mfb">
  <section class="mfb-band mfb-band--coral">
    <h2 class="display">Perguntas <span class="mfb-scribble">frequentes</span></h2>
    <div class="mfb-faq">
      <details><summary>Quanto tempo por dia?</summary><p>De 15 a 20 minutos.</p></details>
    </div>
    <a class="mfb-btn mfb-btn--primary" href="#comprar">Quero começar</a>
  </section>
</body>
```
