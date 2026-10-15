# Spec Delta

## Purpose

Teste de alinhamento na entrada para sugerir a apostila inicial.

## ADDED Requirements

### Requirement: Oferta do teste
Enquanto a conta não tiver apostila escolhida, depois das boas-vindas o app SHALL mostrar ao adulto a tela do teste de alinhamento, com as opções de fazer o teste ou escolher a apostila direto.

#### Scenario: Primeiro acesso
- **WHEN** um adulto entra pela primeira vez e passa pelas boas-vindas
- **THEN** aparece a oferta do teste com os botões "Fazer o teste" e "Escolher a apostila"

### Requirement: Teste adaptativo
O teste SHALL ter rodadas de Escolher em modo prova, quatro por nível, começando pela Curious Ones 1. Com 3 ou mais acertos no nível, SHALL passar ao próximo; senão SHALL parar. A sugestão SHALL ser a apostila do nível em que parou, ou a Explorers 1 se passou nos três.

#### Scenario: Passa no primeiro nível
- **WHEN** a criança acerta 4 de 4 no nível da Curious Ones 1 e 1 de 4 no da Curious Ones 2
- **THEN** o teste sugere a Curious Ones 2

### Requirement: Aba do teste
Depois da primeira escolha de apostila, o teste SHALL ficar na aba Teste de alinhamento, que mostra a apostila atual e a última sugestão e permite refazer o teste.

#### Scenario: Refazer pela aba
- **WHEN** o adulto abre a aba Teste de alinhamento depois de já ter feito o teste
- **THEN** vê a última sugestão e o botão "Refazer o teste"

### Requirement: Confirmação pelo adulto
O resultado SHALL mostrar a sugestão e permitir confirmar ou escolher outra apostila. A sugestão (`placement`) e a escolha (`bookChosen`) SHALL ser registradas no progresso. O teste SHALL poder ser refeito pela área dos pais.

#### Scenario: Adulto troca a sugestão
- **WHEN** o teste sugere a Curious Ones 2 e o adulto escolhe a Curious Ones 1
- **THEN** a trilha abre na Curious Ones 1 e a área dos pais mostra a sugestão do teste
