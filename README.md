# Gincana Fighter

Este projeto é um jogo de luta em formato de gincana, inspirado no folclore brasileiro. É possível jogar sem criar uma conta; o cadastro e o login permitem salvar pontuações e consultar o ranking no Supabase.

## Requisitos

- Node.js 20.19 ou superior (ou 22.12 ou superior)
- npm
- Git

## Como executar

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone https://github.com/KAUANS010/gincana-fighter.git
   cd gincana-fighter
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor local:

   ```bash
   npm run dev
   ```

4. Abra no navegador o endereço exibido no terminal. Por padrão, é `http://localhost:5173`.

Para encerrar o servidor, volte ao terminal e pressione `Ctrl+C`.

## Configuração do Supabase

O jogo também pode ser executado sem configurar o Supabase. Nesse caso, cadastro, login e ranking usam dados de demonstração guardados apenas na memória do navegador. Esses dados não são compartilhados nem permanecem salvos depois que a aplicação é reiniciada.

### Usar o mesmo ranking em vários computadores

O projeto Supabase deve ser criado e configurado uma única vez. Para compartilhar o ranking, todos os computadores precisam usar as credenciais desse mesmo projeto.

1. Quem administra o jogo cria ou seleciona o projeto Supabase que será compartilhado.
2. No painel desse projeto, abre o SQL Editor, copia o conteúdo de [`sql/ranking.sql`](./sql/ranking.sql) e executa o script uma única vez.
3. Em cada computador, clone o repositório, instale as dependências e crie na raiz um arquivo `.env` com as credenciais públicas do projeto compartilhado:

   ```env
   VITE_SUPABASE_URL=https://jdufpnoazkmxapgeqsmr.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_1mrejiVMMm0FwR9Xv9bwPg_4KqEJAoC
   ```

   Esses valores apontam para o mesmo projeto Supabase usado pelo jogo. Não é necessário criar outro projeto nem executar o script SQL novamente nos demais computadores. O arquivo `.env` é local e não deve ser enviado ao Git.
4. Se o projeto exigir confirmação de e-mail para novos cadastros, confirme o endereço recebido antes de fazer login.
5. Inicie o jogo com `npm run dev`. Se o servidor já estiver rodando, pare-o (`Ctrl+C`) e inicie novamente para carregar as variáveis.

Se cada pessoa configurar um projeto Supabase diferente, as contas e pontuações ficarão separadas. Para apenas testar o jogo, não é necessário configurar credenciais; a aplicação inicia em modo de demonstração.

A chave `anon`/`publishable` é destinada ao uso no cliente. Nunca coloque no arquivo `.env` nem compartilhe a chave secreta `service_role` ou outra chave administrativa: ela concede acesso privilegiado ao banco. As políticas de segurança do script SQL devem permanecer habilitadas.

## Comandos disponíveis

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # gera a versão de produção em dist/
npm run preview  # abre localmente a versão gerada
npm run lint     # verifica problemas de lint
```

## Tecnologias

- React e React Router
- Vite
- Supabase Auth e Database
- Zod
