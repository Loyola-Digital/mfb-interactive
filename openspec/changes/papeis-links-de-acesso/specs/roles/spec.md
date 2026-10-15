# Spec Delta

## Purpose

Papéis de usuário: família e admin.

## ADDED Requirements

### Requirement: Papéis no banco
Cada conta SHALL ter o papel `family` ou `admin`, e o banco MUST recusar qualquer outro valor. Toda conta nova SHALL nascer como `family`, inclusive as criadas por link de acesso.

#### Scenario: Papel inválido
- **WHEN** algo tenta gravar o papel `root` numa conta
- **THEN** o banco recusa e a conta continua com o papel anterior

### Requirement: Mudança de papel só pela VPS
O papel SHALL mudar apenas pelos comandos `admin` e `familia` do `cli.ts`. A API MUST NOT ter rota que altere papel, e campos de papel enviados em pedidos MUST ser ignorados.

#### Scenario: Pedido tentando virar admin
- **WHEN** alguém usa um link de acesso enviando `role: "admin"` no corpo
- **THEN** a conta é criada como `family`

### Requirement: Conferência do papel a cada pedido
O servidor SHALL ler o papel do banco em cada pedido autenticado e responder 403 às rotas de administração para quem não é admin. Tirar o admin SHALL valer no pedido seguinte, sem novo login.

#### Scenario: Admin removido com sessão aberta
- **WHEN** o comando `familia` é rodado para uma conta admin com sessão aberta
- **THEN** o próximo pedido dela à administração recebe 403
