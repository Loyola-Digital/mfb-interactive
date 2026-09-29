# Proposal

## Why

Depois do piloto da M03 (`piloto-m03-sapinho-verde`), o jardim tinha só uma missão jogável e desenhos provisórios. O usuário pediu, em 29/09/2026, para completar o jardim: todas as seis missões do PRD jogáveis e o visual refeito com ilustrações do Magnific, no mesmo estilo do coelho aprovado.

## What Changes

- Jogo de **Caminhos** (M01 "Vamos ao jardim", 3 pedras em linha reta; M02 "Passeio do coelhinho", 4 pedras em curva): tocar na próxima pedra leva o coelho até ela; ao fim ele chega ao destino (portão do jardim, canteiro de cenouras).
- Jogo de **Quantidades** (M05 "Uma flor", 1 cova; M06 "Duas flores", 2 covas): tocar no cesto pega uma tulipa, tocar numa cova vazia planta uma.
- **M04 "A banana amarela"** usando o jogo de Cores existente, com três tintas.
- Desenhos pintáveis (sapo e banana) passam a ser ilustrações do Magnific em duas camadas: área da cor, pintada com a variável da tinta, e traço por cima.
- Jardim redesenhado: caminho de terra ligando os pontos, cada missão com a própria ilustração (portão, cenouras, sapo, banana, uma tulipa, duas tulipas) e nenhuma missão "em breve".
- Demonstração da mão compartilhada pelos três tipos de jogo.

## Capabilities

### New Capabilities
- `paths-game`: regras do jogo de Caminhos e as missões M01 e M02.
- `quantities-game`: regras do jogo de Quantidades e as missões M05 e M06.

### Modified Capabilities
- `color-game`: nova missão M04 "A banana amarela" (requisito adicionado; regras do jogo inalteradas).
- `app-shell`: jardim ilustrado com uma ilustração por missão (requisito adicionado).

## Impact

- Código em `web/src/games/` (dois jogos novos, demonstração compartilhada), `web/src/art.ts`, `web/src/screens/garden.ts`, `shared/content.ts` (validação dos novos tipos) e `web/public/content/missions.json`.
- Arte nova em `web/src/assets/art/` (WebP com transparência).
- Depende das specs de `piloto-m03-sapinho-verde`, que ainda não foi arquivada; arquivar aquela antes desta.
- Textos de M01, M02, M04, M05 e M06 são proposta e precisam da revisão da Fernanda, como os da M03.
