# Tasks

## 1. Arte

- [x] 1.1 Gerar no Magnific, com o coelho aprovado como referência de estilo, sapo, banana, tulipa, cova, cesto, portão, cenouras e pedra; verificar numa folha de conferência que o traço e as cores combinam com o coelho
- [x] 1.2 Recortar o fundo e gerar as camadas pintáveis (cor + traço) do sapo e da banana com o script local; verificar na folha de conferência o sapo branco e coral e a banana branca e azul sem frestas
- [x] 1.3 Copiar os WebP para `web/src/assets/art/` e registrar em `art.ts` (ilustrações, desenhos pintáveis, ícones das missões); verificar com `npm run build` que todos entram no bundle

## 2. Conteúdo

- [x] 2.1 Estender `shared/content.ts` com `icon` e os formatos de jogo `paths` e `quantities`; verificar com testes de conteúdo válido e inválido de cada tipo
- [x] 2.2 Preencher M01, M02, M04, M05 e M06 em `missions.json`, todas disponíveis; verificar com o teste do arquivo real conforme as specs `paths-game`, `quantities-game` e `color-game`

## 3. Jogos

- [x] 3.1 Extrair a demonstração da mão para `games/demo.ts` e usar no jogo de Cores, com desenho pintável em camadas; verificar no navegador que a M03 continua igual e que a M04 pinta a banana
- [x] 3.2 Redutor de Caminhos com testes (próxima pedra avança, fora de ordem é inválida, já alcançada e fundo não contam, ajuda após dois erros, última pedra conclui uma vez)
- [x] 3.3 Tela de Caminhos (trilha, pedras ≥64 px, destaque da próxima, coelho andando, destino, palavra `rabbit`, demonstração); verificar no navegador M01 e M02 do início ao fim
- [x] 3.4 Redutor de Quantidades com testes (pegar e plantar, cova sem tulipa é dica, cova ocupada é inválida, toque duplo planta uma, ajuda após dois erros, conclui ao encher)
- [x] 3.5 Tela de Quantidades (cesto, covas, tulipa na mão, modelo com numeral, palavra e figuras, demonstração); verificar no navegador M05 e M06 do início ao fim
- [x] 3.6 Registrar `paths` e `quantities` no mapa de jogos; verificar com teste que cada missão do conteúdo resolve para um jogo

## 4. Jardim

- [x] 4.1 Redesenhar o jardim com trilha de terra e a ilustração de cada missão nos pontos; verificar em 360 e 768 px que os seis pontos cabem, têm ≥56 px e que a marca de concluída aparece

## 5. Verificação integrada

- [x] 5.1 Jogar as seis missões em 360 px, conferir a área dos pais com os seis conteúdos e rodar `npm test`, `npm run typecheck` e `npm run build` sem erro
