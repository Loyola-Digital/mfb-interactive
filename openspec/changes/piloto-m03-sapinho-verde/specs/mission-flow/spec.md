# Spec Delta

## Purpose

Define o ciclo de vida comum a qualquer missão, independente do tipo de jogo: preparação do adulto, demonstração, ajuda, resultado, repetição, saída, pulo e sugestão fora da tela.

## ADDED Requirements

### Requirement: Preparação do adulto
Antes de cada missão, o app SHALL mostrar ao adulto um cartão com o objetivo em uma frase em português, a palavra-alvo em inglês com o significado em português, uma orientação curta de como acompanhar e o botão "VAMOS BRINCAR".

#### Scenario: Abrir a preparação da M03
- **WHEN** a M03 é aberta a partir do jardim
- **THEN** o cartão mostra o objetivo, a palavra `green` com o significado "verde", a orientação ao adulto e o botão "VAMOS BRINCAR"

### Requirement: Demonstração visual inicial
Na primeira abertura de uma missão, uma mão ou marcador SHALL demonstrar o gesto em um exemplo e devolver o controle à criança. A demonstração MUST NOT concluir a missão nem alterar o estado final da atividade.

#### Scenario: Primeira abertura
- **WHEN** a criança entra no jogo da M03 pela primeira vez nesta conta
- **THEN** a demonstração é exibida uma vez, depois o jogo fica disponível para toque, e a missão continua não concluída

#### Scenario: Toques durante a demonstração
- **WHEN** a criança toca na tela durante a demonstração
- **THEN** a demonstração é encerrada e o controle volta à criança, sem registrar tentativa

### Requirement: Ajuda sob demanda
Toda missão SHALL ter um botão visual de ajuda que repete a demonstração. A ajuda MUST NOT concluir a atividade automaticamente. Acionar a ajuda SHALL ser registrado no progresso da tentativa.

#### Scenario: Pedir ajuda
- **WHEN** o botão de ajuda é tocado durante o jogo
- **THEN** a demonstração é repetida, a missão continua não concluída e o uso da ajuda é registrado

### Requirement: Tentativas sem punição
Tentativas inválidas MUST NOT retirar conquistas, reiniciar a missão, bloquear a interação ou mostrar mensagens de erro punitivas. Tocar no fundo vazio MUST NOT contar como tentativa inválida.

#### Scenario: Toque no fundo
- **WHEN** a criança toca em área vazia da tela de jogo
- **THEN** nada é registrado como tentativa e o estado do jogo não muda

### Requirement: Resultado da missão
Ao concluir, o app SHALL mostrar a transformação no cenário, o coelho comemorando e a palavra-alvo junto à imagem, com opções visíveis de repetir, voltar ao jardim e encerrar e, quando houver uma missão seguinte na ordem do jardim, um botão "Próxima missão" que abre a preparação do adulto dessa missão. O app MUST NOT iniciar a próxima missão automaticamente.

#### Scenario: Próxima missão
- **WHEN** a criança conclui a M03 e o adulto toca em "Próxima missão"
- **THEN** abre o cartão de preparação da M04, sem começar o jogo

#### Scenario: Última missão
- **WHEN** a última missão do jardim é concluída
- **THEN** o botão "Próxima missão" não aparece

#### Scenario: Concluir a M03
- **WHEN** a criança aplica a tinta verde no sapo
- **THEN** a tela de resultado mostra o sapo verde com a palavra `green`, o coelho comemorando e os botões repetir, jardim e encerrar

### Requirement: Sugestão fora da tela
A tela de resultado SHALL mostrar ao adulto uma sugestão opcional de atividade fora da tela, definida no conteúdo da missão, sem exigir confirmação de execução.

#### Scenario: Sugestão da M03
- **WHEN** a tela de resultado da M03 é exibida
- **THEN** aparece a sugestão da M03 (ex.: procurar algo verde em casa) sem botão obrigatório de confirmação

### Requirement: Sair e pular
Durante uma missão, o adulto SHALL poder sair para o jardim ou marcar a missão como pulada. Sair de uma missão incompleta MUST NOT alterar conclusões anteriores; ao reabrir, a missão recomeça do início. Pular MUST NOT registrar a missão como concluída.

#### Scenario: Sair no meio
- **WHEN** o adulto sai da M03 antes de concluir
- **THEN** volta ao jardim, conclusões anteriores permanecem e a M03 recomeça do início na próxima abertura

#### Scenario: Pular
- **WHEN** o adulto marca a M03 como pulada
- **THEN** volta ao jardim, a M03 é registrada como pulada e não como concluída

### Requirement: Repetição livre
Uma missão concluída SHALL poder ser repetida quantas vezes a família quiser. Repetir MUST NOT apagar a conclusão anterior.

#### Scenario: Repetir após concluir
- **WHEN** a criança repete a M03 já concluída e sai no meio
- **THEN** a M03 continua registrada como concluída e a repetição é contabilizada
