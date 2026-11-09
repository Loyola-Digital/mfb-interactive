# Spec Delta

## Purpose

Rodadas e missões de ouvir no Escolher, e falas no resultado.

## ADDED Requirements

### Requirement: Rodada de ouvir
Uma rodada do Escolher SHALL poder ter `audio`, falado ao abrir a rodada. Com `prompt`, o alto-falante SHALL aparecer no canto do enunciado; sem `prompt`, um alto-falante grande SHALL ser o enunciado. Rodada sem `prompt` e sem `audio` MUST ser recusada. A ajuda, a demonstração e a prova continuam como no Escolher.

#### Scenario: Ouça e toque
- **WHEN** abre a rodada "red" de "Ouça e toque: cores"
- **THEN** o app fala "red", mostra o alto-falante grande e três gizes; tocar no vermelho conclui a rodada

### Requirement: Missões de ouvir
O conteúdo SHALL ter missões de ouvir nas três apostilas, e o ponto delas no jardim SHALL mostrar o alto-falante. Os exercícios de som inicial e final SHALL falar o som da letra, e enunciados com palavra em inglês SHALL falar a palavra.

#### Scenario: Som do T
- **WHEN** abre uma rodada de "Som do T, B e M" com a letra t
- **THEN** o app toca o som /t/ e a criança escolhe a figura que começa com ele

### Requirement: Fala no resultado
Uma missão com `audio` SHALL falar o texto na tela de resultado, com o alto-falante ao lado da palavra. A tela de resultado da prova MUST NOT falar.

#### Scenario: Frase montada
- **WHEN** a criança termina "I am tall"
- **THEN** a tela de resultado mostra a frase e fala "I am tall"
