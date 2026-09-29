# Spec Delta

## ADDED Requirements

### Requirement: Missão M04 — A banana amarela
A missão M04 SHALL usar o jogo de Cores com três tintas, sendo amarelo a cor do modelo, e uma banana como desenho. A palavra-alvo SHALL ser `yellow`, com significado "amarelo", exibida junto à amostra e à banana pintada. A referência SHALL ser a p. 25 do Curious Ones Stage 1, adaptada para pintura por preenchimento.

#### Scenario: Configuração da M04
- **WHEN** a M04 é iniciada
- **THEN** aparecem uma banana sem cor, um modelo de banana amarela com a palavra `yellow` e exatamente três tintas, uma delas amarela

#### Scenario: Conclusão da M04
- **WHEN** a criança seleciona a tinta amarela e toca na banana
- **THEN** a banana fica amarela, a palavra `yellow` aparece junto dela e a missão é concluída
