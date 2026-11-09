# Proposal

## Why

Em 09/11/2026 o usuário pediu as atividades de áudio já prontas no app e a lista dos áudios que precisam ser gerados. Até aqui o app era silencioso (decisões de 29/09 e 14/10/2026), e as atividades de som das apostilas dependiam do adulto falar.

## What Changes

- **Rodadas de ouvir no Escolher:** uma rodada pode ter `audio`, um texto em inglês falado ao abrir a rodada, com um alto-falante para ouvir de novo. Sem `prompt`, a rodada é só de ouvir ("Ouça e toque").
- **15 missões novas de ouvir:** Curious Ones 1 (cores, formas, números, figuras, letras), Curious Ones 2 (números, opostos, que som?, com que letra começa?) e Explorers 1 (letras, qual vogal?, palavras, vogal curta ou longa, frases, palavras novas). Total: 108 missões.
- **Áudio nas missões que já existiam:** som da letra nos exercícios de som inicial e final da Curious Ones 2, palavra do enunciado (taller, empty, more, different, winter, happy...), nome da letra na Explorers e palavra ou frase falada na tela de resultado.
- **Gravações e voz do navegador:** cada texto vira `web/src/assets/audio/<nome>.mp3`. Sem o arquivo, fala a voz do navegador em inglês. Som de letra sem gravação mostra ao adulto o que dizer ("Diga: /t/").
- **Lista de gravação:** `npm run audios` escreve `web/src/assets/audio/LISTA.csv` (arquivo, texto, tipo, missões, situação).
- Boas-vindas: "Deixe o som ligado" no lugar de "Não tem som".

## Capabilities

### New Capabilities
- `audio`: falas em inglês, alto-falante, gravações e alternativa da voz do navegador.
- `listen-rounds`: rodadas e missões de ouvir no Escolher.

## Impact

- `shared/content.ts` (campos `audio`, `audioSlug`, `audioTexts`, validação), `web/src/audio.ts`, `pick-view.ts`, `mission.ts`, `main.ts`, `welcome.ts`, `art.ts`, `games/index.ts`, `styles.css`, `scripts/audios.ts`.
- `missions.json`: 15 missões novas e áudio em 39 existentes.
- Substitui o requisito "Experiência totalmente silenciosa" de `piloto-m03-sapinho-verde`; continua sem microfone, câmera ou localização.
