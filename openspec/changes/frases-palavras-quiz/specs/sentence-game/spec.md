# Spec Delta

## Purpose

Define o quebra-cabeça de montar frases: cada palavra de "It's a ___" é uma peça de quebra-cabeça espalhada pela tela, com o bicho em destaque, e as missões M07 a M09.

## ADDED Requirements

### Requirement: Frase como quebra-cabeça
O jogo SHALL mostrar o bicho em destaque, um tabuleiro com o contorno de cada palavra da frase (palavra apagada dentro) e as peças espalhadas. Cada peça SHALL ter formato de quebra-cabeça que encaixa na vizinha; a última peça SHALL trazer o desenho do bicho junto da palavra. Cada peça SHALL ter pelo menos 56 × 56 px CSS. A criança MUST NOT precisar ler: o formato de cada peça indica o seu lugar.

#### Scenario: Início da M07
- **WHEN** a M07 começa
- **THEN** aparecem a abelha, três contornos ("It's", "a" e a abelha) e as três peças espalhadas

### Requirement: Encaixe por formato na frase
As regras de encaixe, toque ou arraste, tentativa inválida, ajuda progressiva e conclusão SHALL ser as mesmas do quebra-cabeça de palavras (`spelling-game`). No fim, a frase completa SHALL aparecer junto ao bicho.

#### Scenario: Frase completa fora de ordem
- **WHEN** a criança encaixa primeiro a peça da abelha, depois "It's" e por último "a"
- **THEN** a frase "It's a bee" fica completa e a missão é concluída

### Requirement: Missões M07, M08 e M09
M07, M08 e M09 SHALL montar "It's a bee", "It's a frog" e "It's a rabbit", com o desenho da abelha, do sapo e do coelho em destaque e na última peça.

#### Scenario: Configuração da M08
- **WHEN** a M08 é iniciada
- **THEN** o sapo aparece em destaque e as peças são "It's", "a" e a peça do sapo com "frog"
