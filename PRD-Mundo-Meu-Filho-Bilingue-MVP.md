# PRD — Mundo Meu Filho Bilíngue

**Versão:** 0.1 — proposta para revisão  
**Data:** 29 de setembro de 2026  
**Produto:** jogos visuais de inglês e pré-alfabetização, acompanhados pelos pais  
**Público:** crianças de 3 a 5 anos  
**Restrição confirmada:** sem voz nesta versão  
**Premissa adicional do piloto:** experiência totalmente silenciosa, também sem música e efeitos sonoros  
**Nome:** provisório  
**Escopo proposto:** piloto funcional no navegador do celular, antes da expansão para um produto comercial completo.

**Documento complementar:** [Ideias e decisões do produto](C:/Users/Lucas/Documents/Codex/2026-09-29/hoje/outputs/Ideias-e-Decisoes-Mundo-Meu-Filho-Bilingue.md), com a visão ampliada, conceitos alternativos e histórico de escopo. As possibilidades registradas nesse caderno não entram automaticamente nesta versão do PRD.

## 1. Visão do produto

Transformar atividades do material da Fernanda Zapparoli em pequenas brincadeiras interativas. A criança ajuda um coelhinho a cuidar de um jardim enquanto explora caminhos, cores e quantidades. O responsável acompanha com orientações curtas em português e referências escritas em inglês.

A experiência tem três momentos: o adulto entende a proposta, a criança brinca e a família recebe uma sugestão simples para continuar fora da tela.

O piloto oferece contato visual com palavras em inglês e prática de habilidades presentes na apostila. Não exige leitura da criança e não avalia escuta, pronúncia, leitura independente ou fluência. Concluir uma atividade indica que ela foi realizada; não comprova aprendizagem do idioma.

## 2. Base pedagógica e limites da adaptação

Referência analisada: [Curious Ones — Stage 1, Teacher’s Book, Fernanda Zapparoli](https://drive.google.com/file/d/19afuGgz-jpd1WLgVN14pO_HkPYCKJIU1/view), disponível na pasta fornecida pelo usuário.

- **Páginas 5–6:** pré-alfabetização a partir dos 3 anos, brincadeira e respeito ao ritmo individual.
- **Páginas 10 e 12:** caminhos e traçados, incluindo animais e deslocamento até um destino.
- **Páginas 25–26:** associação de amarelo à banana e de verde ao sapo.
- **Páginas 54 e 56:** apresentação dos números um e dois e contagem oral de elementos.

O jardim, o personagem guia, as regras digitais e os textos de interface são propostas de adaptação. A Fernanda deverá validar objetivos, associações, sequência e vocabulário antes do piloto com famílias.

Há duas adaptações explícitas: os caminhos serão percorridos por toques, sem equivalência declarada com traçar no papel; a contagem será visual, sem reproduzir a atividade oral da apostila. O material impresso continua sendo uma atividade complementar.

## 3. Usuários e necessidades

| Usuário | Necessidade atendida |
|---|---|
| Criança de 3 a 5 anos | Entender a brincadeira por imagens e demonstrações, agir com facilidade e perceber o resultado de suas ações. |
| Pai, mãe ou responsável | Saber como acompanhar, entender o conteúdo em inglês e ajudar sem precisar operar o jogo pela criança. |
| Fernanda e equipe | Revisar a fidelidade das adaptações e reutilizar os mesmos tipos de jogo para novos conteúdos. |

**Situação principal:** responsável e criança usam juntos um celular ou tablet. A participação do adulto faz parte do produto. A fala espontânea da família pode acontecer fora do sistema, mas nenhum passo depende dela para funcionar.

## 4. Objetivos e sucesso do piloto

1. Entregar uma experiência completa, compreensível e agradável sem som.
2. Verificar se a criança consegue realizar as ações após uma demonstração visual, com acompanhamento do responsável.
3. Verificar se a orientação aos pais é clara e curta o suficiente para ser usada durante a brincadeira.
4. Validar três tipos de jogo reutilizáveis antes de ampliar o conteúdo.

**Hipóteses a testar:** a criança percebe o propósito das ações; o adulto consegue mediar a associação entre imagem e inglês; a família deseja repetir alguma atividade.

As metas abaixo são critérios propostos para decidir melhorias do piloto, não evidência de eficácia pedagógica:

- Observar cinco duplas de criança e responsável, procurando incluir idades diferentes entre 3 e 5 anos.
- Pelo menos quatro responsáveis conseguem iniciar a primeira atividade sem orientação da equipe.
- Pelo menos quatro crianças realizam uma ação de cada tipo de jogo depois da demonstração e com acompanhamento do adulto.
- Registrar pedidos espontâneos de repetição, pontos de confusão e intervenções do responsável.
- Corrigir qualquer falha recorrente que impeça jogar ou salvar o progresso.

## 5. Escopo da primeira versão

### Incluído

- Um cenário: jardim ilustrado.
- Um personagem guia: coelhinho, com poses estáticas e animações simples.
- Seis missões, construídas com três tipos de jogo.
- Navegação e todas as ações essenciais por toque; clique equivalente no computador.
- Demonstrações visuais, ajuda e feedback sem som.
- Orientações em português para o adulto e palavras-alvo em inglês associadas às imagens.
- Tela simples de acompanhamento dos pais.
- Progresso local de uma criança por navegador, sem cadastro.
- Possibilidade de repetir, interromper ou pular uma missão.
- Sugestão opcional de atividade fora da tela ao terminar.

### Fora desta versão

- Qualquer áudio, locução, música, efeito sonoro, gravação, microfone ou reconhecimento de fala.
- Chat com IA, diálogos abertos e conteúdo gerado durante a brincadeira.
- Desenho livre, avaliação de precisão de traçado e escrita de letras.
- Login, vários perfis, sincronização entre aparelhos, pagamentos e assinaturas.
- Painel de edição de conteúdo pela equipe e relatórios remotos.
- Publicação nas lojas de aplicativos e funcionamento offline garantido.
- Ranking, vidas, cronômetro, recompensas aleatórias, publicidade e compras dentro do jogo.

**Premissa de implementação:** acesso por um endereço no navegador. O piloto não depende de instalação. A publicação e o endereço de acesso serão definidos na etapa de implementação.

## 6. Jornada e telas

**Primeiro acesso:** boas-vindas ao responsável → explicação breve da experiência sem som → jardim → preparação da missão → brincadeira → resultado → próxima missão ou encerramento.

**Retorno:** jardim com progresso salvo → sugestão da próxima missão ainda não concluída → preparação resumida → brincadeira.

| Tela | Conteúdo e comportamento |
|---|---|
| Boas-vindas | Explica que o adulto acompanha, que o aplicativo não tem som e que o progresso fica neste navegador. Botão “Começar”. |
| Jardim | Seis pontos ilustrados, um por missão. Todas ficam acessíveis; a ordem é sugerida, sem bloqueios por desempenho. |
| Preparação do adulto | Objetivo em uma frase, palavra em inglês com significado em português e uma orientação de acompanhamento. Botão “Vamos brincar”. |
| Jogo | Uma ação principal por etapa, demonstração visual, ajuda, saída e personagem reagindo ao que acontece. |
| Resultado | Mostra a transformação no cenário e a palavra associada. Permite repetir, continuar ou encerrar. |
| Área dos pais | Mostra missões realizadas, conteúdos apresentados, ajuda acionada e etapas puladas. Explica os limites do salvamento local. |

As ações infantis usam ícones e imagens reconhecíveis. Textos podem complementar a tela, mas nunca são a única forma de descobrir o que fazer. Controles exclusivos do adulto ficam fora da área principal de interação da criança.

## 7. Catálogo inicial: seis missões

Todas as missões são curtas, sem limite de tempo. A duração será observada nos testes; não existe obrigação de concluir o conjunto em uma sessão.

| ID e missão | Ação da criança | Conteúdo visual em inglês | Condição de conclusão | Referência e adaptação |
|---|---|---|---|---|
| M01 — Vamos ao jardim | Tocar em três pontos grandes, em ordem, para conduzir o coelhinho por um caminho reto. | `rabbit`, associado ao personagem. | Coelho chega ao destino após os três toques. | Caminhos da p. 10; vocabulário da p. 54. |
| M02 — Passeio do coelhinho | Tocar em quatro pontos de um caminho curvo. O próximo ponto fica destacado. | Repetição de `rabbit`. | Coelho chega ao destino após os quatro toques. | Percursos das pp. 10 e 12, adaptados para toque. |
| M03 — O sapinho verde | Escolher entre duas tintas e tocar no sapo para preenchê-lo com verde. | `green`, junto à amostra e ao sapo pintado. | Tinta verde selecionada e aplicada ao sapo. | Cor e sapo da p. 26; pintura por preenchimento. |
| M04 — A banana amarela | Escolher entre três tintas e tocar na banana para preenchê-la com amarelo. | `yellow`, junto à amostra e à banana pintada. | Tinta amarela selecionada e aplicada à banana. | Cor e banana da p. 25; pintura por preenchimento. |
| M05 — Uma flor | Tocar em uma tulipa e depois no único espaço de plantio. | `one` e numeral `1`, junto à quantidade. | Um espaço preenchido por uma flor. | Número um da p. 54, adaptado do coelho para uma flor. |
| M06 — Duas flores | Repetir a ação de selecionar e plantar até preencher dois espaços. | `two` e numeral `2`, junto à quantidade. | Dois espaços distintos preenchidos, com uma flor em cada. | Tulipas e número dois da p. 56; contagem visual. |

Os modelos visuais permanecem disponíveis. As tintas e posições podem variar entre repetições para evitar uma sequência fixa de toques, mantendo a dificuldade prevista. Completar essas missões com pistas visuais não será apresentado como compreensão comprovada das palavras em inglês.

### Regras dos três tipos de jogo

**Caminhos:** só o próximo ponto faz avançar o personagem. Tocar em outra área não reinicia a rodada nem reduz progresso. Os pontos são grandes e o próximo destino é visível. Arrastar não é necessário.

**Cores:** selecionar uma tinta destaca sua amostra; tocar no desenho aplica a escolha. Uma cor diferente da proposta aparece como prévia reversível. O modelo permanece visível e a criança pode trocar a tinta sem reiniciar. Selecionar qualquer tinta é uma ação válida; somente aplicar uma cor diferente do modelo conta como tentativa inválida. Após duas aplicações diferentes do modelo, a ajuda demonstra a seleção e o preenchimento corretos.

**Quantidades:** selecionar uma flor e tocar em um espaço vazio planta uma unidade. Espaços preenchidos não recebem flores adicionais. O número de espaços torna o objetivo visível. Não há botão de confirmação textual nem exigência de ler o numeral. Cada toque aceito produz apenas uma ação, mesmo em toques rápidos repetidos.

## 8. Requisitos funcionais

| ID | Requisito | Critério de aceitação |
|---|---|---|
| RF01 | Funcionar integralmente sem som. | Nenhum recurso carrega ou reproduz áudio; o aplicativo não pede acesso ao microfone. |
| RF02 | Demonstrar cada interação. | Na primeira abertura da missão, uma mão ou marcador demonstra o gesto em um exemplo e devolve o controle à criança. |
| RF03 | Permitir repetir a ajuda. | O botão visual de ajuda repete a demonstração e nunca conclui a atividade automaticamente. |
| RF04 | Oferecer ajuda progressiva. | Duas tentativas inválidas consecutivas destacam o alvo correto e repetem o gesto. Um avanço válido zera esse contador. |
| RF05 | Tratar tentativas sem punição. | A criança pode tentar novamente sem perder conquistas, voltar ao início ou aguardar um bloqueio. |
| RF06 | Permitir acompanhamento adulto. | Toda missão tem objetivo em português, palavra-alvo com significado e uma instrução curta de como ajudar. |
| RF07 | Permitir interromper e pular. | Sair de uma missão incompleta mantém as conclusões anteriores. O responsável pode marcá-la como pulada, sem registrá-la como concluída. |
| RF08 | Preservar o progresso local. | Concluir salva imediatamente. Recarregar ou reabrir o mesmo navegador mantém conclusões quando o armazenamento está disponível. |
| RF09 | Permitir repetição livre. | Repetir uma missão concluída não apaga a conclusão anterior. Uma nova tentativa pode registrar ajuda e repetição separadamente. |
| RF10 | Apresentar acompanhamento descritivo. | A área dos pais usa “praticado”, “concluído”, “com ajuda” e “pulado”; não usa notas de inglês nem “palavras aprendidas”. |
| RF11 | Oferecer continuidade fora da tela. | Ao concluir, mostra uma sugestão opcional, como encontrar algo verde ou separar duas flores de brinquedo. Não é necessário confirmar execução. |
| RF12 | Tratar indisponibilidade de armazenamento. | O jogo continua e avisa o adulto que o progresso pode não permanecer após fechar a página. |

Tentativa inválida é uma ação sobre uma alternativa interativa que não atende à etapa atual. Tocar no fundo vazio não conta como erro. A ajuda registrada informa somente que o recurso foi acionado; o sistema não infere quando o adulto ajudou verbalmente ou realizou um gesto.

## 9. Direção de experiência e produção visual

- Estilo 2D acolhedor, com formas simples, pouco ruído e objetos bem separados.
- Um único conjunto visual para coelhinho, jardim, tintas e flores. As imagens serão geradas ou preparadas previamente com IA e revisadas para manter consistência.
- Usar texto da interface como texto real, separado das ilustrações, para evitar erros e permitir revisão.
- Planejar inicialmente três poses do coelho: esperando, caminhando e comemorando. Usar movimentos simples sobre essas poses.
- Cada tela apresenta uma decisão principal; efeitos decorativos não devem competir com o alvo.
- Alvos essenciais de pelo menos 56 × 56 pixels CSS. Caminhos usam pontos de pelo menos 64 × 64 pixels CSS.
- Priorizar orientação vertical, com funcionamento a partir de 360 pixels de largura. Adaptar a tablet e computador sem sobrepor controles.
- Toda interação precisa funcionar por toque ou clique, sem depender de passar o cursor sobre objetos.
- Feedback combina movimento, forma e mudança do cenário. Cor sozinha não comunica acerto, ajuda ou seleção.
- Reduzir animações quando essa preferência estiver ativa no dispositivo, mantendo as instruções compreensíveis.
- Encerrar cada missão com um resultado claro e opção visível de parar. Não reproduzir a próxima atividade automaticamente.

## 10. Conteúdo, dados e acompanhamento

### Estrutura de uma missão

Cada missão deve ter: identificador, versão, tipo de jogo, referência na apostila, objetivo, palavra-alvo, significado em português, orientação ao responsável, imagens, alternativas ou pontos, demonstração, regra de conclusão, regra de ajuda e sugestão fora da tela.

Os três tipos de jogo serão reutilizáveis: trocar conteúdo e imagens não deverá exigir construir um novo jogo. Nesta versão, a equipe ajusta um arquivo organizado de conteúdo; um painel administrativo fica para depois.

### Progresso local

- Uma criança por navegador, sem nome, foto, data de nascimento ou cadastro obrigatório.
- Guardar conclusões, missões puladas, contagem de repetições e uso da ajuda do aplicativo.
- Distinguir conclusão com ajuda de etapa pulada. Uma missão pode estar concluída e também ter registros posteriores de repetição com ajuda.
- Ao interromper uma missão incompleta, reiniciar apenas essa missão no próximo acesso. Não prometer retomada no mesmo ponto.
- O progresso é separado por navegador e dispositivo, no mesmo endereço do app. Limpar os dados, mudar de navegador, de aparelho ou de endereço pode remover ou não trazer o progresso. Explicar isso na área dos pais.
- Apagar o progresso exige uma ação explícita do responsável e confirmação. Não existe sincronização nem recuperação por conta no piloto.

### Observação do piloto

O acompanhamento local pode registrar início, conclusão, repetição, ajuda e salto de missão. Esses registros ficam no aparelho; não haverá envio automático de dados ou painel remoto nesta versão.

Nos testes, a equipe observa separadamente facilidade de uso, participação do adulto, interesse em repetir e relação da criança com o conteúdo. Conclusões sobre aprendizagem exigirão uma avaliação posterior desenhada com a Fernanda.

## 11. Critérios de entrega

O piloto estará pronto para ser experimentado por famílias quando:

1. As seis missões funcionarem do início ao fim, com revisão de conteúdo da Fernanda registrada.
2. Todas puderem ser concluídas apenas com toques, sem leitura infantil, som ou arrasto obrigatório.
3. Demonstração e ajuda não executarem a resposta definitiva pela criança.
4. Cores diferentes do modelo puderem ser corrigidas e toques repetidos não duplicarem flores ou avanços.
5. Repetir, sair ou pular não apagarem conclusões anteriores nem criarem conclusões falsas.
6. O progresso sobreviver a recarregamento no mesmo navegador quando o armazenamento estiver disponível.
7. A indisponibilidade de armazenamento for tratada sem bloquear a brincadeira.
8. Controles e alvos permanecerem visíveis e utilizáveis em telas de celular e tablet, incluindo largura de 360 pixels.
9. O fluxo completo for testado em pelo menos um Android com Chrome e um iPhone com Safari, além de computador para revisão.
10. Personagem, cenários, textos e palavras em inglês passarem por uma revisão visual e editorial.
11. Um erro de carregamento mostrar ao adulto uma opção de tentar novamente, sem ficar em tela vazia.
12. O app não solicitar cadastro, dados pessoais, microfone ou qualquer recurso fora do escopo.

## 12. Sequência de produção

| Etapa | Entrega concreta | Condição para seguir |
|---|---|---|
| 1. Validar o conteúdo | Seis fichas de missão, com objetivos, referências, palavras e instruções. | Fernanda aprova as adaptações para uma experiência sem áudio. |
| 2. Definir o visual | Coelhinho, jardim e uma tela representativa. | Revisão de consistência e legibilidade em tamanho de celular. |
| 3. Construir uma missão completa | M03: preparação, demonstração, escolha da tinta, pintura, ajuda, resultado e salvamento. | Fluxo funciona no celular e permite correção de tentativa. |
| 4. Completar os três tipos de jogo | Caminhos, cores e quantidades, preenchendo as seis missões. | Critérios funcionais e de entrega atendidos. |
| 5. Rodar o piloto | Observação de cinco famílias e lista priorizada de ajustes. | Corrigir os problemas recorrentes antes de ampliar o conteúdo. |

Não estimar prazo e custo definitivos antes da primeira missão completa: ela revelará o esforço real de ilustração, interação, revisão e acabamento.

## 13. Riscos de produto e próximos incrementos

| Risco observado no escopo | Como lidar no piloto |
|---|---|
| A criança resolver pelas imagens sem relacionar a atividade ao inglês. | Explicitar o papel do adulto, associar palavra e imagem e não usar conclusão como medida de domínio do idioma. |
| O adulto fazer tudo pela criança ou achar as instruções trabalhosas. | Orientações breves, demonstrações visuais e observação de quem executa cada ação. |
| As imagens produzidas por IA mudarem o personagem ou o estilo entre telas. | Aprovar um conjunto pequeno de referências e revisar todos os recursos antes de integrá-los. |
| Toques imprecisos gerarem frustração. | Alvos grandes, poucas opções, ausência de punição e testes nos aparelhos reais. |

Após o piloto, avaliar primeiro novas missões com os mesmos tipos de jogo. Formas, comparação visual e letras podem entrar depois de revisão pedagógica. Vários perfis, conta familiar, sincronização e edição de conteúdo só serão priorizados conforme a necessidade observada.

Áudio permanece fora do escopo e só será considerado mediante uma nova decisão do produto.

## 14. Decisões assumidas neste PRD

**Confirmado pelo usuário:** público de 3 a 5 anos, participação dos pais, uso do material da Fernanda e ausência de voz nesta fase.

**Proposto para tornar o piloto viável:** um jardim, um coelhinho, seis missões, três tipos de jogo, acesso pelo navegador, todas as ações por toque, um progresso local por navegador e dispositivo no mesmo endereço do app e ausência de cadastro.

**A validar antes do teste com famílias:** vocabulário, mediação dos pais, adaptações das atividades, direção visual e nome do produto.
