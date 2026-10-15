# Spec Delta

## Purpose

Links de acesso que o admin gera para famílias entrarem ou trocarem a senha.

## ADDED Requirements

### Requirement: Gerar link
O admin SHALL gerar, na tela de administração, um link para um e-mail. O link SHALL valer só para esse e-mail, uma única vez, por 7 dias. Um link novo para o mesmo e-mail SHALL cancelar os pendentes. O banco MUST guardar só o hash do token, e o link SHALL ser mostrado uma única vez, com botões de copiar e compartilhar.

#### Scenario: Convite para família nova
- **WHEN** o admin gera um link para `familia@exemplo.com`, que não tem conta
- **THEN** aparece um link de convite válido até 7 dias depois

### Requirement: Usar o link
Quem abre o link SHALL ver o e-mail e criar uma senha de pelo menos 8 caracteres, digitada duas vezes. Ao confirmar, a conta SHALL ser criada como família (convite) ou ter a senha trocada com as sessões encerradas (nova senha), e a pessoa SHALL entrar no app. Link usado, expirado ou cancelado SHALL mostrar "Link inválido" com o caminho para pedir outro.

#### Scenario: Link usado duas vezes
- **WHEN** alguém abre de novo um link que já criou a conta
- **THEN** aparece "Link inválido" e nada muda na conta

### Requirement: Limites
Não SHALL haver link para conta admin. Tokens inválidos em sequência SHALL bloquear o IP como no login. Senha curta MUST NOT gastar o link.

#### Scenario: Link para conta admin
- **WHEN** o admin tenta gerar link para uma conta admin
- **THEN** o app explica que contas admin trocam a senha pelo comando na VPS

### Requirement: Acompanhar links e contas
A tela de administração SHALL listar os links (e-mail, tipo, criação, validade, situação: aguardando, usado, expirou, cancelado), permitir cancelar os pendentes e listar as contas com papel, situação e última atividade. A entrada para ela SHALL aparecer na área dos pais só para admin.

#### Scenario: Família na área dos pais
- **WHEN** uma conta família abre a área dos pais
- **THEN** não aparece a administração, e abrir `#/admin` volta para a área dos pais
