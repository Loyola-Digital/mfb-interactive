# Spec Delta

## Purpose

Dá ao responsável uma visão descritiva do que a criança praticou, sem notas nem promessa de aprendizagem, explica onde o progresso fica salvo e concentra as ações da conta.

## ADDED Requirements

### Requirement: Acesso à área dos pais
A área dos pais SHALL ser acessível a partir do jardim por um controle posicionado fora da área principal de interação da criança.

#### Scenario: Abrir a área dos pais
- **WHEN** o adulto toca no controle da área dos pais no jardim
- **THEN** a área dos pais abre e oferece volta ao jardim

### Requirement: Acompanhamento descritivo
A área dos pais SHALL listar as missões com os estados "praticado", "concluído", "com ajuda" e "pulado", e os conteúdos apresentados (palavra-alvo e significado). Ela MUST NOT mostrar notas, porcentagens de domínio ou a expressão "palavras aprendidas".

#### Scenario: Após concluir a M03 com ajuda
- **WHEN** a M03 foi concluída com ajuda e a área dos pais é aberta
- **THEN** a M03 aparece como concluída e com ajuda, com a palavra `green` — verde, e nenhuma nota é exibida

#### Scenario: Sem progresso
- **WHEN** nenhuma missão foi praticada
- **THEN** a área dos pais mostra que ainda não há atividades praticadas, sem erro

### Requirement: Conta e salvamento
A área dos pais SHALL mostrar o e-mail da conta, explicar que o progresso fica salvo na conta e aparece em qualquer aparelho em que ela entrar, e indicar quando há progresso ainda não sincronizado.

#### Scenario: Leitura da conta
- **WHEN** a área dos pais é aberta
- **THEN** o e-mail da conta e o texto sobre o salvamento na conta estão visíveis

#### Scenario: Pendências de sincronização
- **WHEN** há registros ainda não enviados ao servidor
- **THEN** a área dos pais informa que parte do progresso será enviada quando a internet voltar

### Requirement: Sair da conta pela área dos pais
A área dos pais SHALL oferecer a ação "SAIR DA CONTA", com confirmação, seguindo `account-access`. Se houver registros não sincronizados, a confirmação SHALL avisar que eles serão perdidos neste aparelho.

#### Scenario: Sair com pendências
- **WHEN** há registros pendentes e o adulto toca em "SAIR DA CONTA"
- **THEN** a confirmação avisa que o progresso ainda não enviado será perdido neste aparelho

### Requirement: Apagar progresso pela área dos pais
A área dos pais SHALL oferecer a ação de apagar o progresso da conta, seguindo a confirmação definida em `progress`.

#### Scenario: Botão de apagar
- **WHEN** a área dos pais é aberta
- **THEN** existe uma ação "APAGAR PROGRESSO" que pede confirmação antes de apagar
