# Spec Delta

## Purpose

Define as regras do jogo de Cores, reutilizável para qualquer missão de pintar um desenho com a cor do modelo, e a configuração da missão M03 "O sapinho verde".

## ADDED Requirements

### Requirement: Selecionar tinta
O jogo SHALL mostrar entre duas e três tintas definidas no conteúdo. Tocar em uma tinta SHALL selecioná-la e destacar sua amostra com forma (borda, tamanho ou marca), não só com cor. Selecionar qualquer tinta é uma ação válida e MUST NOT contar como tentativa inválida.

#### Scenario: Selecionar uma tinta
- **WHEN** a criança toca em uma tinta
- **THEN** essa tinta fica destacada por forma e qualquer outra tinta deixa de estar destacada

#### Scenario: Trocar de tinta
- **WHEN** a criança toca em outra tinta depois de já ter selecionado uma
- **THEN** a nova tinta passa a ser a selecionada, sem reiniciar a missão

### Requirement: Modelo sempre visível
O modelo com a cor esperada e a palavra-alvo SHALL permanecer visível durante todo o jogo.

#### Scenario: Durante o jogo
- **WHEN** a criança seleciona tintas ou aplica cores
- **THEN** o modelo e a palavra-alvo continuam visíveis na tela

### Requirement: Aplicar cor no desenho
Tocar no desenho com uma tinta selecionada SHALL preenchê-lo com essa cor. Se a cor for a do modelo, a missão SHALL ser concluída. Se for diferente, o preenchimento SHALL aparecer como prévia reversível e contar como uma tentativa inválida. Tocar no desenho sem tinta selecionada MUST NOT contar como tentativa inválida.

#### Scenario: Cor correta
- **WHEN** a tinta do modelo está selecionada e a criança toca no desenho
- **THEN** o desenho é preenchido com a cor do modelo e a missão é concluída

#### Scenario: Cor diferente
- **WHEN** outra tinta está selecionada e a criança toca no desenho
- **THEN** o desenho mostra essa cor como prévia, a missão não é concluída e uma tentativa inválida é contada

#### Scenario: Corrigir a cor
- **WHEN** o desenho está com uma prévia de cor diferente e a criança seleciona a tinta do modelo e toca no desenho
- **THEN** o desenho passa a ter a cor do modelo e a missão é concluída, sem precisar reiniciar

#### Scenario: Sem tinta selecionada
- **WHEN** nenhuma tinta está selecionada e a criança toca no desenho
- **THEN** nada é registrado como tentativa e o jogo pode indicar visualmente as tintas

### Requirement: Ajuda progressiva no jogo de Cores
Após duas aplicações consecutivas de cor diferente do modelo, o jogo SHALL destacar a tinta correta e repetir a demonstração de selecionar e preencher, sem concluir a missão. Uma aplicação correta ou o início de nova tentativa SHALL zerar esse contador.

#### Scenario: Duas aplicações erradas
- **WHEN** a criança aplica duas vezes seguidas uma cor diferente do modelo
- **THEN** a tinta correta é destacada, a demonstração é repetida, a missão continua não concluída e o uso da ajuda é registrado

#### Scenario: Uma aplicação errada
- **WHEN** a criança aplica uma cor diferente do modelo apenas uma vez
- **THEN** a ajuda progressiva não é acionada

### Requirement: Toques repetidos não duplicam ações
Toques rápidos repetidos no desenho ou nas tintas SHALL produzir no máximo uma ação por toque aceito, e a conclusão SHALL ser registrada uma única vez por tentativa.

#### Scenario: Toque duplo no desenho com a cor certa
- **WHEN** a criança toca duas vezes rapidamente no desenho com a tinta do modelo selecionada
- **THEN** a missão é concluída uma única vez e o progresso registra uma única conclusão para essa tentativa

### Requirement: Variação entre repetições
A ordem das tintas na tela SHALL poder variar entre repetições da missão, mantendo o mesmo conjunto de tintas e a mesma dificuldade.

#### Scenario: Repetir a missão
- **WHEN** a missão é reaberta
- **THEN** as mesmas tintas aparecem, possivelmente em outra ordem

### Requirement: Missão M03 — O sapinho verde
A missão M03 SHALL usar o jogo de Cores com duas tintas, sendo verde a cor do modelo, e um sapo como desenho. A palavra-alvo SHALL ser `green`, com significado "verde", exibida junto à amostra e ao sapo pintado. A referência SHALL ser a p. 26 do Curious Ones Stage 1, adaptada para pintura por preenchimento.

#### Scenario: Configuração da M03
- **WHEN** a M03 é iniciada
- **THEN** aparecem um sapo sem cor, um modelo de sapo verde com a palavra `green` e exatamente duas tintas, uma delas verde

#### Scenario: Conclusão da M03
- **WHEN** a criança seleciona a tinta verde e toca no sapo
- **THEN** o sapo fica verde, a palavra `green` aparece junto dele e a missão é concluída
