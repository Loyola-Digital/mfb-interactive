# Tasks

## 1. Arte e conteúdo

- [x] 1.1 Gerar a abelha no Magnific, recortar com o script de arte e registrar `abelha` e `coelho` em `art.ts`; verificar o recorte numa imagem de conferência e com `npm run build`
- [x] 1.2 Estender `shared/content.ts` com os tipos `sentence`, `quiz` e `spelling`; verificar com testes de conteúdo válido e inválido de cada tipo
- [x] 1.3 Adicionar M07–M13 em `missions.json` com posições no jardim; verificar com o teste do arquivo real conforme as specs `sentence-game`, `quiz-game` e `spelling-game`

## 2. Regras

- [x] 2.1 Redutor de sequência (`sequence.ts`) com testes: próxima chave encaixa, chave errada é inválida, chaves repetidas intercambiáveis, ajuda após dois erros, conclui uma vez
- [x] 2.2 Redutor de escolha (`choice.ts`) com testes: certa conclui uma vez, errada descarta e conta, descartada não conta de novo, ajuda após dois erros

## 3. Telas

- [x] 3.1 Tela de Montar a frase (espaços com forma e cor, peças embaralhadas, destaque do próximo, demonstração, frase completa); verificar no navegador M07–M09
- [x] 3.2 Tela do Quiz da sombra (frase com sombra, três opções, descarte visível, destaque da certa); verificar no navegador M10 e M11
- [x] 3.3 Tela de Montar a palavra (desenho, letras apagadas, letras embaralhadas, destaque do próximo); verificar no navegador M12 e M13
- [x] 3.4 Registrar os três tipos no mapa de jogos e no resultado; verificar com teste que as 13 missões resolvem para um jogo

## 4. Jardim

- [x] 4.1 Jardim com altura proporcional às missões, ícones das novas missões (abelha, sombra, letras) e rolagem até a sugerida; verificar em 360 px que os 13 pontos não se sobrepõem e a sugerida aparece ao abrir

## 5. Verificação integrada

- [x] 5.1 Jogar M07–M13 em 360 px, conferir a área dos pais e rodar `npm test`, `npm run typecheck`, `npm run build`, e a busca por cor hex sem ocorrências

## 6. Quebra-cabeça lúdico (pedido de 13/10/2026)

- [x] 6.1 Redutor `jigsaw.ts` com testes (encaixe só no espaço do formato, qualquer ordem, espaço errado é inválido, peça/espaço ocupados não contam, ajuda após dois erros, conclui uma vez) substituindo `sequence.ts`
- [x] 6.2 Tela de quebra-cabeça compartilhada (bicho em destaque, contornos em SVG que se encaixam, peças espalhadas e giradas, arrastar e tocar-depois-tocar, volta ao lugar no erro, brilho no fim); verificar no navegador a M13 com mouse real arrastando e tocando
- [x] 6.3 Montar a palavra e Montar a frase usando o quebra-cabeça; verificar no navegador M13 e M09 até o resultado e rodar `npm test` e `npm run typecheck`
