# Tasks

## 1. Base do projeto

- [x] 1.1 Criar `web/` (Vite + TypeScript sem framework), `server/` (Node + Hono + TypeScript) e `shared/` com um `package.json` na raiz e Vitest; verificar que `npm run dev:web`, `npm run build`, `npm run dev:server` e `npm test` rodam sem erro
- [x] 1.2 Carregar `design-system/tokens.css` e `design-system/components/bundle.css` em `web/index.html` com `class="mfb"` no `body` e servir as fontes do design system; verificar no navegador que Grandstander e Poppins aparecem e que um `mfb-btn` renderiza com o estilo da marca
- [x] 1.3 Configurar o proxy do Vite de `/api` para o servidor local; criar `.gitignore` (node_modules, dist, `*.db`) e `git init`; verificar que `fetch('/api/health')` no front responde pelo back e que `git status` não lista banco nem dependências

## 2. Conteúdo das missões

- [x] 2.1 Definir os tipos do conteúdo e a função de validação em `shared/`, rejeitando missão com campo obrigatório faltando; verificar com teste Vitest de conteúdo válido e inválido
- [x] 2.2 Criar `web/public/content/missions.json` com M01–M06 (M03 completa e `available: true`; demais com título, posição no jardim e `available: false`), com a M03 conforme a spec `color-game`; verificar com teste que o arquivo real passa na validação
- [x] 2.3 Implementar o carregador no front (`fetch` + validação) que devolve sucesso ou erro; verificar com teste simulando `fetch` falhando e JSON inválido

## 3. Progresso compartilhado

- [x] 3.1 Definir o tipo de evento de progresso e a função de agregação em `shared/` (concluída, com ajuda por tentativa, pulada, contadores, `demoSeen`, `welcomeSeen`); verificar com testes os cenários de `progress`: concluir com ajuda ≠ pulado, pular depois de concluir mantém concluído, eventos de dois aparelhos se somam, evento repetido pelo mesmo `id` conta uma vez

## 4. Servidor: contas e sessão

- [x] 4.1 Criar o esquema SQLite (`users`, `sessions`, `progress_events`) na inicialização e o hash de senha com `scrypt`; verificar com teste que a senha não fica em texto puro e que a verificação aceita a certa e recusa a errada
- [x] 4.2 Comandos `conta:criar`, `conta:senha` e `conta:desativar` com e-mail normalizado e mínimo de 8 caracteres; verificar com teste que e-mail duplicado falha sem alterar a conta e que redefinir senha encerra as sessões
- [x] 4.3 Rotas `POST /api/login`, `POST /api/logout` e `GET /api/me` com cookie `HttpOnly; Secure; SameSite=Lax`, validade deslizante de 90 dias e mensagem genérica de erro; verificar com testes de rota (login certo, senha errada, e-mail inexistente e conta desativada com a mesma resposta, logout invalida a sessão)
- [x] 4.4 Limite de falhas em 15 minutos (5 por e-mail, 30 por IP), com comentário `ponytail:` sobre o contador em memória; verificar com teste que a sexta tentativa é recusada mesmo com a senha certa

## 5. Servidor: progresso

- [x] 5.1 Rotas `GET /api/progress`, `POST /api/progress/events` (`INSERT OR IGNORE` pelo `id`, validação de formato) e `DELETE /api/progress`, todas exigindo sessão; verificar com testes: sem sessão responde não autorizado, lote reenviado não duplica, conta A não vê eventos da conta B, apagar remove só os da própria conta

## 6. Progresso no front

- [x] 6.1 Cliente de progresso com fila em `localStorage` (`mfb.outbox.v1`), envio em lote, reenvio em `online`/`visibilitychange`/abertura, cache do último estado do servidor, fallback em memória e estado exibido = servidor + pendentes; verificar com testes usando `fetch` e `Storage` falsos (servidor fora do ar, volta da conexão, storage que lança erro)
- [x] 6.2 Tratar resposta não autorizada do servidor encerrando a sessão local e indo para `#/login`; verificar com teste do cliente

## 7. Jogo de Cores (regras)

- [x] 7.1 Implementar o jogo de Cores com `init(content, rng)` e `reduce(state, event)` cobrindo selecionar tinta, aplicar cor certa/errada com prévia, sem tinta selecionada, ajuda progressiva após duas aplicações erradas consecutivas e ignorar eventos após `completed`; verificar com testes Vitest um por cenário da spec `color-game`
- [x] 7.2 Criar o mapa de tipos de jogo com `colors`; verificar com teste que o tipo da M03 no JSON resolve para o jogo de Cores

## 8. Casca do app

- [x] 8.1 Roteador por hash (`#/login`, `#/`, `#/missao/:id`, `#/pais`) com checagem de sessão via `GET /api/me`; verificar no navegador que sem sessão qualquer rota cai no login e que o botão voltar funciona
- [x] 8.2 Tela de login (e-mail, senha, "ENTRAR", mensagem genérica, aviso de limite de tentativas, orientação para falar com a equipe, sem cadastro); verificar no navegador com uma conta criada por `conta:criar`
- [x] 8.3 Tela de boas-vindas no primeiro acesso da conta (registra `welcomeSeen`); verificar que aparece na primeira entrada e não aparece ao entrar com a mesma conta em outro navegador
- [x] 8.4 Tela do jardim com seis pontos, marca de concluída por forma/ícone, "em breve" para missões indisponíveis, próxima missão sugerida, aviso discreto de progresso não sincronizado e controle da área dos pais fora da área da criança; verificar no navegador em 360 px que os seis pontos cabem e têm pelo menos 56 × 56 px
- [x] 8.5 Tela de erro de carregamento com "TENTAR DE NOVO" e abertura com servidor fora do ar usando o cache; verificar bloqueando `missions.json` e depois parando o servidor
- [x] 8.6 Estilos base de movimento reduzido; verificar emulando `prefers-reduced-motion` no DevTools

## 9. Fluxo da missão e tela do jogo de Cores

- [x] 9.1 Cartão de preparação do adulto a partir do JSON (objetivo, palavra-alvo e significado, orientação, "VAMOS BRINCAR"); verificar no navegador com a M03
- [x] 9.2 Tela do jogo de Cores: modelo com a palavra sempre visível, tintas com destaque por forma, sapo SVG com região `data-paint` usando tokens, prévia reversível, eventos `started`/`completed` enviados ao progresso; verificar no celular que dá para concluir, errar e corrigir só com toques
- [x] 9.3 Demonstração inicial encerrável por toque (registra `demoSeen`), botão de ajuda que repete a demonstração e registra `help`, ajuda progressiva destacando a tinta certa; verificar no navegador que nenhuma delas conclui a missão
- [x] 9.4 Controles do adulto na missão: sair (volta ao jardim, recomeça do início) e pular (registra `skipped`); verificar no navegador e conferir os eventos em `GET /api/progress`
- [x] 9.5 Tela de resultado: sapo verde com `green`, coelho comemorando, sugestão fora da tela, botões repetir / jardim / encerrar, sem avançar sozinho; verificar que repetir mantém a conclusão e soma uma repetição

## 10. Área dos pais

- [x] 10.1 Tela com lista descritiva (praticado, concluído, com ajuda, pulado), palavra e significado, e-mail da conta, texto sobre salvamento na conta, pendências de sincronização e estado vazio; verificar no navegador que não aparece nenhuma nota nem "palavras aprendidas"
- [x] 10.2 "SAIR DA CONTA" com confirmação (avisando pendências) e "APAGAR PROGRESSO" com confirmação; verificar que sair leva ao login, que apagar zera o jardim em outro aparelho e que cancelar não muda nada

## 11. Arte com Magnific

- [x] 11.1 Gerar a imagem de referência do coelhinho no estilo 2D acolhedor e aprovar com o usuário; verificar que o arquivo aprovado está em `web/src/assets/art/`
- [x] 11.2 Gerar as poses esperando, caminhando e comemorando usando a referência aprovada, remover fundo e exportar WebP; gerar o fundo do jardim; verificar lado a lado que proporções e cores do coelho batem entre poses
- [x] 11.3 Desenhar o sapo em SVG (contorno + região pintável) no estilo da arte aprovada e trocar os placeholders pelas imagens finais; verificar no celular que as imagens carregam e o sapo pinta com as duas tintas

## 12. Publicação

- [ ] 12.1 Preparar a VPS: Node LTS, usuário de serviço, `server/` como serviço `systemd`, Caddy com HTTPS no domínio da API, banco em `/var/lib/mfb/app.db`; verificar `curl https://<api>/api/health` e que o serviço volta após `reboot`
- [ ] 12.2 Backup diário por `cron` com `sqlite3 .backup` mantendo 14 cópias; verificar restaurando um backup numa cópia e abrindo o banco
- [ ] 12.3 Projeto na Vercel apontando para `web/` com `vercel.json` repassando `/api/*` para a VPS; verificar no celular que o login funciona e que o cookie fica no domínio do front
- [x] 12.4 Documentar em `README.md` como rodar localmente, criar/redefinir/desativar contas e publicar; verificar executando os comandos exatamente como escritos

## 13. Verificação integrada

- [ ] 13.1 Percorrer o fluxo completo (login → boas-vindas → jardim → M03 com erro, ajuda progressiva, correção → resultado → área dos pais → recarregar → entrar em outro aparelho) em Chrome Android e Safari iOS em 360 px ou próximo, e no desktop; verificar que os critérios de entrega do PRD aplicáveis à M03 (itens 2 a 5, 8, 11 e 12, com 6 e 7 lidos como progresso na conta) passam e registrar o resultado
- [x] 13.2 Desligar a internet no meio da M03, concluir, religar e confirmar a sincronização; conferir na aba Rede que nenhum áudio é requisitado e nenhuma permissão é pedida; verificar com `grep` que não há cor hex fora de `design-system/`
