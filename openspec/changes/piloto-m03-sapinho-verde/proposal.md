# Proposal

## Why

O PRD do Mundo Meu Filho Bilíngue (`PRD-Mundo-Meu-Filho-Bilingue-MVP.md`, seção 12, etapa 3) manda construir uma missão completa, a M03 "O sapinho verde", antes de multiplicar conteúdo: ela revela o esforço real de ilustração, interação e acabamento e valida no celular o fluxo inteiro (preparação do adulto → demonstração → brincadeira → ajuda → resultado → salvamento). Hoje o repositório só tem o design system; não existe app.

Além disso, o acesso precisa ficar restrito às famílias liberadas pela equipe e o progresso precisa acompanhar a família entre aparelhos, o que exige login e um back-end desde a primeira versão.

## What Changes

- Criar o app web do piloto (front na Vercel, acesso pelo navegador, sem instalação), totalmente silencioso: nenhum áudio, nenhum pedido de microfone, câmera ou localização.
- **Login com e-mail e senha.** As contas são criadas pela equipe por comando no servidor; não há cadastro aberto. Decisão do usuário em 29/09/2026 que substitui as premissas do PRD de "sem cadastro" e "progresso local por navegador" (PRD, seções 5 e 10).
- **Back-end próprio** (Node + Hono + SQLite) numa VPS, com autenticação e progresso por conta.
- Tela de boas-vindas para o responsável no primeiro acesso da conta, explicando acompanhamento e ausência de som.
- Jardim com os seis pontos de missão; nesta mudança só a M03 é jogável, as outras aparecem como "em breve" sem bloquear nada.
- Fluxo genérico de missão: cartão de preparação do adulto, jogo, resultado com palavra-alvo, repetir/continuar/encerrar, sair e pular, sugestão opcional fora da tela.
- Motor do jogo de **Cores** reutilizável (escolher tinta, aplicar no desenho, prévia reversível, ajuda progressiva após duas aplicações erradas, demonstração inicial) e a missão M03 configurada por arquivo de conteúdo.
- Progresso de uma criança por conta, salvo no servidor (concluído, com ajuda, pulado, repetições), que continua funcionando sem internet e sincroniza depois.
- Área dos pais mínima: missões praticadas/concluídas/com ajuda/puladas, e-mail da conta, sair da conta, apagar progresso com confirmação.
- Personagem guia: coelhinho (decisão do usuário, prevalece sobre a regra de mascotes do design system, que passa a valer só para a interface). Arte do coelho e do jardim gerada com IA (Magnific) e revisada; até lá, ilustrações provisórias.

**Fora desta mudança (fase 2):** trocar a criação manual de contas por um fluxo em que a família informa o e-mail, o sistema valida se é aluno e então ela define a senha. Recuperação de senha pela própria família também fica para depois.

## Capabilities

### New Capabilities
- `app-shell`: acesso pelo navegador, experiência silenciosa, boas-vindas, jardim com os seis pontos, erro de carregamento, requisitos de toque e layout (360px, alvos grandes, movimento reduzido).
- `account-access`: login com e-mail e senha, sessão no aparelho, sair da conta e gestão de contas pela equipe.
- `mission-flow`: ciclo de vida comum a qualquer missão — preparação do adulto, demonstração, ajuda, resultado, repetir/sair/pular e sugestão fora da tela.
- `color-game`: regras do jogo de Cores e a missão M03 "O sapinho verde".
- `progress`: registro de conclusões, ajuda, pulos e repetições por conta no servidor, com funcionamento sem internet e sincronização.
- `parent-area`: tela de acompanhamento descritivo para o responsável, sair da conta e apagamento do progresso.

### Modified Capabilities
<!-- Nenhuma: projeto novo, sem specs existentes. -->

## Impact

- Código novo no repositório: front (`web/`), back-end (`server/`) e código compartilhado (`shared/`); o `design-system/` é consumido como está.
- Infraestrutura: projeto na Vercel para o front e uma VPS com Node, HTTPS e backup diário do banco SQLite.
- Dados pessoais: passa a existir o e-mail do responsável e uma senha (guardada só como hash). Nenhum dado da criança além do progresso nas missões.
- Produção de arte com Magnific (créditos da conta) para o coelho em três poses e o jardim.
- Conteúdo da M03 (objetivo, palavra `green`, orientação ao adulto, sugestão fora da tela) é proposta e precisa de aprovação da Fernanda antes do teste com famílias.
