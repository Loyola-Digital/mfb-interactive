# Spec Delta

## Purpose

Define o jogo de Caminhos, em que a criança conduz o coelho tocando pedras em sequência até um destino, e as missões M01 e M02 que o usam.

## ADDED Requirements

### Requirement: Próxima pedra visível
O jogo SHALL mostrar o coelho no início, as pedras do caminho e o destino. Cada pedra SHALL ter pelo menos 64 × 64 px CSS. A próxima pedra SHALL ser destacada por forma (anel e movimento), não só por cor. Arrastar MUST NOT ser necessário.

#### Scenario: Início
- **WHEN** a missão de Caminhos começa
- **THEN** o coelho está no início, a primeira pedra está destacada e as demais aparecem sem destaque

### Requirement: Avançar só pela próxima pedra
Tocar na próxima pedra SHALL mover o coelho até ela e destacar a seguinte. Tocar em outra pedra ainda não alcançada SHALL contar como tentativa inválida, sem reiniciar a rodada nem reduzir o progresso. Tocar numa pedra já alcançada ou no fundo MUST NOT contar como tentativa.

#### Scenario: Pedra certa
- **WHEN** a criança toca na próxima pedra
- **THEN** o coelho vai até ela e a pedra seguinte passa a ser destacada

#### Scenario: Pedra fora de ordem
- **WHEN** a criança toca numa pedra depois da próxima
- **THEN** o coelho não se move, o progresso continua o mesmo e uma tentativa inválida é contada

#### Scenario: Pedra já alcançada
- **WHEN** a criança toca numa pedra que o coelho já passou
- **THEN** nada é registrado como tentativa

### Requirement: Chegada ao destino
Ao alcançar a última pedra, o coelho SHALL seguir até o destino e a missão SHALL ser concluída. Toques repetidos rápidos MUST NOT avançar mais de uma pedra por toque aceito, nem concluir mais de uma vez.

#### Scenario: Última pedra
- **WHEN** a criança toca na última pedra
- **THEN** o coelho chega ao destino, comemora e a missão é concluída uma única vez

### Requirement: Ajuda progressiva no jogo de Caminhos
Após duas tentativas inválidas consecutivas, o jogo SHALL reforçar o destaque da próxima pedra e repetir a demonstração, sem avançar o coelho. Um avanço válido SHALL zerar o contador.

#### Scenario: Dois toques fora de ordem
- **WHEN** a criança toca duas vezes seguidas em pedras fora de ordem
- **THEN** a próxima pedra é reforçada, a demonstração é repetida, o coelho não se move e o uso da ajuda é registrado

### Requirement: Missões M01 e M02
A M01 "Vamos ao jardim" SHALL ter 3 pedras em linha reta até o portão do jardim; a M02 "Passeio do coelhinho" SHALL ter 4 pedras em caminho curvo até um canteiro de cenouras. Ambas SHALL apresentar a palavra `rabbit`, com significado "coelho", junto ao coelho.

#### Scenario: Configuração da M01
- **WHEN** a M01 é iniciada
- **THEN** aparecem 3 pedras em linha reta, o portão como destino e a palavra `rabbit`

#### Scenario: Configuração da M02
- **WHEN** a M02 é iniciada
- **THEN** aparecem 4 pedras num caminho curvo, as cenouras como destino e a palavra `rabbit`
