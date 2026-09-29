# Spec Delta

## Purpose

Define o jogo de montar palavras em que a criança casa letras soltas com as letras apagadas da palavra, na ordem, e as missões M12 e M13.

## ADDED Requirements

### Requirement: Letras apagadas como molde
O jogo SHALL mostrar o desenho da palavra, uma fileira de espaços com cada letra apagada (contorno claro) e as letras soltas embaralhadas. Cada letra solta SHALL ter pelo menos 56 × 56 px CSS. A criança casa as formas das letras; MUST NOT precisar saber ler.

#### Scenario: Início da M12
- **WHEN** a M12 começa
- **THEN** aparecem a abelha, três espaços com B, E e E apagados e as letras B, E e E embaralhadas

### Requirement: Montar na ordem
O próximo espaço SHALL estar destacado. Tocar numa letra igual à do próximo espaço SHALL colocá-la nele; letras repetidas são intercambiáveis. Tocar numa letra diferente SHALL contar como tentativa inválida, sem remover letras já colocadas.

#### Scenario: Letra repetida
- **WHEN** B já foi colocada e a criança toca em qualquer uma das duas letras E
- **THEN** essa E entra no segundo espaço

#### Scenario: Letra errada
- **WHEN** na M13 o próximo espaço é R e a criança toca no G
- **THEN** a letra balança, nada é colocado e uma tentativa inválida é contada

### Requirement: Ajuda progressiva e conclusão
Após duas tentativas inválidas seguidas, uma letra certa SHALL ser destacada e a demonstração repetida, sem colocá-la. Com a palavra completa, a missão SHALL ser concluída uma única vez.

#### Scenario: Palavra completa
- **WHEN** a última letra é colocada
- **THEN** a palavra "BEE" aparece completa junto da abelha e a missão é concluída

### Requirement: Missões M12 e M13
A M12 SHALL montar BEE com a abelha e a M13 SHALL montar FROG com o sapo.

#### Scenario: Configuração da M13
- **WHEN** a M13 é iniciada
- **THEN** aparecem quatro espaços com F, R, O e G apagados e as quatro letras embaralhadas
