# Spec Delta

## Purpose

Prova de fim de capítulo, feita sem ajuda, com os acertos mostrados só ao adulto.

## ADDED Requirements

### Requirement: Modo prova
A prova SHALL usar rodadas de Escolher sem demonstração, sem botão de ajuda e sem destacar a resposta. A primeira opção tocada SHALL ser a resposta da rodada; certa ou errada, a rodada SHALL avançar com a mesma transição, sem marcar erro para a criança. A tela de preparação SHALL avisar o adulto para não ajudar.

#### Scenario: Errar na prova
- **WHEN** a criança toca numa opção errada na prova
- **THEN** a próxima questão aparece sem risco, balanço ou destaque da certa

### Requirement: Registro dos acertos
Ao terminar, o evento de conclusão SHALL levar `right` e `total`. A criança SHALL ver só a comemoração. A área dos pais SHALL mostrar o resultado da última vez de cada prova ("acertou 5 de 6") e quantas vezes ela foi feita.

#### Scenario: Ver acertos
- **WHEN** a criança termina a prova de Números com 5 acertos em 6
- **THEN** a área dos pais mostra "acertou 5 de 6" na prova de Números da apostila
