# Spec Delta

## Purpose

Define como a família acessa o piloto pelo navegador, o que vê ao entrar (boas-vindas e jardim) e as garantias transversais de silêncio, toque e layout que valem para todas as telas.

## ADDED Requirements

### Requirement: Experiência totalmente silenciosa
O app SHALL funcionar integralmente sem som. Nenhum recurso SHALL carregar ou reproduzir áudio, e o app MUST NOT pedir acesso ao microfone, câmera ou localização. O único dado pessoal solicitado SHALL ser o e-mail do responsável, no login (ver `account-access`); nenhum dado da criança é pedido.

#### Scenario: Nenhum áudio carregado
- **WHEN** o fluxo completo da M03 é executado do início ao fim
- **THEN** nenhuma requisição de arquivo de áudio é feita e nenhum elemento de áudio ou vídeo com som existe na página

#### Scenario: Nenhuma permissão solicitada
- **WHEN** o app é aberto pela primeira vez em Chrome Android ou Safari iOS e o fluxo da M03 é percorrido
- **THEN** o navegador não exibe nenhum pedido de permissão

### Requirement: Boas-vindas ao responsável
No primeiro acesso de cada conta, depois do login, o app SHALL mostrar uma tela para o adulto explicando que ele acompanha a criança, que o app não tem som e que o progresso fica salvo na conta, com um botão "COMEÇAR" que leva ao jardim.

#### Scenario: Primeiro acesso da conta
- **WHEN** uma conta que nunca passou pelas boas-vindas faz login
- **THEN** a tela de boas-vindas aparece antes do jardim

#### Scenario: Retorno
- **WHEN** uma conta que já passou pelas boas-vindas abre o app, em qualquer aparelho
- **THEN** o jardim aparece diretamente, com o progresso da conta e a próxima missão ainda não concluída destacada como sugestão

### Requirement: Jardim com seis pontos de missão
O jardim SHALL mostrar seis pontos ilustrados, um por missão (M01 a M06), na ordem sugerida, sem bloqueio por desempenho. Missões ainda não implementadas SHALL aparecer como "em breve" e não abrir jogo. Cada ponto SHALL indicar visualmente, sem depender só de cor, se a missão foi concluída.

#### Scenario: Abrir a M03
- **WHEN** o usuário toca no ponto da M03
- **THEN** abre a preparação do adulto da M03

#### Scenario: Missão ainda não disponível
- **WHEN** o usuário toca no ponto de uma missão marcada "em breve"
- **THEN** nenhuma missão é iniciada, nenhum progresso é registrado e o ponto indica que ainda não está disponível

#### Scenario: Marca de concluída
- **WHEN** a M03 já foi concluída
- **THEN** o ponto da M03 mostra uma marca de concluída com forma ou ícone, além de cor

### Requirement: Toque e layout para crianças
Toda ação SHALL funcionar por toque ou clique, sem arrastar e sem depender de passar o cursor. Alvos essenciais SHALL ter pelo menos 56 × 56 px CSS. O layout SHALL funcionar em orientação vertical a partir de 360 px de largura, sem rolagem horizontal e sem sobrepor controles, e se adaptar a tablet e computador. Controles exclusivos do adulto SHALL ficar fora da área principal de interação da criança.

#### Scenario: Tela estreita
- **WHEN** qualquer tela é exibida com 360 px de largura
- **THEN** todos os controles ficam visíveis, tocáveis e sem rolagem horizontal

#### Scenario: Tamanho dos alvos
- **WHEN** qualquer alvo essencial (tinta, desenho, botões de ajuda e saída, pontos do jardim) é medido
- **THEN** sua área tocável tem pelo menos 56 × 56 px CSS

### Requirement: Movimento reduzido
Quando o dispositivo indicar preferência por movimento reduzido, o app SHALL reduzir as animações mantendo demonstrações e feedback compreensíveis.

#### Scenario: Preferência ativa
- **WHEN** o dispositivo tem `prefers-reduced-motion: reduce`
- **THEN** transições decorativas são removidas e a demonstração continua indicando alvo e gesto de forma estática ou com movimento mínimo

### Requirement: Erro de carregamento recuperável
Se o conteúdo ou as imagens de uma tela falharem ao carregar, o app SHALL mostrar ao adulto uma mensagem com opção de tentar novamente, sem ficar em tela vazia.

#### Scenario: Falha ao carregar conteúdo
- **WHEN** o arquivo de conteúdo das missões não carrega
- **THEN** aparece uma mensagem para o adulto com o botão "TENTAR DE NOVO", e tocar nele refaz o carregamento

#### Scenario: Servidor fora do ar na abertura
- **WHEN** o app abre com sessão ativa, o conteúdo carrega mas o servidor não responde
- **THEN** o jardim abre com o último progresso conhecido neste aparelho e o aviso de progresso não sincronizado, sem tela vazia
