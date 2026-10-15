# Spec Delta

## ADDED Requirements

### Requirement: Jardim em telas
O jardim SHALL mostrar uma tela por capítulo, sem rolagem; capítulo com mais de seis exercícios SHALL virar telas do mesmo tamanho. Setas de pelo menos 56 × 56 px SHALL passar de tela, e a que leva à missão sugerida SHALL ficar destacada. Ao abrir, o jardim SHALL mostrar a tela da última missão aberta ou, se não houver, a da missão sugerida. Os pontos SHALL ter pelo menos 56 × 56 px e não se sobrepor.

#### Scenario: Capítulo com nove exercícios em 360 px
- **WHEN** o adulto abre um capítulo com 9 exercícios em 360 px de largura
- **THEN** o capítulo aparece em duas telas (5 e 4 pontos), todos tocáveis sem sobreposição, e as setas passam de uma para a outra

#### Scenario: Voltar de uma missão
- **WHEN** a criança sai de uma missão da tela 6
- **THEN** o jardim abre de novo na tela 6
