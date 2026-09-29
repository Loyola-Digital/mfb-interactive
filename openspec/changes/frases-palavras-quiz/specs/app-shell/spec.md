# Spec Delta

## ADDED Requirements

### Requirement: Jardim com rolagem para muitas missões
Com mais de seis missões, o jardim SHALL crescer na vertical mantendo os pontos com pelo menos 56 × 56 px e sem se sobrepor, com rolagem da página. Ao abrir, o jardim SHALL rolar até a missão sugerida.

#### Scenario: Treze missões em 360 px
- **WHEN** o jardim é aberto com 13 missões em 360 px de largura
- **THEN** todos os pontos são tocáveis sem sobreposição, a página rola na vertical e a missão sugerida fica visível
