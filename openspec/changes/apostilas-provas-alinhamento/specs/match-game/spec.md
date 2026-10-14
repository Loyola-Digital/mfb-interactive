# Spec Delta

## Purpose

Jogo Ligar: pares de cartas para ligar, como os "draw lines from… to…" das apostilas.

## ADDED Requirements

### Requirement: Ligar pares
A missão Ligar SHALL ter de 3 a 6 pares em duas colunas embaralhadas. A criança SHALL tocar numa carta (que fica destacada) e depois na carta da outra coluna; arrastar MUST NOT ser obrigatório. Par certo SHALL ficar ligado e travado com a mesma cor; par errado SHALL balançar e contar como erro. Com todos os pares ligados a missão SHALL ser concluída uma única vez.

#### Scenario: Maiúscula e minúscula
- **WHEN** a criança toca em "B" e depois em "b"
- **THEN** as duas cartas ficam ligadas e não podem mais ser tocadas

### Requirement: Ajuda no Ligar
Após dois erros seguidos, a carta parceira da carta selecionada (ou da primeira carta livre) SHALL ser destacada e a ajuda registrada.

#### Scenario: Dois erros seguidos
- **WHEN** a criança erra dois pares seguidos
- **THEN** o par certo da carta escolhida brilha
