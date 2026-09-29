# Spec Delta

## Purpose

Define o quiz de completar frases "It's a ___" escolhendo, pela sombra, o desenho certo entre três, e as missões M10 e M11.

## ADDED Requirements

### Requirement: Sombra como pista
O jogo SHALL mostrar "It's a" seguido de um espaço com a sombra do bicho certo, e três opções com desenho e palavra. Cada opção SHALL ter pelo menos 56 × 56 px CSS. A criança MUST NOT precisar ler: a pista é o formato da sombra.

#### Scenario: Início da M10
- **WHEN** a M10 começa
- **THEN** aparecem "It's a", a sombra da abelha e as opções abelha, sapo e coelho em ordem embaralhada

### Requirement: Escolher a opção
Tocar na opção certa SHALL encaixar o desenho e a palavra no espaço, completando a frase, e concluir a missão uma única vez. Tocar numa opção errada SHALL contar como tentativa inválida, deixar essa opção visivelmente descartada (forma, não só cor) e permitir tentar de novo sem reiniciar.

#### Scenario: Opção errada
- **WHEN** a criança toca no sapo na M10
- **THEN** o sapo fica marcado como descartado, a frase continua incompleta e uma tentativa inválida é contada

#### Scenario: Opção certa
- **WHEN** a criança toca na abelha na M10
- **THEN** a frase vira "It's a bee" com a abelha no lugar da sombra e a missão é concluída

### Requirement: Ajuda progressiva no quiz
Após duas tentativas inválidas seguidas, a opção certa SHALL ser destacada, sem ser escolhida pela criança automaticamente.

#### Scenario: Dois erros
- **WHEN** a criança erra duas vezes seguidas
- **THEN** a opção certa ganha destaque e o uso da ajuda é registrado

### Requirement: Missões M10 e M11
A M10 SHALL ter a sombra da abelha e a M11 a sombra do coelho, ambas com as opções abelha, sapo e coelho.

#### Scenario: Configuração da M11
- **WHEN** a M11 é iniciada
- **THEN** o espaço mostra a sombra do coelho e a resposta certa é "rabbit"
