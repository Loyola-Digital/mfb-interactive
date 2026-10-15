# Spec Delta

## Purpose

Organiza o conteúdo por apostila e capítulo e mostra a trilha da apostila escolhida.

## ADDED Requirements

### Requirement: Estrutura por apostila
O conteúdo SHALL ter as apostilas Curious Ones Stage 1 (`CO1`), Curious Ones Stage 2 (`CO2`) e Explorers Stage 1 (`EX1`), nessa ordem. Cada apostila SHALL ter capítulos com o nome do módulo do livro, e cada capítulo SHALL ter exercícios e, quando houver conteúdo avaliável, uma prova no fim. Cada missão SHALL indicar a página do livro em `bookRef`.

#### Scenario: Carregar o conteúdo
- **WHEN** o app carrega `missions.json`
- **THEN** as três apostilas aparecem com seus capítulos e missões, e um conteúdo com id repetido ou apostila sem capítulo é rejeitado

### Requirement: Abas Exercícios, Provas e Teste de alinhamento
Depois que a apostila for escolhida, o app SHALL ter três abas fixas no topo: **Exercícios** (a trilha), **Provas** (lista das provas) e **Teste de alinhamento**. Exercícios e Provas SHALL mostrar o seletor de apostila; o Teste de alinhamento não depende de apostila.

#### Scenario: Navegar pelas abas
- **WHEN** o adulto toca em "Provas"
- **THEN** aparece a lista de provas da apostila atual, e a aba Provas fica marcada

### Requirement: Trilha da apostila atual
A aba Exercícios SHALL mostrar só os exercícios da apostila atual, sem as provas, em zigue-zague calculado, uma tela por capítulo com o nome dele no alto. Um seletor no topo SHALL permitir trocar de apostila sem perder o progresso das outras.

#### Scenario: Trocar de apostila
- **WHEN** o adulto escolhe Explorers 1 no seletor
- **THEN** a trilha passa a mostrar os capítulos da Explorers 1, a escolha fica registrada e as conclusões da Curious Ones continuam salvas
