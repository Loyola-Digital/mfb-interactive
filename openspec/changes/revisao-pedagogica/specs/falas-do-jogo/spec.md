# Spec Delta

## Purpose

Falas durante o jogo: instrução, palavras, acerto e erro.

## ADDED Requirements

### Requirement: Instrução falada
Todo exercício SHALL ter `instruction` com `pt` e `en`. Ao abrir o jogo, o app SHALL falar a frase em português e depois em inglês, e mostrar na barra de cima um botão que fala as duas de novo.

#### Scenario: Um a mais
- **WHEN** a criança abre "Um a mais"
- **THEN** o app fala "Qual desses tem um a mais?" e depois "Which one has one more?", e só então a fala da rodada

### Requirement: Acerto e erro falados
Fora da prova, o app SHALL falar "Good job!", "Great!" ou "Well done!" (em rodízio) ao acertar e "Oops! Try again." ao errar. Quando a carta certa tem `audio`, ela SHALL ser falada antes do elogio. Na prova MUST NOT haver fala de acerto nem de erro.

#### Scenario: Antes, depois e no meio
- **WHEN** a rodada mostra "4 _" e a criança toca no 5
- **THEN** o app fala "five" e depois o elogio, e a próxima rodada fala o seu número em seguida

#### Scenario: Errou
- **WHEN** a criança toca numa opção errada
- **THEN** o app interrompe o que estava falando e diz "Oops! Try again."

### Requirement: Fala da carta
Uma carta do Escolher ou do Ligar SHALL poder ter `audio`. No Ligar, tocar na carta SHALL falar o texto e ligar o par SHALL falar o texto do par e o elogio.

#### Scenario: Ligue o giz
- **WHEN** a criança toca no giz vermelho
- **THEN** o app fala "red"

### Requirement: Palavra no jogo
Traçar, pintar, plantar e montar palavra ou frase SHALL mostrar o alto-falante junto do modelo e falar a palavra da missão ao abrir. Plantar SHALL contar em voz alta cada tulipa plantada.

#### Scenario: Traçado
- **WHEN** a criança abre "Passeio do coelhinho"
- **THEN** o modelo mostra "rabbit" com alto-falante e o app fala "rabbit" depois da instrução

### Requirement: Demonstração sem resposta
A demonstração do Escolher SHALL tocar só no modelo da rodada e MUST NOT apontar nenhuma opção.

#### Scenario: Primeira vez no Um a mais
- **WHEN** a demonstração roda na primeira rodada
- **THEN** a mão aperta o modelo e some, sem passar pelas opções
