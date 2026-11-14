# Design

## Fila de falas

`say` interrompe e fala; `sayNext` entra na fila. A instrução abre o jogo com `say`; a fala da rodada, a palavra do modelo e o "Good job!" usam `sayNext`, então a ordem é sempre instrução → palavra → elogio → próxima rodada. O erro usa `say`: corta o que está tocando e limpa a fila. Cada fala guarda a sua vez (`turn`): o fim atrasado de uma fala interrompida (a voz do navegador avisa depois do `cancel`) não puxa a seguinte.

As linhas em português levam `lang: 'pt-BR'` para a voz do navegador; a gravação, quando existe, segue a mesma regra de nome de qualquer texto (`audioSlug` tira os acentos: "Qual é igual a esta?" → `qual-e-igual-a-esta.mp3`).

## Onde fica a instrução

Na barra do adulto, no lugar do título: um botão amarelo com alto-falante e a frase em português. No celular (menos de 480 px) ele ganha uma linha própria embaixo de Sair e Pular; as frases foram encurtadas para caber numa linha ("Leve o coelhinho.", "Quantos são?").

## Fim da atividade

A tela de resultado deixa de ser uma página de adulto. O fim reaproveita a moldura do jogo: barra do adulto (Jardim, palavra = significado, Encerrar) e, na área da criança, a cena, a palavra com alto-falante, a seta de 112 px para a próxima e o repetir de 64 px. A seta abre a preparação da próxima (o adulto continua vendo o objetivo antes do jogo); sem próxima, volta ao jardim ou às provas. O texto "fora da tela" vai para a preparação, que o adulto já lê.

## Letra e palavra

Escolher em vez de Ligar: rodada com `audio` = nome da letra, enunciado "A a" e três figuras com a palavra escrita (`{ art, text }`); a certa tem `audio` com a palavra. As palavras usam figuras que já existem (ant, ball, cat, ..., zipper); X não tem figura que comece com ele e fica de fora, com uma nota ao adulto.
