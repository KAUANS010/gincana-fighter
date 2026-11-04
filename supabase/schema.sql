-- Gincana Fighter: tabela do ranking, políticas de segurança (RLS) e trigger do recorde.
-- Rode este script inteiro no SQL Editor do Supabase (pode rodar de novo sem erro).

create table if not exists public.ranking (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 3 and 20),
  personagem   text not null check (personagem in ('Kael', 'Nyra', 'Zarek', 'Veyra')),
  pontuacao    integer not null check (pontuacao >= 0),
  updated_at   timestamptz not null default now()
);

create index if not exists ranking_pontuacao_idx on public.ranking (pontuacao desc, updated_at asc);

alter table public.ranking enable row level security;

-- Qualquer pessoa (inclusive sem login) pode consultar o ranking.
drop policy if exists "ranking_select_publico" on public.ranking;
create policy "ranking_select_publico"
  on public.ranking for select
  using (true);

-- Só o usuário autenticado cria o PRÓPRIO registro.
drop policy if exists "ranking_insert_proprio" on public.ranking;
create policy "ranking_insert_proprio"
  on public.ranking for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Só o dono atualiza o próprio registro.
drop policy if exists "ranking_update_proprio" on public.ranking;
create policy "ranking_update_proprio"
  on public.ranking for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Não há política de DELETE: ninguém apaga registros pelo navegador.

-- Proteção extra: o recorde nunca diminui, mesmo que alguém chame a API direto.
create or replace function public.manter_maior_recorde()
returns trigger
language plpgsql
as $$
begin
  if new.pontuacao <= old.pontuacao then
    return old; -- ignora a atualização
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_manter_maior_recorde on public.ranking;
create trigger trg_manter_maior_recorde
  before update on public.ranking
  for each row execute function public.manter_maior_recorde();
