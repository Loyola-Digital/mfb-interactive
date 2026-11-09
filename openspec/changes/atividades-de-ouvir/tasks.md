# Tasks

## 1. Esquema e áudio

- [x] 1.1 Campos `audio` na rodada e na missão, `prompt` opcional com `audio`, `audioSlug`, `audioTexts` e recusa de nomes de arquivo repetidos
- [x] 1.2 `web/src/audio.ts`: gravação empacotada, voz do navegador, "Diga: /t/", alto-falante, liberação no primeiro toque, parar ao trocar de tela
- [x] 1.3 Escolher fala ao abrir a rodada; rodada sem enunciado mostra o alto-falante grande; resultado fala `audio`; ponto do jardim com alto-falante
- [x] 1.4 Boas-vindas: "Deixe o som ligado"

## 2. Conteúdo

- [x] 2.1 15 missões de ouvir (CO1-25 a 29, CO2-24 a 27, EX1-34 a 39)
- [x] 2.2 Som da letra em CO2-16 a 23 e CO2-P4; palavra do enunciado e nome da letra nas existentes; fala no resultado
- [x] 2.3 `npm run audios` e `LISTA.csv`; README da pasta com como gravar

## 3. Verificação

- [x] 3.1 Testes: validação de rodadas de ouvir, nomes de arquivo, conteúdo real
- [x] 3.2 Em 360 px: fala ao abrir cada rodada, alto-falante fala de novo, "Diga: /t/", resultado fala, sair interrompe; `npm test`, `npm run typecheck`, `npm run build`
- [ ] 3.3 Ouvir em Android/Chrome e iPhone/Safari reais (voz do navegador e liberação no primeiro toque)
- [x] 3.4 110 gravações (palavras, frases, nomes de letra) na voz da professora pelo Fish Audio; o app toca as gravações no lugar da voz do navegador
- [ ] 3.5 Gravar os 20 sons de letra (`som-*.mp3`)
