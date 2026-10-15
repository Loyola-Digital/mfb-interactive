# Proposal

## Why

Em 15/10/2026 o usuário pediu papéis de usuário no banco, de forma segura, para atribuir **admin** à própria conta e, com ela, enviar links de acesso às famílias. Até aqui as contas só eram criadas por comando na VPS.

## What Changes

- Coluna `role` em `users` com os valores `family` (padrão) e `admin`, garantidos por `CHECK` no banco. Contas antigas viram `family` pela migração automática.
- Papel só muda por comando na VPS (`cli.ts admin <email>` / `cli.ts familia <email>`); a API não tem rota para isso.
- O servidor lê o papel do banco a cada pedido; rotas `/api/admin/*` respondem 403 para quem não é admin.
- **Links de acesso**: o admin informa um e-mail e recebe um link único (`#/convite/<token>`), válido por 7 dias, de uso único, cancelável. E-mail novo → convite (cria a conta, sempre `family`); e-mail de família existente → nova senha (encerra as sessões abertas). Conta admin não recebe link.
- Tela de administração (Área dos pais → Administração) para gerar, copiar, compartilhar e cancelar links e ver as contas.
- Tela do link: confere o link, a pessoa cria a senha e já entra.

## Capabilities

### New Capabilities
- `roles`: papéis família e admin e como mudam.
- `access-links`: links de acesso criados pelo admin.

## Impact

- `server/src/db.ts` (coluna e tabela `invites`, migração), `accounts.ts`, `invites.ts`, `app.ts`, `cli.ts`; `web/src/screens/admin.ts` e `invite.ts`.
- README e DEPLOY.md: a primeira conta da VPS recebe admin pelo comando.
- Não há envio de e-mail: o admin copia o link e manda por WhatsApp ou e-mail.
