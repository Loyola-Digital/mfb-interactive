# Tasks

## 1. Leitura e figuras

- [x] 1.1 Ler as três apostilas (IDML e PDF) e mapear capítulos e atividades
- [x] 1.2 Recortar as figuras dos PDFs, escolher o vocabulário e gerar `web/public/content/img/*.webp`; conferir numa folha de contato

## 2. Esquema e progresso

- [x] 2.1 `shared/content.ts`: apostilas, capítulos, ids novos, `pick`, `match`, provas e banco do alinhamento; testes de válido e inválido
- [x] 2.2 `shared/progress.ts`: `data`, eventos `placement` e `bookChosen`, resultado de prova e apostila atual na agregação; testes
- [x] 2.3 Servidor: coluna `data` com migração e validação; teste de envio e leitura

## 3. Jogos

- [x] 3.1 Escolher (`pick`) com rodadas, ajuda e modo prova; testes do redutor de rodadas
- [x] 3.2 Ligar (`match`) com toque-depois-toque e ajuda; testes do redutor
- [x] 3.3 Cartas: figura, texto, quantidade, forma SVG e tamanho

## 4. Telas

- [x] 4.1 Jardim por apostila, seletor, rótulos de capítulo e marca de prova
- [x] 4.2 Fluxo de prova (preparação, sem ajuda, resultado só com comemoração)
- [x] 4.3 Teste de alinhamento (oferta, rodadas por nível, sugestão e escolha)
- [x] 4.4 Área dos pais por apostila com provas, apostila atual e refazer o teste

## 5. Conteúdo

- [x] 5.1 Curious Ones 1: exercícios e provas
- [x] 5.2 Curious Ones 2: exercícios e provas
- [x] 5.3 Explorers 1: exercícios e provas
- [x] 5.4 Banco do teste de alinhamento

## 6. Verificação

- [x] 6.1 `npm test`, `npm run typecheck`, `npm run build`, busca por hex; jogar no navegador em 360 px um exercício de cada tipo, uma prova e o alinhamento

## 7. Abas separadas (pedido de 15/10/2026)

- [x] 7.1 Abas fixas Exercícios, Provas e Teste de alinhamento; provas fora da trilha de exercícios
- [x] 7.2 Aba Provas com uma prova por capítulo, exercícios feitos e "feita"/"ainda não feita"; voltar e "próxima prova" dentro da aba
- [x] 7.3 Aba Teste de alinhamento com a última sugestão e "Refazer o teste"; verificar as três abas em 390 px
