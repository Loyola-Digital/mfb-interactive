# Spec Delta

## Purpose

Restringe o app às famílias liberadas pela equipe, com login por e-mail e senha, sessão mantida no aparelho e gestão de contas feita pela equipe no servidor.

## ADDED Requirements

### Requirement: Acesso só com login
Todas as telas do app, exceto a de login, SHALL exigir uma sessão válida. Sem sessão, o app SHALL mostrar a tela de login. A API de progresso MUST rejeitar requisições sem sessão válida.

#### Scenario: Abrir sem sessão
- **WHEN** alguém abre o app sem ter feito login neste aparelho
- **THEN** aparece a tela de login e nenhuma outra tela é acessível

#### Scenario: API sem sessão
- **WHEN** uma requisição de progresso chega sem sessão válida
- **THEN** o servidor responde como não autorizado e não lê nem grava progresso

### Requirement: Login com e-mail e senha
A tela de login SHALL pedir e-mail e senha, com o botão "ENTRAR". O e-mail SHALL ser comparado sem diferenciar maiúsculas e minúsculas e sem espaços nas pontas. Credenciais erradas, e-mail inexistente ou conta desativada SHALL mostrar a mesma mensagem genérica, sem revelar qual informação está errada. A tela MUST NOT oferecer cadastro; SHALL orientar a falar com a equipe quem ainda não tem acesso.

#### Scenario: Login correto
- **WHEN** o adulto informa o e-mail e a senha de uma conta ativa
- **THEN** entra no app (boas-vindas no primeiro acesso da conta, jardim nos seguintes)

#### Scenario: Senha errada
- **WHEN** o adulto informa uma senha errada
- **THEN** aparece a mensagem genérica de e-mail ou senha inválidos e os campos continuam preenchíveis

#### Scenario: E-mail com maiúsculas
- **WHEN** a conta foi criada como `ana@exemplo.com` e o adulto digita ` Ana@Exemplo.com `
- **THEN** o login é aceito com a senha correta

### Requirement: Limite de tentativas
O servidor SHALL limitar tentativas de login falhas por e-mail e por endereço de rede. Ao exceder o limite, novas tentativas SHALL ser recusadas por um período, com mensagem pedindo para aguardar.

#### Scenario: Muitas tentativas erradas
- **WHEN** ocorrem 5 tentativas falhas para o mesmo e-mail em 15 minutos
- **THEN** a sexta tentativa é recusada mesmo com a senha certa, até o período acabar

### Requirement: Sessão no aparelho
Após o login, a sessão SHALL permanecer ativa no aparelho entre recarregamentos e reaberturas até o adulto sair da conta, a sessão expirar por inatividade prolongada ou a conta ser desativada. O identificador de sessão MUST NOT ficar acessível ao JavaScript da página.

#### Scenario: Reabrir o app
- **WHEN** o adulto fez login ontem e reabre o app hoje no mesmo aparelho
- **THEN** o jardim abre sem pedir login

#### Scenario: Conta desativada
- **WHEN** a equipe desativa uma conta com sessão aberta
- **THEN** a próxima comunicação com o servidor encerra a sessão e o app volta para a tela de login

### Requirement: Sair da conta
O adulto SHALL poder sair da conta. Sair SHALL invalidar a sessão no servidor e levar à tela de login.

#### Scenario: Sair
- **WHEN** o adulto toca em "SAIR DA CONTA" e confirma
- **THEN** a sessão é encerrada no servidor e aparece a tela de login

### Requirement: Senhas protegidas
Senhas MUST ser guardadas apenas como hash com sal, nunca em texto puro, e MUST ter pelo menos 8 caracteres.

#### Scenario: Banco inspecionado
- **WHEN** o banco de dados é lido diretamente
- **THEN** nenhuma senha aparece em texto puro

### Requirement: Contas geridas pela equipe
A equipe SHALL poder, por comando no servidor, criar uma conta com e-mail e senha, redefinir a senha de uma conta e desativar uma conta. Não SHALL existir tela de cadastro nem de recuperação de senha nesta versão. Criar conta com e-mail já existente SHALL falhar com mensagem clara.

#### Scenario: Criar conta
- **WHEN** a equipe roda o comando de criar conta com um e-mail novo
- **THEN** a conta passa a conseguir fazer login com a senha definida

#### Scenario: Redefinir senha
- **WHEN** a equipe redefine a senha de uma conta
- **THEN** a senha antiga deixa de funcionar e as sessões abertas dessa conta são encerradas

#### Scenario: E-mail duplicado
- **WHEN** a equipe tenta criar uma conta com e-mail já cadastrado
- **THEN** o comando falha sem alterar a conta existente
