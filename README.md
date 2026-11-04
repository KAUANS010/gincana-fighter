# Gincana Fighter

Jogo de luta 2D feito para as disciplinas **Análise e Projeto de Sistemas (APS)** e **Desenvolvimento Web 2 (DW2)**.
Escolha um guerreiro, enfrente um rival controlado pelo computador, ataque (`A`), defenda (`S`) e use o especial (`D`).
Quem fizer login pode registrar o recorde no ranking compartilhado.


## Tecnologias

React 19 + Vite, React Router, Supabase (Auth e Postgres com RLS), Context API e Zod.

## Como instalar e executar

Pré-requisito: Node.js 20 ou superior.

```bash
npm install
cp .env.example .env     # depois preencha o .env (veja abaixo)
npm run dev              # http://localhost:5173
```

Outros comandos: `npm run build` (gera `dist/`) e `npm run preview`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os dados do seu projeto Supabase
(*Project Settings → API*):

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Chave pública `anon`/publishable |

Use **somente** a chave pública. Nunca coloque a `service_role` no código nem no `.env` do front-end.
O arquivo `.env` está no `.gitignore`.

## Preparar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor**, cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e execute.
   O script cria a tabela `ranking`, ativa o RLS e cria as políticas:
   - **SELECT:** público (o ranking pode ser consultado sem login).
   - **INSERT / UPDATE:** só o usuário autenticado e só no próprio registro (`auth.uid() = user_id`).
   - Não há política de DELETE.
   - Um *trigger* impede que o recorde diminua, mesmo se a API for chamada diretamente.
3. Em *Authentication → Providers → Email*, deixe o provedor de e-mail habilitado.
   Para demonstrações, desative **Confirm email** (senão cada cadastro exige clicar no link do e-mail).
4. Em *Authentication → URL Configuration*, coloque a URL publicada em **Site URL**.

## Como funciona

- **Rotas:** `/` menu, `/como-jogar`, `/selecao`, `/batalha`, `/resultado`, `/ranking`, `/login`, `/cadastro`,
  `/conta` (protegida) e `*` (página não encontrada).
- **Jogar sem conta:** menu, instruções, ranking e partidas são públicos. Para registrar a pontuação é preciso
  estar autenticado; ao terminar sem sessão, a pontuação fica pendente **só em memória** (Context API) enquanto a
  pessoa entra ou se cadastra, e é gravada em seguida.
- **Recorde:** um registro por jogador. Pontuação maior atualiza; menor ou igual não altera.
- **Nome público:** o ranking mostra o nome de exibição escolhido no cadastro, nunca o e-mail.
- **Serviços:** todo acesso ao Supabase fica em `src/services/`.
- **Regras do jogo:** valores e fórmulas em `src/game/regras.js` (dano, energia, pontos, dificuldades).

## Imagens e animações dos personagens

Coloque os quadros em `src/assets/sprites/<personagem>/<animacao>/` (ex.: `boto/attack/1.png`).
O jogo detecta os arquivos sozinho. Detalhes em [`src/assets/sprites/LEIA-ME.md`](src/assets/sprites/LEIA-ME.md).
Enquanto não houver imagens, aparece um boneco provisório.

## Estrutura

```
src/
  components/  Lutador, BarraStatus, Campo, RotaProtegida, PainelUsuario
  contexts/    AuthContext, PartidaContext (pontuação pendente), SomContext
  game/        personagens, regras, reducer da batalha, sprites
  hooks/       useBatalha, useForm
  pages/       telas (uma por rota)
  schemas/     validações Zod
  services/    supabaseClient, authService, rankingService
supabase/schema.sql
```

## Publicação (Vercel)

Importe o repositório na Vercel (preset Vite), cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em
*Environment Variables* e publique. O `vercel.json` já redireciona as rotas para o `index.html`.
Depois, escreva o endereço publicado no topo deste README.
