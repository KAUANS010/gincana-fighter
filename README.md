# Gincana Fighter

Gincana Fighter é um jogo web em React inspirado em combates arcade com temática de folclore brasileiro e gincana escolar. A aplicação mantém a navegação em páginas separadas, permite jogar sem login, exibe ranking público e salva pontuações no Supabase quando o jogador está autenticado.

## Tecnologias

- React
- React Router
- Context API
- Zod
- Supabase Auth e Database
- Vite

## Instalação

1. Clone este repositório.
2. Acesse a pasta do projeto.
3. Instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` com base no exemplo abaixo:

```bash
cp .env.example .env
```

O conteúdo esperado é:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Essas variáveis são lidas no navegador e não devem conter segredos administrativos.

## Executando a aplicação

```bash
npm run dev
```

A aplicação poderá ser acessada em `http://localhost:5173`.

## Preparando o Supabase

1. Crie um projeto no Supabase.
2. Ative a autenticação por e-mail e senha.
3. Acesse o SQL editor e execute o arquivo:

```sql
-- SQL em: sql/ranking.sql
```

4. Certifique-se de que a tabela `public.ranking` e as políticas RLS foram criadas.
5. Use a URL do projeto e a `anon` key para preencher o `.env`.

## SQL para ranking e políticas

O script disponível em `sql/ranking.sql` cria:

- Tabela `public.ranking`
- Política pública de leitura
- Política de gravação vinculada ao usuário autenticado
- Função `public.upsert_score`

## Funcionalidades principais

- Menu e navegação por rotas
- Jogo com pontuação em tempo real
- Ranking público
- Cadastro e login com Zod
- Sessão compartilhada em Context API
- Pontuação pendente durante fluxo de login/cadastro
- Página protegida para demonstrar a sessão autenticada

## Publicação

Aplicação de demonstração disponível em:

- Em desenvolvimento: configure o deploy em Vercel ou Netlify e informe a URL no README.

