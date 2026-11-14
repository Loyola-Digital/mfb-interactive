# Spec Delta

## Purpose

O que a criança vê quando termina uma atividade.

## ADDED Requirements

### Requirement: Fim na tela do jogo
Ao terminar, o app SHALL mostrar na própria moldura do jogo a cena final, a palavra com alto-falante (falada em seguida), uma seta de pelo menos 96 px para a próxima atividade e um botão de repetir. A barra do adulto SHALL ter Jardim (ou Provas) e Encerrar. A seta SHALL abrir a preparação da próxima atividade da mesma aba; sem próxima, SHALL voltar ao jardim ou às provas. A tela MUST caber em 360 × 640 sem rolagem.

#### Scenario: Traçado concluído
- **WHEN** o coelho chega às cenouras
- **THEN** aparecem as cenouras, "rabbit" com alto-falante, a seta e o repetir, e o app fala "rabbit"

### Requirement: Brincar fora da tela na preparação
A sugestão "fora da tela" SHALL aparecer na preparação do adulto, com o título "Depois, fora da tela".

#### Scenario: Preparação
- **WHEN** o adulto abre uma missão
- **THEN** a preparação mostra objetivo, palavra, como acompanhar e a brincadeira fora da tela
