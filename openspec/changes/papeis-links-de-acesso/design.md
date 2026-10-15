# Design

## Context

Login por e-mail e senha (scrypt), sessão em cookie HttpOnly/Secure/SameSite=Lax com token guardado como SHA-256, limite de tentativas por e-mail e IP. Contas criadas só pelo `cli.ts`.

## Goals / Non-Goals

**Goals:** admin consegue dar acesso sem entrar na VPS; nenhuma forma de virar admin pela web; tokens nunca guardados em claro.

**Non-Goals:** envio de e-mail pelo servidor; mais papéis além de família e admin; o admin desativar ou excluir contas pela web (continua no `cli.ts`).

## Decisions

### 1. Papel como coluna com CHECK
`role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family','admin'))`. Bancos antigos recebem a coluna por `ALTER TABLE`. O banco recusa qualquer outro valor, mesmo vindo de um bug no código.

### 2. Papel só pela VPS, lido a cada pedido
`setRole` só é chamado pelo `cli.ts`. O middleware de sessão já faz `JOIN users` e passa a ler `role`; tirar o admin vale no pedido seguinte, sem depender de cookie ou de novo login.

### 3. Link ligado a um e-mail
Token de 32 bytes aleatórios (base64url) no fragmento do endereço (`#/convite/...`), que não vai para logs nem `Referer`. O banco guarda só o SHA-256. Vale 7 dias, uma vez; um link novo para o mesmo e-mail cancela os pendentes. A tela do link tira o token do endereço com `history.replaceState`.
- *Alternativa: link aberto em que a pessoa digita o e-mail.* Rejeitada: qualquer um com o link criaria conta.

### 4. Convite e nova senha no mesmo mecanismo
E-mail sem conta → `invite`; conta de família → `reset` (usa `setPassword`, que encerra as sessões). Conta admin → recusado, para um admin não tomar a conta de outro pela web.

### 5. Proteções das rotas públicas
`/invites/check` e `/invites/accept` contam token inválido como falha por IP (mesmo limite do login). `accept` lê só `token` e `password`; o papel é sempre `family`. Senha curta não gasta o link. Tudo numa transação.

## Risks / Trade-offs

- [Admin perde o celular com sessão aberta] → tirar o admin pelo `cli.ts familia` vale na hora; `cli.ts senha` encerra as sessões.
- [Link enviado para o e-mail errado] → o admin cancela na tela; o link só cria conta para aquele e-mail.
- [Link de nova senha reativa conta desativada] → comportamento de `setPassword`, intencional: o admin decidiu mandar o link.
