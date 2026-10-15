# Spec Delta

## Purpose

Define o quebra-cabeça de montar palavras: o bicho aparece grande na tela, as letras são peças de quebra-cabeça espalhadas e cada uma encaixa só no espaço com o seu formato. Inclui as missões M12 e M13.

## ADDED Requirements

### Requirement: Bicho, tabuleiro e peças espalhadas
O jogo SHALL mostrar o desenho da palavra em destaque, um tabuleiro com o contorno de cada peça (com a letra apagada dentro) e as peças soltas espalhadas pela tela, em posições e giros variados. As peças SHALL ter formato de quebra-cabeça: cada uma, exceto a última, tem uma orelha à direita que entra no recorte à esquerda da seguinte, de modo que cada peça tem um formato único. Cada peça SHALL ter pelo menos 56 × 56 px CSS.

#### Scenario: Início da M13
- **WHEN** a M13 começa
- **THEN** aparecem o sapo, um tabuleiro com quatro contornos (F, R, O, G apagados) e as quatro peças espalhadas e giradas

### Requirement: Encaixe por formato, em qualquer ordem
Cada peça SHALL encaixar somente no espaço do seu formato, em qualquer ordem. A criança SHALL poder arrastar a peça até o espaço ou tocar na peça (que fica destacada, "na mão") e depois no espaço; arrastar MUST NOT ser obrigatório. Ao encaixar, a peça SHALL ir até o espaço, endireitar e ficar presa.

#### Scenario: Encaixe tocando
- **WHEN** a criança toca na peça R e depois no segundo espaço
- **THEN** o R vai para o segundo espaço e encaixa, mesmo que o F ainda não tenha sido colocado

#### Scenario: Encaixe arrastando
- **WHEN** a criança arrasta a peça F até o primeiro espaço
- **THEN** o F encaixa no primeiro espaço

### Requirement: Tentativa inválida
Soltar ou tocar num espaço errado SHALL contar como tentativa inválida e devolver a peça ao lugar dela. Soltar a peça fora do tabuleiro, tocar em espaço ocupado ou no fundo MUST NOT contar como tentativa.

#### Scenario: Espaço errado
- **WHEN** a criança solta a peça G no espaço do R
- **THEN** o G volta ao lugar de onde saiu, balança e uma tentativa inválida é contada

### Requirement: Ajuda progressiva e conclusão
Após duas tentativas inválidas seguidas, o espaço certo da última peça tentada SHALL ser destacado e a demonstração SHALL mostrar a peça indo até ele, sem encaixá-la. Com todas as peças encaixadas, a palavra completa SHALL brilhar, o bicho e o coelho SHALL comemorar e a missão SHALL ser concluída uma única vez.

#### Scenario: Palavra completa
- **WHEN** a última peça encaixa
- **THEN** a palavra "FROG" aparece completa sob o sapo e a missão é concluída

### Requirement: Missões M12 e M13
A M12 SHALL montar BEE com a abelha e a M13 SHALL montar FROG com o sapo. Letras repetidas (os dois E de BEE) SHALL ser peças distintas pelo formato.

#### Scenario: Configuração da M12
- **WHEN** a M12 é iniciada
- **THEN** aparecem a abelha e três peças, B, E e E, com formatos diferentes entre si
