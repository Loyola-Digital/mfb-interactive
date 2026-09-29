# Spec Delta

## Purpose

Define o jogo de montar frases com peças de quebra-cabeça, jogável sem leitura porque cada espaço tem a forma e a cor da sua peça, e as missões M07 a M09.

## ADDED Requirements

### Requirement: Peças e espaços casados por forma e cor
O jogo SHALL mostrar a frase como uma fileira de espaços vazios e, embaixo, as peças embaralhadas. Cada peça SHALL ter uma forma e uma cor próprias, repetidas no contorno do seu espaço; a peça do bicho SHALL trazer o desenho do bicho. Cada peça SHALL ter pelo menos 56 × 56 px CSS. A criança MUST NOT precisar ler para saber onde cada peça vai.

#### Scenario: Início da M07
- **WHEN** a M07 começa
- **THEN** aparecem três espaços vazios, com as formas de "It's", "a" e da abelha, e as três peças embaralhadas embaixo

### Requirement: Montar da esquerda para a direita
O próximo espaço vazio, da esquerda para a direita, SHALL estar destacado. Tocar na peça desse espaço SHALL encaixá-la nele. Tocar numa peça de outro espaço SHALL contar como tentativa inválida, sem tirar peças já encaixadas. Tocar no fundo MUST NOT contar.

#### Scenario: Peça certa
- **WHEN** a criança toca na peça "It's" com o primeiro espaço destacado
- **THEN** a peça encaixa no primeiro espaço e o segundo passa a ser destacado

#### Scenario: Peça fora de ordem
- **WHEN** a criança toca na peça da abelha com o primeiro espaço destacado
- **THEN** a peça balança, nada encaixa e uma tentativa inválida é contada

### Requirement: Ajuda progressiva e conclusão
Após duas tentativas inválidas seguidas, a peça certa SHALL ser destacada e a demonstração repetida, sem encaixá-la. Com todos os espaços preenchidos, a frase completa SHALL aparecer junto ao desenho e a missão SHALL ser concluída uma única vez.

#### Scenario: Frase completa
- **WHEN** a última peça encaixa
- **THEN** a frase "It's a bee" aparece completa com a abelha e a missão é concluída

### Requirement: Missões M07, M08 e M09
M07, M08 e M09 SHALL montar "It's a bee", "It's a frog" e "It's a rabbit", com o desenho da abelha, do sapo e do coelho na última peça.

#### Scenario: Configuração da M08
- **WHEN** a M08 é iniciada
- **THEN** as peças são "It's", "a" e a peça do sapo com a palavra "frog"
