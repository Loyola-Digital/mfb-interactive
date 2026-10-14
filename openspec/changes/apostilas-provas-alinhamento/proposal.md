# Proposal

## Why

Em 14/10/2026 o usuário pediu para dividir os exercícios por apostila: ler cada apostila da pasta do Drive, gerar exercícios e provas para cada uma e criar um teste de alinhamento para a entrada no MFB. As apostilas são três: **Curious Ones Stage 1** (pré-alfabetização, a partir de 3 anos), **Curious Ones Stage 2** (números, discriminação, emoções e sons das consoantes) e **Explorers Stage 1** (fonética de vogais e primeiras leituras, Ensino Fundamental I).

Decisões do usuário na mesma data: a prova é feita sem ajuda, cada questão vale na primeira tentativa e a área dos pais mostra os acertos ("acertou 5 de 6"), mas a criança só vê a comemoração; o app continua **sem áudio**; o teste de alinhamento **sugere** a apostila inicial e o adulto confirma ou troca depois.

## What Changes

- Conteúdo organizado em **apostila → capítulo (módulo do livro) → exercícios + prova**. O jardim mostra a trilha da apostila escolhida, com um seletor de apostilas.
- Dois jogos novos e genéricos, que cobrem a maior parte das atividades dos livros ("circle the…", "draw lines from…"):
  - **Escolher** (`pick`): várias rodadas; cada rodada tem um enunciado visual (figura, letra, quantidade, cor ou palavra) e de 2 a 4 opções.
  - **Ligar** (`match`): pares para ligar (maiúscula ↔ minúscula, número ↔ quantidade, palavra ↔ figura, opostos).
- **Provas** ao fim de cada capítulo, montadas com rodadas de Escolher em modo prova: sem ajuda, sem demonstração, sem destacar a resposta, uma resposta por questão.
- **Teste de alinhamento** no primeiro acesso: rodadas por nível (Curious Ones 1 → 2 → Explorers 1), que sobem enquanto a criança acerta; termina com a sugestão de apostila para o adulto confirmar.
- Figuras **recortadas dos PDFs das próprias apostilas** (o Magnific está sem créditos); formas geométricas desenhadas em SVG.
- Missões existentes redistribuídas: caminhos, cores e quantidades na Curious Ones 1; montar palavras e frases na Explorers 1 com vocabulário do livro.

## Capabilities

### New Capabilities
- `apostilas`: estrutura de apostilas e capítulos, trilha por apostila e seletor.
- `pick-game`: jogo Escolher com rodadas.
- `match-game`: jogo Ligar.
- `provas`: modo prova e registro de acertos.
- `alinhamento`: teste de alinhamento e escolha da apostila.

### Modified Capabilities
- `parents-area`: relatório agrupado por apostila, com os acertos das provas e a apostila atual.

## Impact

- `shared/content.ts` (novo esquema), `shared/progress.ts` (eventos `placement` e `bookChosen`, campo `data` com acertos), servidor com coluna `data` (migração automática).
- Novas telas e jogos em `web/src/`, figuras em `web/public/content/img/`.
- O progresso de desenvolvimento das missões M01–M13 deixa de valer (os ids mudam). Ainda não há usuários reais.
- Todo o conteúdo é proposta a validar com a Fernanda. A Explorers pede "listen/say" em várias páginas; sem áudio, essas atividades viram leitura de palavras e figuras, e o adulto lê em voz alta.
- Os capítulos 6 (histórias, só imagens no arquivo) e as atividades de recortar, colar e escrever ficam fora do app.
