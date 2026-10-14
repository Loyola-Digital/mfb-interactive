# Spec Delta

## Purpose

Jogo Escolher: rodadas em que a criança toca na opção que combina com o enunciado.

## ADDED Requirements

### Requirement: Rodadas de escolha
Cada missão Escolher SHALL ter de 2 a 8 rodadas. Cada rodada SHALL mostrar um enunciado (figura, letra ou palavra, quantidade de figuras, forma ou figura em tamanho grande ou pequeno) e de 2 a 4 opções, com alvos de pelo menos 56 px. Tocar na certa SHALL marcar a opção, comemorar e passar para a próxima rodada; a última rodada conclui a missão uma única vez.

#### Scenario: Começa com B
- **WHEN** a rodada mostra a letra B e as opções bear, cup e ant
- **THEN** tocar em bear marca a opção como certa e a próxima rodada aparece

### Requirement: Erro e ajuda
Uma opção errada SHALL ficar riscada e não contar de novo. Após duas escolhas erradas seguidas na rodada, a opção certa SHALL ser destacada e a ajuda registrada. O botão de ajuda SHALL mostrar a demonstração do gesto.

#### Scenario: Dois erros
- **WHEN** a criança erra duas vezes na mesma rodada
- **THEN** a opção certa brilha e um evento de ajuda é registrado
