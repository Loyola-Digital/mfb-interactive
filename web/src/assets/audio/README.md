# Áudios

Cada texto falado do app vira um arquivo aqui, com o nome que está em `LISTA.csv`. Enquanto um arquivo não existe, o app usa a voz do navegador em inglês; sons de letra (`/t/`) não têm essa alternativa e mostram ao adulto o que dizer.

Para atualizar a lista depois de mudar o conteúdo: `npm run audios`.

**Situação em 09/11/2026:** as 110 palavras, frases e nomes de letra foram gerados no site do Fish Audio com a voz "Voz Feminina Persuasiva" (voz da professora), modelo Drama 3, velocidade 0.9x. Foram 5 gerações com `[long pause]` entre as falas, cortadas nas pausas com o ffmpeg (100 ms de folga antes e 80 ms depois). Faltam os 20 sons de letra.

**13/11/2026:** mais 131 falas em inglês (instruções, nomes de letra, palavras, "Good job!", "Oops! Try again.", pares de números como "one, three") do mesmo jeito, em 7 gerações. As 36 instruções em português (tipo `português` na lista) foram geradas em 14/11/2026 com a mesma voz, em 3 gerações. Pares de números e frases com duas partes foram cortados com `D=0.8` (a vírgula também faz pausa).

## Como gravar

- **Formato:** `.mp3`, mono, 44,1 kHz, 128 kbps. Sem silêncio no começo e no fim (no máximo 0,1 s).
- **Voz:** inglês americano, a mesma voz em todos os arquivos, calorosa e clara, um pouco mais devagar que a fala normal. Volume parecido entre os arquivos.
- **Palavras e frases:** só o texto, sem "Listen:" nem pergunta. Frases com entonação de afirmação.
- **Nome da letra** (`letra-b.mp3`): o nome em inglês ("bee").
- **Som da letra** (`som-t.mp3`): só o som, curto, sem vogal depois (/t/, não "tuh"). `som-k` é o som de c/k (cat, kite); `som-x` é o "ks" do fim de box; `som-q` é o "kw" de queen. Vozes sintéticas costumam errar estes sons: o melhor é gravar com uma pessoa (a Fernanda, por exemplo).
- **Nome do arquivo:** exatamente o da coluna `arquivo`. Arquivo com outro nome é ignorado.

## Gerar no Fish Audio

1. Crie uma chave em fish.audio (API Keys) e salve-a sozinha no arquivo `.fish-audio-key`, na pasta do projeto (o git ignora esse arquivo).
2. `npm run audios:fish -- vozes` lista vozes em inglês com link de amostra (`-- vozes kids` filtra pelo nome).
3. `npm run audios:fish -- amostra <id da voz>` grava `audio-amostras/<id>.mp3` com "red", "B" e "Nate ate cake".
4. `npm run audios:fish -- gerar <id da voz>` grava aqui tudo o que falta, menos os sons das letras. `--refazer` grava de novo os que já existem.

O modelo padrão é o `s2.1-pro-free`, que funciona sem crédito de API. Com saldo, `FISH_MODEL=drama-3` usa o mesmo modelo do site.

Depois de copiar os arquivos para esta pasta, rode `npm run audios` (a coluna `situacao` passa a `ok`) e publique o front de novo.
