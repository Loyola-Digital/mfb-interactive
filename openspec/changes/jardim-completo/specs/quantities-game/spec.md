# Spec Delta

## Purpose

Define o jogo de Quantidades, em que a criança pega tulipas de um cesto e planta uma em cada cova até preencher todas, e as missões M05 e M06 que o usam.

## ADDED Requirements

### Requirement: Objetivo visível pela quantidade de covas
O jogo SHALL mostrar um cesto de tulipas, as covas vazias e um modelo com o numeral, a palavra em inglês e a quantidade em figuras. O número de covas SHALL tornar o objetivo visível sem exigir leitura. Não SHALL existir botão de confirmação.

#### Scenario: Início da M06
- **WHEN** a M06 começa
- **THEN** aparecem o cesto, duas covas vazias e o modelo com `2`, `two` e duas tulipas

### Requirement: Pegar e plantar uma tulipa
Tocar no cesto SHALL pegar uma tulipa, com o cesto destacado por forma. Tocar numa cova vazia com uma tulipa na mão SHALL plantar exatamente uma tulipa e esvaziar a mão. Tocar numa cova sem tulipa na mão MUST NOT contar como tentativa e SHALL indicar o cesto.

#### Scenario: Plantar
- **WHEN** a criança toca no cesto e depois numa cova vazia
- **THEN** uma tulipa aparece plantada nessa cova e a mão fica vazia

#### Scenario: Cova sem tulipa na mão
- **WHEN** a criança toca numa cova sem ter pego uma tulipa
- **THEN** nada é plantado, nenhuma tentativa é contada e o cesto é indicado

### Requirement: Cova preenchida não recebe outra flor
Tocar numa cova já preenchida com uma tulipa na mão SHALL contar como tentativa inválida e MUST NOT plantar outra flor. Toques rápidos repetidos MUST NOT plantar mais de uma tulipa por vez que a criança pegou no cesto.

#### Scenario: Cova ocupada
- **WHEN** a criança, com uma tulipa na mão, toca numa cova que já tem flor
- **THEN** nenhuma flor é adicionada, a tulipa continua na mão e uma tentativa inválida é contada

#### Scenario: Toque duplo numa cova vazia
- **WHEN** a criança pega uma tulipa e toca duas vezes rápido na mesma cova vazia
- **THEN** exatamente uma tulipa é plantada

### Requirement: Conclusão ao preencher todas as covas
A missão SHALL ser concluída quando todas as covas tiverem uma tulipa, uma única vez.

#### Scenario: Última cova
- **WHEN** a criança planta a tulipa na última cova vazia
- **THEN** a missão é concluída

### Requirement: Ajuda progressiva no jogo de Quantidades
Após duas tentativas inválidas consecutivas, o jogo SHALL destacar a próxima cova vazia e repetir a demonstração, sem plantar pela criança. Plantar com sucesso SHALL zerar o contador.

#### Scenario: Duas vezes na cova ocupada
- **WHEN** a criança toca duas vezes seguidas numa cova ocupada com tulipa na mão
- **THEN** uma cova vazia é destacada, a demonstração é repetida e o uso da ajuda é registrado

### Requirement: Missões M05 e M06
A M05 "Uma flor" SHALL ter 1 cova, com `one`, significado "um", e numeral `1`. A M06 "Duas flores" SHALL ter 2 covas, com `two`, significado "dois", e numeral `2`. A contagem é visual; a criança MUST NOT precisar ler o numeral.

#### Scenario: Configuração da M05
- **WHEN** a M05 é iniciada
- **THEN** aparecem uma cova, o cesto e o modelo com `1`, `one` e uma tulipa
