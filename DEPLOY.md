# Publicação — guia para instalar na VPS

Este guia foi escrito para ser seguido por uma pessoa **ou por um agente de IA com acesso SSH à VPS**. Siga na ordem. Cada etapa termina com uma verificação; não avance se ela falhar.

## Como funciona em produção

```
família (celular) ──https──> Vercel (front estático, pasta web/dist)
                                 │  repassa /api/*  (vercel.json → rewrites)
                                 ▼
                     VPS: Caddy (HTTPS, porta 443) ──> Node (API, 127.0.0.1:8787) ──> SQLite (/var/lib/mfb/app.db)
```

- A API **não** fica exposta diretamente: o Node escuta só em `127.0.0.1`; quem atende a internet é o Caddy.
- O navegador fala só com o domínio da Vercel. A Vercel repassa `/api/*` para a VPS. Por isso o cookie de login funciona no Safari do iPhone sem CORS.
- Os links de acesso usam o endereço da Vercel (`<app>/#/convite/<token>`); não há envio de e-mail pelo servidor, o admin copia o link e manda à família.
- Não há build no servidor: o Node 24 roda o TypeScript de `server/` direto.

## 0. Antes de começar: o que pedir ao responsável

Um agente de IA **deve pedir ao humano** (e não inventar) estes itens:

1. **Acesso SSH** à VPS com um usuário que tenha `sudo` (Ubuntu 22.04 ou 24.04).
2. **Domínio da API**: `mfb-api.devital.com.br`, com um registro DNS **A** apontando para o IP da VPS. Verifique com `dig +short mfb-api.devital.com.br` — precisa devolver o IP da VPS antes da etapa 5.
3. **Acesso de leitura ao repositório** `github.com/Loyola-Digital/mfb-interactive` (privado). O jeito recomendado é uma *deploy key* (etapa 2): o agente gera a chave na VPS, mostra a parte pública e **pede ao humano** para cadastrá-la no GitHub.
4. **E-mail do responsável** para criar a primeira conta, que recebe o papel admin.

Nunca cole senhas, chaves privadas ou tokens em chats, commits ou arquivos do repositório.

## 1. Pacotes do sistema

```bash
sudo apt-get update
sudo apt-get install -y git sqlite3 curl ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https

# Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Caddy (repositório oficial)
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# Firewall: só SSH, HTTP e HTTPS
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw --force enable
```

**Verificar:** `node --version` mostra `v24.x` ou maior; `caddy version` responde; `sqlite3 --version` responde.

## 2. Usuário do serviço e código

```bash
sudo useradd --system --create-home --home-dir /opt/mfb-interactive --shell /bin/bash mfb
sudo mkdir -p /var/lib/mfb && sudo chown mfb:mfb /var/lib/mfb

# Deploy key (somente leitura) para clonar o repositório privado
sudo -u mfb mkdir -p -m 700 /opt/mfb-interactive/.ssh
sudo -u mfb ssh-keygen -t ed25519 -N '' -f /opt/mfb-interactive/.ssh/id_ed25519 -C "vps-mfb-deploy"
sudo -u mfb cat /opt/mfb-interactive/.ssh/id_ed25519.pub
```

➡️ **Pare aqui e peça ao humano** para cadastrar a chave pública mostrada em
GitHub → Loyola-Digital/mfb-interactive → Settings → Deploy keys → *Add deploy key* (sem marcar "Allow write access"). Continue quando ele confirmar.

```bash
sudo -u mfb -H bash -c 'cd /opt/mfb-interactive && ssh-keyscan github.com >> .ssh/known_hosts \
  && git clone git@github.com:Loyola-Digital/mfb-interactive.git app'
cd /opt/mfb-interactive/app && sudo -u mfb -H npm ci --omit=dev
```

**Verificar:** `ls /opt/mfb-interactive/app/server/src/main.ts` existe e `npm ci` terminou sem erro.

> Os caminhos abaixo assumem o código em `/opt/mfb-interactive/app`.

## 3. Serviço da API (systemd)

```bash
sudo cp /opt/mfb-interactive/app/deploy/mfb-api.service /etc/systemd/system/mfb-api.service
sudo systemctl daemon-reload && sudo systemctl enable --now mfb-api
```

**Verificar:** `systemctl status mfb-api` mostra `active (running)` e
`curl -s http://127.0.0.1:8787/api/health` devolve `{"ok":true}`.
Logs: `journalctl -u mfb-api -n 50`.

## 4. Primeira conta (admin)

Não existe cadastro aberto. A primeira conta é a do responsável, com papel **admin**: pelo app, ela gera os links de acesso das famílias (ver também README → Contas e papéis).

```bash
cd /opt/mfb-interactive/app
sudo -u mfb node server/src/cli.ts criar admin@exemplo.com
sudo -u mfb node server/src/cli.ts admin admin@exemplo.com
```

O comando `criar` pede a senha sem mostrar; apertar Enter gera uma senha e a mostra **uma única vez**. Entregue-a ao humano por um canal privado, não registre em arquivos nem em logs de chat públicos.

Outros comandos: `... cli.ts senha <email>` (redefine e encerra sessões), `... cli.ts desativar <email>` e `... cli.ts familia <email>` (tira o admin). O papel só muda por esses comandos; a API não tem rota para isso.

**Verificar:** `sudo -u mfb sqlite3 /var/lib/mfb/app.db "select email, status, role from users;"` lista a conta como `active` e `admin`.

## 5. HTTPS com Caddy

```bash
sudo cp /opt/mfb-interactive/app/deploy/Caddyfile /etc/caddy/Caddyfile   # já configurado para mfb-api.devital.com.br
sudo systemctl reload caddy
```

**Verificar:** `curl -s https://mfb-api.devital.com.br/api/health` devolve `{"ok":true}` (o primeiro acesso pode levar alguns segundos enquanto o certificado é emitido). Se falhar: `journalctl -u caddy -n 50` — quase sempre é DNS ainda não propagado ou porta 80/443 fechada.

## 6. Backup diário

```bash
sudo chmod +x /opt/mfb-interactive/app/deploy/backup.sh
echo "15 3 * * * /opt/mfb-interactive/app/deploy/backup.sh" | sudo crontab -u mfb -
sudo -u mfb /opt/mfb-interactive/app/deploy/backup.sh
```

**Verificar:** `ls /var/lib/mfb/backups/` mostra `app-AAAA-MM-DD.db`, e
`sqlite3 /var/lib/mfb/backups/app-*.db "select count(*) from users;"` responde sem erro.

Restaurar: `sudo systemctl stop mfb-api`, copiar o backup para `/var/lib/mfb/app.db` (dono `mfb`), `sudo systemctl start mfb-api`.

## 7. Front na Vercel

1. O `vercel.json` já repassa `/api/*` para `https://mfb-api.devital.com.br`. Se o domínio da API mudar, troque lá e no `deploy/Caddyfile` e faça commit/push (a deploy key da VPS é só leitura).
2. Na Vercel: *Add New Project* → importar `Loyola-Digital/mfb-interactive` → **Root Directory: raiz do repositório** (build e pasta de saída já vêm do `vercel.json`) → *Deploy*.
3. (Opcional) Configurar o domínio do app, por exemplo `app.seudominio.com.br`, em *Settings → Domains*.

**Verificar:**
1. Abrir o endereço da Vercel no celular → tela de login → entrar com a conta da etapa 4 → aparecem as boas-vindas e depois "Em qual apostila começar?".
2. Escolher uma apostila → aparecem as abas Exercícios, Provas e Teste de alinhamento.
3. Área dos pais → o cartão **Administração** aparece (a conta é admin). Gerar um link para um e-mail de teste, abrir o link numa janela anônima, criar a senha e confirmar que entra no app; depois cancelar ou deixar o link usado.
4. Em outro aparelho com a mesma conta, o progresso aparece igual.

## 8. Atualizar a versão

```bash
cd /opt/mfb-interactive/app
sudo -u mfb -H git pull && sudo -u mfb -H npm ci --omit=dev && sudo systemctl restart mfb-api
curl -s http://127.0.0.1:8787/api/health
```

A Vercel publica o front sozinha a cada push na branch principal. Ao iniciar, a API cria sozinha as tabelas e colunas novas (por exemplo, os papéis das contas e os links de acesso); não há migração manual, e as contas antigas viram papel família. Voltar versão da API: `sudo -u mfb git checkout <commit>` e reiniciar o serviço; versões antigas ignoram as colunas extras.

Se a instalação foi feita antes dos papéis (antes de 15/10/2026), depois de atualizar dê admin à conta do responsável: `sudo -u mfb node server/src/cli.ts admin <email>`.

## Checklist final (entregar ao humano)

- [ ] `https://api.<domínio>/api/health` responde `{"ok":true}`
- [ ] `systemctl is-enabled mfb-api caddy` → `enabled` nos dois; sobrevivem a `sudo reboot`
- [ ] Porta 8787 **não** acessível de fora (`curl http://<ip>:8787` falha)
- [ ] Primeira conta criada com papel admin e login funcionando pela URL da Vercel
- [ ] Backup do dia existe em `/var/lib/mfb/backups/`
- [ ] Nenhuma senha, chave ou token foi escrito no repositório

---

## Prompt pronto para a IA que vai instalar

Copie e cole para o agente (Claude Code, Codex etc.) que tem acesso SSH à VPS, trocando o que está entre `< >`:

```text
Você vai publicar a API do projeto "Mundo Meu Filho Bilíngue" numa VPS Ubuntu.

Acesso: ssh <usuario>@<ip-da-vps>  (o usuário tem sudo)
Repositório (privado): github.com/Loyola-Digital/mfb-interactive
Domínio da API: mfb-api.devital.com.br  (DNS A já aponta para a VPS)
E-mail da primeira conta (vai ser admin): <seu@email.com>

Siga EXATAMENTE o arquivo DEPLOY.md do repositório, etapas 0 a 6, na ordem.
Leia o DEPLOY.md primeiro: se ainda não tiver acesso ao repositório, peça que eu cole o conteúdo dele.

Regras:
- Rode a verificação de cada etapa e só avance se ela passar. Se falhar, mostre o erro e o log e pare.
- Na etapa 2, me mostre a chave pública da deploy key e ESPERE eu confirmar que cadastrei no GitHub.
- Na etapa 4, gere a senha (Enter no prompt) e me entregue apenas no final, uma única vez.
- Não abra a porta 8787 no firewall, não desative o HTTPS e não altere o código do repositório.
- Não escreva senhas, chaves privadas ou tokens em arquivos, commits ou no histórico do shell.
- No fim, me entregue o checklist final do DEPLOY.md preenchido.

A etapa 7 (Vercel) eu faço depois; só me lembre de trocar o domínio no vercel.json.
```
