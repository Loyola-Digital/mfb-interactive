# Mundo Meu Filho Bilíngue — piloto

Jogos visuais de inglês baseados nas apostilas da Fernanda Zapparoli, acompanhados pelos pais. Sem som. O progresso fica na conta da família, no servidor.

- **Três apostilas:** Curious Ones 1 (a partir de 3 anos), Curious Ones 2 (a partir de 4 anos) e Explorers 1 (Ensino Fundamental I). Cada uma segue os capítulos do livro, com exercícios e uma prova no fim do capítulo (93 missões ao todo).
- **Três abas:** **Exercícios** (trilha no jardim), **Provas** (uma por capítulo, sem ajuda; os acertos aparecem só na área dos pais) e **Teste de alinhamento** (sugere por qual apostila começar; aparece sozinho no primeiro acesso).
- **Área dos pais:** o que foi praticado por apostila e capítulo, acertos das provas, apostila atual e, para admin, a administração de links de acesso.

## Pastas

- `web/` — front (Vite + TypeScript, sem framework). Publicado na Vercel.
- `server/` — API (Node + Hono + `node:sqlite`). Roda numa VPS.
- `shared/` — esquema do conteúdo e agregação do progresso, usados pelos dois.
- `web/public/content/missions.json` — apostilas, capítulos, missões e teste de alinhamento. Editar aqui não exige mexer em código.
- `web/public/content/img/` — figuras recortadas dos PDFs das apostilas (uma `.webp` por palavra).
- `design-system/` — marca Meu Filho Bilíngue (ver `CLAUDE.md`).
- `openspec/` — especificações e plano das mudanças.

## Conteúdo (`missions.json`)

```
books[]          CO1, CO2, EX1 (nessa ordem)
  chapters[]     módulo do livro, ex.: "Cores e formas"
    missions[]   exercícios (id CO1-05) e, no fim, a prova (id CO1-P1, "test": true)
placement[]      teste de alinhamento: 4 rodadas por apostila
```

Tipos de jogo: `paths` (caminho), `colors` (pintar), `quantities` (plantar), `pick` (escolher: várias rodadas, usado também nas provas e no alinhamento), `match` (ligar pares), `sentence` (montar frase), `spelling` (montar palavra) e `quiz` (completar pela sombra). Cada missão traz `bookRef` com a página da apostila. O arquivo é validado ao carregar (`shared/content.ts`); `npm test` também confere que toda figura usada existe.

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

## Contas e papéis

Não há cadastro aberto. Cada conta tem um papel: **família** (padrão) ou **admin**.

- **Admin** gera links de acesso pelo app (Área dos pais → Administração): digita o e-mail, copia o link e envia à família. O link vale só para aquele e-mail, uma única vez, por 7 dias, e pode ser cancelado. Se a conta já existir, o link serve para criar uma senha nova. Contas admin não recebem link.
- O papel **só muda por comando na VPS**; a API não tem rota para isso. Toda conta criada por link é família.

Na VPS, dentro de `/opt/mfb-interactive/app`:

```bash
sudo -u mfb node server/src/cli.ts criar voce@exemplo.com          # cria; pede a senha (Enter gera e mostra uma vez)
sudo -u mfb node server/src/cli.ts admin voce@exemplo.com          # dá o papel admin
sudo -u mfb node server/src/cli.ts familia voce@exemplo.com        # tira o admin (vale na hora)
sudo -u mfb node server/src/cli.ts senha familia@exemplo.com       # redefine a senha e encerra sessões abertas
sudo -u mfb node server/src/cli.ts desativar familia@exemplo.com   # bloqueia o acesso e encerra sessões
```

Senha mínima de 8 caracteres. Localmente, use `npm run conta:criar -- <email> --dev` e `npm run conta:admin -- <email> --dev` (banco `server/dev.db`).

## Publicar

Passo a passo completo (VPS, HTTPS, backup e Vercel), com um prompt pronto para um agente de IA fazer a instalação: **[DEPLOY.md](DEPLOY.md)**.
