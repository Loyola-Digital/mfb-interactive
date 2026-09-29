# Design

## Context

Mesmo contrato de jogo das mudanças anteriores (`GameModule` com `play`/`result`, redutores puros com efeitos, conteúdo validado em `shared/content.ts`). Arte e pipeline de recorte descritos em `jardim-completo/design.md`.

## Goals / Non-Goals

**Goals:** três tipos novos com testes de redutor; nenhuma dependência nova; só uma ilustração nova (abelha).

**Non-Goals:** arrastar peças (o PRD pede toque); frases além de "It's a ___"; letras minúsculas/cursivas; mais de uma área no mundo.

## Decisions

### 1. Um redutor de sequência para frase e palavra
Frase e palavra são "tocar o item certo para o próximo espaço". `games/sequence.ts` recebe a lista de chaves esperadas (`["It's","a","bee"]` ou `["B","E","E"]`); o evento `tap(key)` é válido quando `key` é a chave do próximo espaço, o que resolve letras repetidas sem identificar qual peça física foi usada. A tela remove a peça tocada. Mesmo padrão de erros e ajuda dos outros jogos.
- *Alternativa: reaproveitar o redutor de Caminhos.* Ele trata "pedra já alcançada" como neutra e indexa por posição, o que não serve para letras repetidas.

### 2. Um redutor de escolha para o quiz
`games/choice.ts`: opções, resposta, descartadas. Errar descarta a opção (não pode ser escolhida de novo e aparece riscada e esmaecida) e conta tentativa; duas seguidas destacam a certa.

### 3. Peças de quebra-cabeça por CSS
As peças usam, por posição na frase, uma combinação fixa de cor de token e forma (`coral` + estrela, `sky` + coração, `yellow` + desenho do bicho). O espaço vazio mostra o contorno tracejado da mesma cor com o mesmo ícone. Sem imagem nova.

### 4. Sombra por filtro
A sombra do quiz é a própria ilustração com `filter: brightness(0)` e opacidade reduzida. As letras apagadas da palavra são o mesmo texto em `--font-display` com cor `--hairline` e contorno.

### 5. Jardim mais alto
A altura mínima do jardim passa a ser proporcional ao número de missões (`--missions` × 96 px), mantendo as posições em %; ao abrir, `scrollIntoView` centraliza a missão sugerida. O caminho continua um só.

## Risks / Trade-offs

- [Vocabulário fora da apostila analisada] → registrado no `bookRef` de cada missão como proposta a validar com a Fernanda.
- [Crianças de 3 anos podem achar a montagem de palavras difícil] → letras apagadas no molde e ajuda progressiva; o teste com famílias decide se a M12/M13 fica.
- [Jardim longo em telas pequenas] → rolagem automática até a sugerida; ordem das missões segue a trilha.
