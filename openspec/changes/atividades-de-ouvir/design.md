# Design

## Context

O Escolher (`pick`) já tem rodadas com enunciado (`prompt`) e opções, e é usado em exercícios, provas e alinhamento. O conteúdo fica em `missions.json`, validado por `shared/content.ts`. Não há gravações ainda.

## Goals / Non-Goals

**Goals:** atividades de ouvir funcionando hoje, mesmo sem gravações; trocar para as gravações sem mexer em código; lista exata do que gravar.

**Non-Goals:** microfone ou reconhecimento de fala; música e efeitos sonoros; áudio no Ligar, no teste de alinhamento ou em rodadas novas de prova; botão para desligar o som (o volume do aparelho resolve).

## Decisions

### 1. O texto falado é a chave
`audio: "I am tall"` no conteúdo; o arquivo é `audioSlug(texto).mp3` (`i-am-tall.mp3`). `"/t/"` é o som da letra (`som-t.mp3`) e uma letra maiúscula sozinha é o nome dela (`letra-b.mp3`). A validação recusa dois textos que dariam o mesmo arquivo.
- *Alternativa: chave separada do texto.* Rejeitada: mais um campo para manter e a voz do navegador precisaria do texto de qualquer forma.

### 2. Gravações empacotadas pelo Vite
`import.meta.glob('./assets/audio/*.mp3')` dá, no build, a lista dos arquivos que existem, com hash no nome. O app sabe na hora se há gravação e não faz pedidos que dariam 404. Novos áudios entram com um novo deploy do front.

### 3. Voz do navegador como alternativa
Sem gravação, `speechSynthesis` em `en-US`, um pouco mais devagar. Sons de letra não têm alternativa: o alto-falante mostra "Diga: /t/" para o adulto.

### 4. Liberação no iPhone
O Safari só toca áudio depois de um toque. No primeiro toque da página, o app toca um WAV vazio no mesmo elemento de áudio usado depois e fala um texto vazio, o que libera as falas automáticas seguintes.

### 5. Onde fala
Ao abrir cada rodada com `audio` (também na prova: é o enunciado, não ajuda) e na tela de resultado da missão com `audio`. O alto-falante fala de novo a qualquer momento. Trocar de tela interrompe a fala.

## Risks / Trade-offs

- [Voz do navegador varia entre aparelhos e pode faltar inglês] → as gravações substituem; o adulto continua junto.
- [Cores de giz recortadas da apostila trazem o nome escrito] → a Curious Ones 1 é para quem ainda não lê; trocar a figura se a Fernanda preferir.
- [Primeira fala bloqueada se o primeiro toque for no próprio jogo e o navegador recusar] → o alto-falante sempre funciona ao ser tocado.
