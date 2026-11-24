-- Cria tabela de ranking pública e segura.
create extension if not exists pgcrypto;

create table if not exists public.ranking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 2 and 30),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ranking enable row level security;

create policy "Ranking publico pode consultar"
on public.ranking
for select
using (true);

create policy "Usuário autenticado pode inserir seu próprio registro"
on public.ranking
for insert
with check (auth.uid() = user_id);

create policy "Usuário autenticado pode atualizar seu próprio registro"
on public.ranking
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger set_timestamp
before update on public.ranking
for each row
execute procedure moddatetime(updated_at);

create or replace function public.upsert_score(p_user_id uuid, p_display_name text, p_score integer)
returns public.ranking
language plpgsql
security definer
set search_path = public
as $$
declare
  current public.ranking;
begin
  select * into current
  from public.ranking
  where user_id = p_user_id;

  if current is null then
    insert into public.ranking (user_id, display_name, score)
    values (p_user_id, p_display_name, p_score)
    returning * into current;
    return current;
  end if;

  if p_score > current.score then
    update public.ranking
    set display_name = p_display_name,
        score = p_score,
        updated_at = now()
    where user_id = p_user_id
    returning * into current;
  end if;

  return current;
end;
$$;

-- Exemplo de consulta para montar o ranking:
-- select user_id, display_name, score from public.ranking order by score desc limit 10;
