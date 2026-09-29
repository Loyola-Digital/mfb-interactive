# Proposal

## Why

Com o jardim completo (`jardim-completo`), o usuário pediu em 29/09/2026 brincadeiras que vão além de cor, caminho e quantidade: montar frases como "It's a bee", completar frases em formato de quiz e montar palavras. Tudo precisa continuar jogável por crianças de 3 a 5 anos que ainda não leem, sem som, com o adulto lendo em voz alta.

## What Changes

- Jogo **Montar a frase**: peças de quebra-cabeça ("It's", "a" e a peça com o desenho do bicho) entram nos espaços da esquerda para a direita. Cada espaço tem a mesma forma e cor da sua peça; a criança monta pelas formas.
- Jogo **Quiz da sombra**: a frase "It's a ___" aparece com a sombra de um bicho no espaço; a criança escolhe o desenho certo entre três e a frase se completa.
- Jogo **Montar a palavra**: as letras da palavra aparecem apagadas nos espaços; a criança toca as letras soltas na ordem, casando cada uma com a forma apagada.
- Sete missões novas continuando o jardim: M07 "It's a bee", M08 "It's a frog", M09 "It's a rabbit" (frase); M10 e M11 (quiz: abelha e coelho); M12 BEE e M13 FROG (palavra).
- Abelha nova gerada no Magnific; sombras e peças feitas por CSS a partir da arte existente.
- Jardim mais alto, com rolagem vertical, e rolagem automática até a próxima missão sugerida.

## Capabilities

### New Capabilities
- `sentence-game`: montar frases com peças de quebra-cabeça e as missões M07–M09.
- `quiz-game`: completar "It's a ___" escolhendo o desenho pela sombra, missões M10 e M11.
- `spelling-game`: montar palavras casando letras com formas apagadas, missões M12 e M13.

### Modified Capabilities
- `app-shell`: jardim com mais de seis missões, rolagem e foco na missão sugerida (requisito adicionado).

## Impact

- Novos módulos em `web/src/games/`, validação em `shared/content.ts`, conteúdo em `missions.json`.
- Vocabulário e frases (`It's a bee/frog/rabbit`, `bee`, `frog`) não foram mapeados à apostila Curious Ones e **precisam de validação da Fernanda** antes do teste com famílias. O PRD original previa seis missões; esta mudança amplia o piloto por decisão do usuário.
