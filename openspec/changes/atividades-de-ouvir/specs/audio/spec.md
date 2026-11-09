# Spec Delta

## Purpose

Falas em inglês no app: quando tocam, de onde vêm e o que acontece sem gravação.

## ADDED Requirements

### Requirement: Alto-falante
Todo texto falado SHALL ter um botão de alto-falante de pelo menos 56 × 56 px que fala de novo e pisca enquanto toca. Trocar de tela SHALL interromper a fala. O app MUST NOT pedir microfone, câmera ou localização.

#### Scenario: Ouvir de novo
- **WHEN** a criança toca no alto-falante de uma rodada
- **THEN** a palavra é falada de novo e o botão pisca até a fala acabar

### Requirement: Gravação ou voz do navegador
Cada texto falado SHALL tocar a gravação `web/src/assets/audio/<nome>.mp3`, em que o nome vem do texto ("/t/" → `som-t`, "B" → `letra-b`, "I am tall" → `i-am-tall`). Sem a gravação, o app SHALL usar a voz do navegador em inglês. Som de letra sem gravação SHALL mostrar ao adulto o que dizer. Dois textos que dariam o mesmo arquivo MUST ser recusados na validação do conteúdo.

#### Scenario: Ainda sem gravação
- **WHEN** uma rodada fala "red" e não existe `red.mp3`
- **THEN** a voz do navegador fala "red" em inglês

#### Scenario: Som de letra sem gravação
- **WHEN** uma rodada usa "/t/" e não existe `som-t.mp3`
- **THEN** nada toca e aparece "Diga: /t/" junto do alto-falante

### Requirement: Lista de gravação
`npm run audios` SHALL escrever `web/src/assets/audio/LISTA.csv` com todos os textos falados do conteúdo: arquivo, texto, tipo (som da letra, nome da letra, palavra, frase), missões que usam e situação (ok ou falta).

#### Scenario: Depois de gravar
- **WHEN** `red.mp3` é copiado para a pasta e `npm run audios` roda
- **THEN** a linha de `red.mp3` passa a `ok`
