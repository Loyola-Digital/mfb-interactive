# Proposal

## Why

Em 13/11/2026 a revisão pedagógica do app (repassada pelo usuário) apontou que a criança fica perdida em algumas atividades e que falta o som junto da imagem e da palavra escrita: "tudo que for o fonema junto com a imagem e algo ali escrito vai sempre ajudar". Pontos levantados:

- No traçado e no pintar não dava para saber se o app fala o nome do bicho; a tela de resultado era pesada. Pedido: alto-falante na própria tela e uma seta para a próxima atividade.
- "Qual é desta cor?" e "Ligue o giz" sem som.
- Antes, depois e no meio: a professora fala o número e a criança indica o que falta.
- "Um a mais": a mãozinha da demonstração caía em cima da resposta. Pedido: uma frase dela em português e depois em inglês ("Qual desses tem um a mais?").
- Falar alguma coisa quando a criança acerta e quando erra.
- Explorers: maiúscula e minúscula não ensina fonética; o "Ouça e toque: letras" faz sentido e deveria ter mais letras, em atividades pequenas, com a letra e uma palavra que começa com ela.
- Provas e teste de alinhamento também com som; a última rodada da prova de vogais curtas ("cat" escrito → hat) destoava das outras.

## What Changes

- **Fim na própria tela do jogo:** a cena, a palavra com alto-falante e uma seta grande para a próxima atividade, com um botão menor de repetir. Jardim e Encerrar ficam na barra do adulto. "Para brincar fora da tela" passa para a preparação.
- **O que fazer, falado:** cada exercício tem `instruction` (português e inglês), falada ao abrir o jogo e num botão na barra de cima.
- **Palavra falada durante o jogo:** traçar, pintar, plantar e montar palavra ou frase mostram o alto-falante no modelo e falam a palavra ao abrir. Plantar conta cada tulipa ("one", "two").
- **Acertou e errou:** "Good job!", "Great!" ou "Well done!" ao acertar (depois da palavra certa, se ela tiver fala) e "Oops! Try again." ao errar. Na prova, nada.
- **Fala na carta:** `Card.audio`, falado ao tocar no Ligar e ao acertar no Escolher. Usado nos gizes, formas, números, letras, opostos e nas palavras certas.
- **Antes, depois e no meio:** a rodada fala os números que aparecem ("four"; "one, three") e a resposta certa fala o número que faltava.
- **Demonstração do Escolher:** a mão só toca no modelo, nunca nas opções.
- **Explorers, Alfabeto:** maiúscula e minúscula (EX1-01, EX1-02) e o antigo "Ouça e toque: letras" (EX1-34) viram quatro atividades "Letra e palavra" de A a Z (EX1-01, EX1-02, EX1-34, EX1-40; o X fica de fora). A rodada fala o nome da letra, mostra a letra e três figuras com a palavra escrita; a certa é falada ao acertar. Total: 109 missões.
- **Mais som no conteúdo:** cores (CO1-05), formas, contagem, "começa com" da Curious Ones 1 (agora com a palavra escrita embaixo da figura), opostos, figura → palavra da Explorers, provas e teste de alinhamento.
- **Prova de vogais curtas:** a última rodada passa a ser figura → palavra (cat: cut, cat, cot).
- **Gravações:** 131 falas novas em inglês com a voz da professora no Fish Audio. Mais as 36 instruções em português, com a mesma voz.

## Capabilities

### New Capabilities
- `fim-da-atividade`: fim na tela do jogo, com seta para a próxima.
- `letra-e-palavra`: alfabeto da Explorers com nome da letra e palavra.
- `falas-do-jogo`: instrução em português e inglês, fala da carta, acerto e erro, palavra no jogo.

## Impact

- `shared/content.ts` (`Card.audio`, `instruction`, `PRAISE`, `OOPS`, `audioSlug` sem acento, `audioTexts`), `web/src/audio.ts`, `screens/mission.ts`, todos os `games/*-view.ts`, `styles.css`, `scripts/audios.ts`.
- `missions.json`: 106 missões mudaram, EX1-40 nova.
- Substitui "Resultado" como tela separada (PRD, seção 6).
