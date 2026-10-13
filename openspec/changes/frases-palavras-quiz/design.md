# Design

## Context

Mesmo contrato de jogo das mudanças anteriores (`GameModule` com `play`/`result`, redutores puros com efeitos, conteúdo validado em `shared/content.ts`). Arte e pipeline de recorte descritos em `jardim-completo/design.md`.

## Goals / Non-Goals

**Goals:** três tipos novos com testes de redutor; nenhuma dependência nova; só uma ilustração nova (abelha).

**Non-Goals:** arrastar como único jeito de jogar (o PRD pede que só toque baste); frases além de "It's a ___"; letras minúsculas/cursivas; mais de uma área no mundo.

## Decisions

### 1. Quebra-cabeça com encaixe por formato (palavra e frase)
Pedido do usuário em 13/10/2026: jogos mais lúdicos, com o bicho na tela, peças espalhadas que se encaixam. `games/jigsaw.ts` (redutor) aceita `place(peça, espaço)`, válido quando os índices coincidem e o espaço está livre, em qualquer ordem. Como cada peça tem um formato único (orelha à direita, recorte à esquerda), letras repetidas viram peças distintas e a regra continua "peça i → espaço i". `games/jigsaw-view.ts` desenha os contornos em SVG gerados por código, espalha as peças numa grade embaralhada com giro e trata arrastar (Pointer Events com captura) e tocar-depois-tocar com o mesmo gesto inicial.
- *Substitui* a versão anterior (peças em fileira, ordem da esquerda para a direita), que o usuário achou pouco lúdica.
- *Alternativa: arrastar obrigatório.* Mais natural num quebra-cabeça, mas o PRD exige que tudo funcione só com toque.

### 2. Um redutor de escolha para o quiz
`games/choice.ts`: opções, resposta, descartadas. Errar descarta a opção (não pode ser escolhida de novo e aparece riscada e esmaecida) e conta tentativa; duas seguidas destacam a certa.

### 3. Peças em SVG com cores de token
Cada peça usa uma cor de token em rodízio (`coral`, `yellow`, `sky`, `leaf`) e contorno `--ink`; o espaço vazio mostra o mesmo contorno tracejado com a letra ou palavra apagada. Sem imagem nova além do bicho.

### 4. Sombra por filtro
A sombra do quiz é a própria ilustração com `filter: brightness(0)` e opacidade reduzida. As letras apagadas da palavra são o mesmo texto em `--font-display` com cor `--hairline` e contorno.

### 5. Jardim mais alto
A altura mínima do jardim passa a ser proporcional ao número de missões (`--missions` × 96 px), mantendo as posições em %; ao abrir, `scrollIntoView` centraliza a missão sugerida. O caminho continua um só.

## Risks / Trade-offs

- [Vocabulário fora da apostila analisada] → registrado no `bookRef` de cada missão como proposta a validar com a Fernanda.
- [Crianças de 3 anos podem achar a montagem de palavras difícil] → letras apagadas no molde e ajuda progressiva; o teste com famílias decide se a M12/M13 fica.
- [Jardim longo em telas pequenas] → rolagem automática até a sugerida; ordem das missões segue a trilha.
