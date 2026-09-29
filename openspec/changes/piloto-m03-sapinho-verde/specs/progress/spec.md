# Spec Delta

## Purpose

Guarda na conta da família o progresso de uma única criança, disponível em qualquer aparelho, sem exigir dados da criança e sem interromper a brincadeira quando a internet falha.

## ADDED Requirements

### Requirement: Progresso de uma criança por conta
O app SHALL guardar no servidor o progresso de uma única criança por conta, sem nome, foto, data de nascimento ou outros dados da criança. O progresso de uma conta MUST NOT ser visível para outra conta.

#### Scenario: Sem dados da criança
- **WHEN** o progresso salvo de uma conta é inspecionado
- **THEN** ele contém apenas registros de missões (conclusão, pulo, ajuda, repetições, demonstração vista, boas-vindas vistas) e nenhum dado da criança

#### Scenario: Outro aparelho
- **WHEN** a M03 é concluída no celular e o adulto entra com a mesma conta no tablet
- **THEN** o jardim do tablet mostra a M03 como concluída

### Requirement: Registros por missão
Para cada missão, o progresso SHALL registrar se foi concluída, se alguma conclusão ocorreu com ajuda, se foi pulada, quantas vezes foi iniciada ou repetida e quantas vezes a ajuda foi acionada. Conclusão com ajuda SHALL ser distinta de missão pulada. Uma missão SHALL poder estar concluída e também ter registros posteriores de repetição com ajuda.

#### Scenario: Concluir com ajuda
- **WHEN** a criança conclui a M03 depois de a ajuda ter sido acionada na mesma tentativa
- **THEN** a M03 fica registrada como concluída e com ajuda, e não como pulada

#### Scenario: Pular depois de concluir
- **WHEN** a M03 já concluída é aberta de novo e o adulto a pula
- **THEN** a M03 continua concluída e o pulo é registrado

### Requirement: Salvamento imediato
Iniciar, concluir, pular ou acionar ajuda SHALL ser registrado no aparelho imediatamente e enviado ao servidor assim que houver conexão. Recarregar a página MUST NOT perder registros ainda não enviados quando o armazenamento do navegador estiver disponível.

#### Scenario: Recarregar após concluir
- **WHEN** a M03 é concluída com internet e a página é recarregada
- **THEN** o jardim mostra a M03 como concluída

### Requirement: Funcionamento sem internet
Se o servidor estiver inacessível durante a brincadeira, o jogo SHALL continuar funcionando, os registros SHALL ficar pendentes no aparelho e SHALL ser enviados automaticamente quando a conexão voltar. Enquanto houver registros pendentes, o app SHALL avisar o adulto de forma discreta, fora da área da criança.

#### Scenario: Internet cai no meio da missão
- **WHEN** a conexão cai e a criança conclui a M03
- **THEN** o resultado aparece normalmente, o jardim mostra a M03 como concluída e há um aviso de progresso ainda não sincronizado

#### Scenario: Internet volta
- **WHEN** a conexão volta com registros pendentes
- **THEN** os registros são enviados, o aviso desaparece e o servidor passa a refletir a conclusão

#### Scenario: Armazenamento do navegador indisponível
- **WHEN** o navegador bloqueia o armazenamento local e a conexão está ativa
- **THEN** a M03 pode ser jogada e o progresso é salvo direto no servidor

### Requirement: Sem perda nem duplicação entre envios e aparelhos
Cada registro SHALL ser contado uma única vez, mesmo se for reenviado. Registros de aparelhos diferentes da mesma conta SHALL se somar, sem que um apague o outro.

#### Scenario: Reenvio após falha
- **WHEN** um lote de registros é enviado, a resposta se perde e o app reenvia o mesmo lote
- **THEN** o servidor conta cada registro uma única vez

#### Scenario: Dois aparelhos
- **WHEN** a M03 é concluída no celular sem internet e pulada no tablet com internet, e depois o celular reconecta
- **THEN** a M03 fica concluída e com um pulo registrado

### Requirement: Apagar progresso
Apagar o progresso SHALL exigir uma ação explícita do responsável e uma confirmação, e SHALL apagar os registros da conta no servidor e os pendentes no aparelho. Não há recuperação depois de apagar.

#### Scenario: Apagar com confirmação
- **WHEN** o responsável aciona apagar progresso e confirma
- **THEN** todos os registros da conta são removidos e o jardim mostra todas as missões como não concluídas

#### Scenario: Desistir de apagar
- **WHEN** o responsável aciona apagar progresso e cancela
- **THEN** nenhum registro é alterado
