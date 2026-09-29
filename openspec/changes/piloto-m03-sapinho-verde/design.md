# Design

## Context

O repositório tem só o `design-system/` (tokens CSS gerados de `tokens.json`, componentes `mfb-*` sem JavaScript, logos e a turma de balões) e as referências de layout em `reference/`. Não há app, build nem testes. O design system nasceu para landing pages (faixas, balões); aqui ele vale para a interface (cores, fontes, botões, cartões, foco). A arte do jogo (coelho, jardim, sapo) é própria, por decisão do usuário.

O front será hospedado na Vercel e o back-end numa VPS do usuário. O produto deve crescer para outros mini-jogos e animações mais ricas, então a base precisa isolar "tipo de jogo" do resto do app sem montar um engine agora.

## Goals / Non-Goals

**Goals:**
- Front estático que roda em Chrome Android, Safari iOS e desktop; back-end pequeno que só faz autenticação e progresso.
- Regras dos jogos e do progresso em funções puras, testáveis sem navegador e compartilhadas entre front e back quando fizer sentido.
- Adicionar um novo tipo de jogo = um módulo novo + uma entrada no mapa de tipos, sem mexer no fluxo de missão.
- Conteúdo das missões editável pela equipe num arquivo, sem mexer no back-end.
- Deixar o cadastro de contas pronto para receber a fase 2 (validação de aluno por e-mail) sem refazer tabelas.

**Non-Goals:**
- Jogos de Caminhos e Quantidades (M01, M02, M05, M06): próximas mudanças.
- Fase 2 de acesso (e-mail → validação de aluno → definir senha) e recuperação de senha pela família.
- Vários perfis de criança por conta, painel administrativo web, e-mails transacionais.
- Engine de jogo, canvas/WebGL, sistema de cenas genérico. PWA/offline completo (só a brincadeira em andamento tolera queda de internet).

## Decisions

### 1. Vite + TypeScript no front, sem framework de UI
Vite dá servidor de desenvolvimento acessível pelo celular na rede local (`--host`), build estático para a Vercel e Vitest para testes. TypeScript tipa o esquema de conteúdo e o estado dos jogos, que é onde o projeto vai crescer.
- *Alternativa: HTML + JS puro sem build.* Menos dependências, mas sem tipos e sem teste integrado; a vantagem some com o back-end e mais tipos de jogo.
- *Alternativa: React/Next.* Seis telas não justificam; a interatividade é pontual e o DOM direto dá controle fino de toque e animação.
- *Alternativa: Phaser/PixiJS (canvas).* Prejudica texto real, foco, leitor de tela e alvos medidos em px CSS. Um mini-jogo futuro pode usar canvas dentro do próprio módulo sem afetar o resto.

### 2. Repositório com `web/`, `server/` e `shared/` (um único `package.json`)
Um `package.json` na raiz com todas as dependências e scripts; as pastas se importam por caminho relativo (`../../shared/progress.ts`). Workspaces npm não trariam nada com três pastas e um único deploy de cada lado. `shared/` guarda tipos de conteúdo, tipos de evento de progresso e a função que agrega eventos em estado por missão. Front e back importam o mesmo código, então "o que conta como concluído com ajuda" existe num lugar só.
- *Alternativa: dois repositórios.* Duplicaria os tipos e a regra de agregação.

### 3. Back-end: Node + Hono + SQLite
Hono (`@hono/node-server`) para as rotas e `node:sqlite` (embutido no Node 24) para o banco num único arquivo, sem módulo nativo para compilar na VPS. O Node 24 executa o TypeScript do servidor diretamente (remoção de tipos), então o back não tem etapa de build; por isso o código usa só sintaxe apagável (`erasableSyntaxOnly`). Senhas com `scrypt` do `node:crypto` (sal aleatório por usuário, comparação em tempo constante), sem biblioteca extra.
- Tabelas: `users (id, email único normalizado, password_hash, status, created_at)` — `status` começa com `active`/`disabled` e acomoda estados da fase 2; `sessions (token_hash, user_id, expires_at, last_seen_at)`; `progress_events (id, user_id, mission_id, type, at, received_at)` com `id` único.
- Rotas: `POST /api/login`, `POST /api/logout`, `GET /api/me`, `GET /api/progress`, `POST /api/progress/events`, `DELETE /api/progress`.
- *Alternativa: Postgres.* Mais folga, mas mais um serviço para manter na VPS; SQLite aguenta com sobra o piloto e os primeiros alunos.
- *Alternativa: Supabase.* Eliminaria a VPS, mas o usuário escolheu back próprio.

### 4. Vercel repassa `/api/*` para a VPS
`web/vercel.json` com `rewrites` de `/api/:path*` para `https://<api-da-vps>/api/:path*`. Para o navegador tudo é o mesmo domínio: cookie de sessão é de primeira parte (Safari/ITP não bloqueia) e não há CORS para configurar.
- *Alternativa: front chamar o domínio da VPS direto.* Exigiria CORS com credenciais e cookie de terceiros, que o Safari bloqueia.
- Em desenvolvimento, o `server.proxy` do Vite faz o mesmo papel apontando para o back local.

### 5. Sessão por cookie opaco
No login, o servidor gera um token aleatório de 32 bytes, guarda só o hash na tabela `sessions` e envia o token em cookie `HttpOnly; Secure; SameSite=Lax; Path=/`. Validade deslizante de 90 dias desde o último uso. Logout, redefinição de senha e desativação apagam as sessões do usuário.
- *Alternativa: JWT.* Não dá para invalidar no logout/desativação sem uma lista de bloqueio, o que recria a tabela de sessões.

### 6. Limite de tentativas em memória
Contador em memória por e-mail e por IP, janela de 15 minutos: 5 falhas bloqueiam o e-mail; 30 falhas bloqueiam o IP (mais folgado porque famílias na mesma rede, ou o repasse da Vercel se o IP real não chegar, compartilham o endereço). O IP vem do primeiro valor de `X-Forwarded-For`, que o Caddy preserva (`trusted_proxies`). Some quando o processo reinicia, o que é aceitável com um único processo. `// ponytail: contador em memória, mover para SQLite se houver mais de um processo`.

### 7. Contas pela linha de comando
Scripts em `server/` rodados na VPS: `npm run conta:criar -- <email>`, `conta:senha -- <email>` e `conta:desativar -- <email>`. A senha é lida do terminal sem eco (ou gerada e exibida uma vez, se omitida). Na fase 2, a criação passa a acontecer pelo fluxo de validação de aluno e esses comandos viram ferramenta de suporte.

### 8. Progresso como log de eventos
Cada ação vira um evento `{ id: uuid, missionId, type, at }` com `type` em `started | help | completed | skipped | demoSeen | welcomeSeen`. O estado de cada missão é derivado pela função de agregação de `shared/`: concluída se há `completed`; "com ajuda" se algum `completed` teve `help` na mesma tentativa (eventos entre um `started` e o `completed`); contadores somam eventos.
- O servidor insere com `INSERT OR IGNORE` pelo `id`: reenvio não duplica, e eventos de aparelhos diferentes simplesmente se somam.
- No front, eventos vão para uma fila em `localStorage` (`mfb.outbox.v1`) e são enviados em lote logo em seguida; o estado exibido é o último estado do servidor mais os eventos pendentes, agregado com a mesma função. A fila é reenviada ao voltar a conexão (`online`, `visibilitychange`) e a cada abertura. Se `localStorage` falhar, a fila fica em memória.
- O último estado recebido do servidor também fica em cache local para abrir o jardim quando o servidor está fora do ar.
- *Alternativa: gravar o estado agregado direto.* Dois aparelhos sobrescreveriam um ao outro; o log elimina o conflito.

### 9. Rotas por hash no front
`#/login`, `#/` (boas-vindas ou jardim), `#/missao/M03`, `#/pais`. Funciona em qualquer hospedagem estática e o botão voltar do celular se comporta como esperado. Roteador de ~30 linhas; sem biblioteca. Toda rota exceto `#/login` checa a sessão via `GET /api/me` na abertura.

### 10. Conteúdo em JSON servido pelo front
`web/public/content/missions.json` lista as seis missões (id, versão, tipo, referência na apostila, objetivo, palavra-alvo, significado, orientação ao adulto, imagens, tintas/pontos, alvo, sugestão fora da tela, `available`). É buscado com `fetch` e validado por uma função de `shared/`. A equipe edita o arquivo e a Vercel republica; o back-end não conhece conteúdo, só `missionId`.

### 11. Desenho pintável em SVG, arte de personagem em imagem
- O sapo é um SVG com uma região `data-paint` cuja `fill` recebe a variável da tinta escolhida; o contorno fica por cima.
- Coelho (esperando, caminhando, comemorando) e fundo do jardim são imagens WebP geradas no Magnific, com fundo removido, a partir de uma referência aprovada. Até a aprovação, placeholders SVG com as mesmas dimensões.
- Tintas mapeiam para tokens existentes: verde `--leaf`, amarelo `--yellow`, distratoras `--coral` e `--sky`. Nenhuma cor hex no código do app.

### 12. Animação com CSS e Web Animations API
Demonstração, destaque da tinta, pulinho do coelho e preenchimento usam WAAPI/CSS. Com `prefers-reduced-motion: reduce`, a demonstração vira marcadores estáticos em sequência. GSAP ou Lottie podem entrar depois, dentro de um módulo de jogo.

### 13. Uso do design system
`web/index.html` carrega `design-system/tokens.css` e `design-system/components/bundle.css` (copiados ou referenciados pelo Vite), com `class="mfb"` no `body`. Telas do adulto (login, boas-vindas, preparação, área dos pais) usam `mfb-card`, `mfb-btn`, `mfb-pill`/`mfb-chip`. CSS do jogo usa apenas variáveis. Botões em caixa alta com verbo. Os balões Coco/Sol/Nino/Lulu não aparecem dentro do jogo.

### 14. Operação da VPS
Node LTS rodando o `server/` como serviço `systemd` (reinício automático), Caddy na frente com HTTPS automático no domínio da API, banco em `/var/lib/mfb/app.db`, backup diário por `cron` com `sqlite3 app.db ".backup ..."` mantendo 14 cópias. Deploy do back por `git pull && npm ci && systemctl restart`.

### 15. Testes
Vitest em todo o repositório: redutor de Cores; agregação de eventos (com ajuda, pulo, repetição, dois aparelhos, reenvio); rotas do servidor com banco SQLite em memória (login certo/errado, limite de tentativas, sessão expirada, conta desativada, eventos duplicados, isolamento entre contas); fila do front com `fetch` e `Storage` falsos. Verificação visual e de toque no celular real.

## Risks / Trade-offs

- [Rewrite da Vercel adiciona latência e depende da VPS estar no ar] → só login e progresso passam por lá; o jogo roda com o conteúdo estático e a fila local se a VPS cair.
- [Família esquece a senha e não há recuperação automática] → equipe redefine por comando; fase 2 resolve.
- [E-mail do responsável é dado pessoal (LGPD)] → guardar só e-mail e hash de senha, nada da criança; texto de privacidade a definir (Open Questions).
- [Contador de tentativas some no reinício] → aceitável com um processo; nota `ponytail:` no código.
- [Arte do Magnific inconsistente entre poses] → gerar e aprovar uma referência antes das poses; placeholders mantêm o desenvolvimento independente.
- [Sapo em imagem raster não permite preenchimento exato] → sapo em SVG com região pintável.
- [Design system pensado para landing page] → área de jogo com layout próprio usando só tokens; componentes `mfb-*` restritos às telas do adulto.
- [Texto da M03 ainda não aprovado pela Fernanda] → todo texto no JSON.

## Migration Plan

Projeto novo, sem migração de dados. Ordem de publicação: (1) VPS com Caddy, serviço e banco criados; (2) primeira conta criada por comando; (3) projeto na Vercel apontando para `web/` com o rewrite para a API; (4) teste do fluxo completo no celular. Rollback: a Vercel volta para o deploy anterior com um clique; no back, `git checkout` da versão anterior e reinício do serviço. O esquema do banco é criado na inicialização com `CREATE TABLE IF NOT EXISTS`.

## Open Questions

- Domínio da API na VPS (ex.: `api.<domínio>`) e domínio do front: só configuração.
- Onde está a base de alunos que a fase 2 vai consultar (Kiwify, planilha, outro sistema): não afeta esta mudança, já que as contas são criadas por comando.
- Texto de privacidade/termos para o e-mail do responsável: conteúdo, não código.
- Texto final da M03 (objetivo, orientação ao adulto, sugestão fora da tela): depende da revisão da Fernanda e vive só no JSON.
