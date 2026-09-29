# Mundo Meu Filho Bilíngue — piloto

Jogos visuais de inglês para crianças de 3 a 5 anos, acompanhados pelos pais. Sem som. 13 missões num jardim: caminhos, cores, quantidades, montar frases, quiz da sombra e montar palavras.

- `web/` — front (Vite + TypeScript, sem framework). Publicado na Vercel.
- `server/` — API (Node + Hono + `node:sqlite`). Roda numa VPS.
- `shared/` — esquema do conteúdo e agregação do progresso, usados pelos dois.
- `web/public/content/missions.json` — texto e configuração das missões. Editar aqui não exige mexer em código.
- `design-system/` — marca Meu Filho Bilíngue (ver `CLAUDE.md`).
- `openspec/` — especificações e plano das mudanças.

Requer **Node 24+** (o servidor roda TypeScript direto, sem build).

## Rodar localmente

```bash
npm install
npm run conta:criar -- voce@exemplo.com --dev   # pergunta a senha; Enter gera uma
npm run dev:server                              # API em http://localhost:8787 (banco server/dev.db)
npm run dev:web                                 # app em http://localhost:5180
```

Para abrir no celular, use o endereço "Network" que o Vite mostra (mesma rede Wi-Fi). Em `--dev` o cookie de sessão não exige HTTPS, para funcionar nesse endereço.

```bash
npm test            # testes (Vitest)
npm run typecheck   # tipos
npm run build       # gera web/dist
```

## Contas (equipe)

Não há cadastro no app. Na VPS, dentro de `/opt/mfb-interactive/app`:

```bash
sudo -u mfb node server/src/cli.ts criar familia@exemplo.com       # cria; pede a senha (Enter gera e mostra uma vez)
sudo -u mfb node server/src/cli.ts senha familia@exemplo.com       # redefine a senha e encerra sessões abertas
sudo -u mfb node server/src/cli.ts desativar familia@exemplo.com   # bloqueia o acesso e encerra sessões
```

Senha mínima de 8 caracteres. Localmente, use `npm run conta:criar -- <email> --dev` (banco `server/dev.db`).

## Publicar

Passo a passo completo (VPS, HTTPS, backup e Vercel), com um prompt pronto para um agente de IA fazer a instalação: **[DEPLOY.md](DEPLOY.md)**.
