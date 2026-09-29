# Design

## Context

Base e decisões em `piloto-m03-sapinho-verde/design.md`: regras de jogo como redutor puro (`init`/`reduce` → efeitos), tela que traduz toques em eventos, mapa de tipos em `web/src/games/index.ts`, conteúdo em `missions.json` validado por `shared/content.ts`. Esta mudança adiciona dois tipos de jogo ao mapa sem alterar o fluxo de missão nem o progresso.

## Goals / Non-Goals

**Goals:**
- Caminhos e Quantidades com o mesmo contrato dos jogos (`GameHooks`/`GameHandle`) e testes de redutor como o de Cores.
- Arte do Magnific consistente com o coelho aprovado, com cores de tinta ainda vindas dos tokens.

**Non-Goals:**
- Variar posição de pedras e covas entre repetições (o PRD diz "podem variar"; fica para depois se os testes com famílias pedirem).
- Novos tipos de jogo além dos três do PRD.

## Decisions

### 1. Desenho pintável em duas camadas raster
Sapo e banana vêm do Magnific como ilustração colorida. Um script local (fora do repositório, com `sharp`) separa os pixels da cor pintável (por faixa de matiz) numa **máscara** e o resto (contorno, olhos, bochechas) num **traço** com transparência. Na tela, uma camada com `background: var(--paint)` recortada por `mask-image` (máscara) fica sob o `<img>` do traço. Resultado: aparência da ilustração, tinta exata do token, sem SVG gerado.
- *Alternativa: vetorizar com `images_to_svg` e reclassificar os `fill`.* Caminhos gerados são imprevisíveis e custa créditos a cada ajuste.
- *Alternativa: `filter: hue-rotate` na imagem colorida.* Cores aproximadas, fora dos tokens.

### 2. Recorte local do fundo
O modelo devolveu as figuras com halo branco semitransparente. O script achata sobre branco e apaga, a partir das bordas, tudo que é claro até encontrar o contorno escuro (flood fill). Funciona porque todas as figuras têm contorno fechado; evita pagar remoção de fundo por imagem.

### 3. Demonstração compartilhada
`web/src/games/demo.ts` exporta `demoHand(root, handBox, targets)` com a animação da mão (toque em cada alvo, na ordem), a versão de movimento reduzido e o cancelamento por toque. O jogo de Cores passa a usá-la; Caminhos mostra a próxima pedra; Quantidades mostra cesto → cova.

### 4. Caminhos
Estado: índice da próxima pedra, sequência de erros, concluído. Eventos: `tapStone(i)`. Efeitos: `advance(i)`, `invalid`, `autoHelp(next)`, `completed` (a última pedra dispara `advance` e `completed` juntos; a tela anima o coelho até a pedra e depois até o destino antes de chamar `onComplete`). Pedras e destino têm posição em % no conteúdo; a tela desenha a trilha por baixo com um SVG.

### 5. Quantidades
Estado: `holding` (tulipa na mão), covas preenchidas, sequência de erros, concluído. Eventos: `tapBasket`, `tapSlot(i)`. Plantar consome `holding`, então um segundo toque rápido cai em "sem tulipa na mão" (dica, não tentativa) — a regra de "uma ação por toque" sai do próprio estado.

### 6. Conteúdo
`game` passa a ser uma união por `type`: `colors` (inalterado), `paths` (`points`, `start`, `goal`, `goalArt`) e `quantities` (`slots`, `numeral`). Cada missão ganha `icon`, chave de ilustração usada no jardim. A validação de `shared/content.ts` cobre os três formatos.

### 7. Jardim
Trilha de terra desenhada com um caminho suave (Catmull-Rom → Bézier) pelos pontos, em duas camadas de traço (borda e miolo, cores de token). Cada ponto é um botão redondo com a ilustração da missão; número e marca de concluída continuam.

## Risks / Trade-offs

- [Máscara por matiz pode deixar frestas junto ao contorno] → máscara dilatada em 2 px sob o traço; conferido visualmente com as quatro tintas.
- [`mask-image` em Safari antigo] → usar também `-webkit-mask-image`; iOS 15.4+ suporta sem prefixo.
- [Coordenadas das pedras em % distorcem em telas muito largas] → cena com proporção fixa (`aspect-ratio`) e largura máxima.
