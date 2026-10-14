# Spec Delta

## Purpose

Organiza o conteúdo por apostila e capítulo e mostra a trilha da apostila escolhida.

## ADDED Requirements

### Requirement: Estrutura por apostila
O conteúdo SHALL ter as apostilas Curious Ones Stage 1 (`CO1`), Curious Ones Stage 2 (`CO2`) e Explorers Stage 1 (`EX1`), nessa ordem. Cada apostila SHALL ter capítulos com o nome do módulo do livro, e cada capítulo SHALL ter exercícios e, quando houver conteúdo avaliável, uma prova no fim. Cada missão SHALL indicar a página do livro em `bookRef`.

#### Scenario: Carregar o conteúdo
- **WHEN** o app carrega `missions.json`
- **THEN** as três apostilas aparecem com seus capítulos e missões, e um conteúdo com id repetido ou apostila sem capítulo é rejeitado

### Requirement: Trilha da apostila atual
O jardim SHALL mostrar só as missões da apostila atual, em zigue-zague calculado, com o nome de cada capítulo no início do trecho e as provas marcadas como prova. Um seletor no topo SHALL permitir trocar de apostila sem perder o progresso das outras.

#### Scenario: Trocar de apostila
- **WHEN** o adulto escolhe Explorers 1 no seletor
- **THEN** a trilha passa a mostrar os capítulos da Explorers 1, a escolha fica registrada e as conclusões da Curious Ones continuam salvas
