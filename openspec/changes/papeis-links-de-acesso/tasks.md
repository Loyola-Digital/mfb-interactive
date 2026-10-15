# Tasks

## 1. Servidor

- [x] 1.1 Coluna `role` com CHECK e migração; tabela `invites` com hash do token
- [x] 1.2 `setRole` e comandos `admin`/`familia` no `cli.ts`; papel lido do banco a cada pedido; `/me` e `/login` devolvem o papel
- [x] 1.3 Rotas `/admin/invites` (listar, criar, cancelar) e `/admin/users` só para admin; `/invites/check` e `/invites/accept` públicas com limite por IP
- [x] 1.4 Testes: papel padrão, CHECK, 403 para família, tirar admin vale na hora, convite de uso único, expiração, cancelamento, nova senha encerra sessões, sem link para admin, papel do corpo ignorado, bloqueio por IP

## 2. App

- [x] 2.1 Tela de administração: gerar, copiar, compartilhar e cancelar links; listas de links e contas
- [x] 2.2 Tela do link: confere, cria senha (duas vezes), entra; link inválido explica o que fazer; token sai do endereço
- [x] 2.3 Entrada na área dos pais só para admin

## 3. Documentação e verificação

- [x] 3.1 README e DEPLOY.md: primeira conta da VPS recebe admin
- [x] 3.2 Admin na conta de desenvolvimento; fluxo completo em 390 px (gerar, abrir, criar senha, reuso, família sem acesso); `npm test`, `npm run typecheck`, `npm run build`
