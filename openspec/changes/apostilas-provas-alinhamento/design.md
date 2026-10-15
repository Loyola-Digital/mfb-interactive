# Design

## Context

O app tem um jardim único com 13 missões e seis tipos de jogo (`colors`, `paths`, `quantities`, `sentence`, `quiz`, `spelling`). Progresso é um log de eventos agregado igual no front e no back. Não há créditos de arte no Magnific.

## Goals / Non-Goals

**Goals:** conteúdo das três apostilas em dados (`missions.json`), sem código por exercício; provas e alinhamento reaproveitando o jogo Escolher; nenhuma dependência nova.

**Non-Goals:** áudio; correção de escrita à mão; histórias do capítulo 6 da Explorers; recortar/colar; nota que bloqueie a próxima apostila.

## Decisions

### 1. Apostila → capítulo → missão, com posições calculadas
`missions.json` passa a ter `books[]`, cada um com `chapters[]` e cada capítulo com `missions[]`. O id da missão é `<LIVRO>-<NN>` (`CO1-04`) e o da prova `<LIVRO>-P<N>`. A posição no jardim deixa de ser escrita à mão: um zigue-zague calculado pelo índice. `icon` é opcional (padrão: a primeira figura do jogo).

### 2. Jogo Escolher com rodadas
`pick.rounds[]`: `prompt` e `options[]` são "cartas" (`art`, `text`, `count` para repetir a figura, `shape` para forma em SVG, `size` para comparar tamanho). A regra reaproveita o redutor de escolha (`choice.ts`) por rodada. Uma rodada só termina na resposta certa, como no quiz.
- *Alternativa: um tipo por atividade do livro.* Rejeitada: dezenas de telas quase iguais.

### 3. Prova = Escolher em modo prova
`GameHooks.test` desliga demonstração, botão de ajuda e ajuda progressiva. Na prova, a primeira escolha da rodada é a resposta: certa ou errada, a rodada avança com a mesma transição neutra. Ao fim, `onComplete({ right, total })`. O evento `completed` leva `data: { right, total }`.

### 4. Alinhamento adaptativo simples
Banco de rodadas por nível em `placement` no JSON. Começa no nível 1, quatro rodadas por nível; com 3 ou mais acertos sobe de nível, senão para. A sugestão é o nível mais alto em que a criança não passou (ou o último). Eventos: `placement` (`data.book` sugerido) e `bookChosen` (`data.book`). Apostila atual = último `bookChosen`.

### 5. Figuras dos PDFs
Script local (PyMuPDF) acha cada rótulo de palavra na página e recorta a figura logo acima, usando a caixa da imagem ou do grupo de vetores. As figuras escolhidas viram `web/public/content/img/<chave>.webp` (até 240 px). `img(chave)` usa a arte empacotada quando existe e, se não, `/content/img/<chave>.webp`. O script fica fora do repositório, como o de arte do Magnific.

### 6. Dados extras no evento
`progress_events.data` (TEXT JSON, opcional) com migração `ALTER TABLE` se a coluna não existir. Validação: `data` só aceita `{ right, total }` inteiros (0 ≤ right ≤ total ≤ 50) ou `{ book }` de um id conhecido pelo formato.

### 7. Três abas separadas
Pedido do usuário em 15/10/2026: exercícios, provas e teste de alinhamento em abas próprias. A trilha do jardim passa a ter só exercícios; as provas ganham uma lista por capítulo (`#/provas`) e o teste uma aba (`#/alinhamento`). A aba Provas não mostra acertos, porque a criança vê a tela; eles continuam na área dos pais.

## Risks / Trade-offs

- [Atividades de som sem áudio] → viram leitura (Explorers) ou o adulto lê o enunciado; anotado no `adultTip`.
- [Uso das figuras da apostila no app] → são do material da Fernanda; confirmar com ela a licença dos bancos de imagem para uso digital.
- [Volume de conteúdo sem revisão pedagógica] → `bookRef` em cada missão para a Fernanda conferir página a página.
