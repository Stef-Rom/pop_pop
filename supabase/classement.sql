-- Classement en ligne de Pop Pop.
-- À coller une seule fois dans l'éditeur SQL de Supabase (SQL Editor > New query > Run).
-- Le script peut être relancé sans risque.

-- Une ligne par joueur et par mode : on ne garde que le meilleur score.
create table if not exists public.scores (
  player_id  uuid        not null,
  mode       text        not null check (mode in ('chrono', 'survie')),
  name       text        not null,
  score      integer     not null check (score >= 0),
  grp        text,
  updated_at timestamptz not null default now(),
  primary key (player_id, mode)
);

create index if not exists scores_rank_idx on public.scores (mode, score desc);
create index if not exists scores_grp_idx  on public.scores (grp, mode, score desc);

-- Aucun accès direct à la table : tout passe par les deux fonctions ci-dessous.
-- L'identifiant du joueur n'est ainsi jamais lisible par les autres.
alter table public.scores enable row level security;
revoke all on public.scores from anon, authenticated;

-- Enregistre un score. Le serveur ne garde que le meilleur et refuse les valeurs impossibles.
create or replace function public.submit_score(
  p_player uuid,
  p_name   text,
  p_mode   text,
  p_score  integer,
  p_grp    text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_grp  text := nullif(upper(btrim(coalesce(p_grp, ''))), '');
begin
  if p_player is null then
    raise exception 'joueur manquant';
  end if;
  if p_mode is null or p_mode not in ('chrono', 'survie') then
    raise exception 'mode invalide';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 14 or v_name ~ '[<>[:cntrl:]]' then
    raise exception 'pseudo invalide';
  end if;
  if p_score is null or p_score < 0
     or p_score > (case p_mode when 'chrono' then 3000 else 30000 end) then
    raise exception 'score invalide';
  end if;
  if v_grp is not null and v_grp !~ '^[A-Z0-9]{3,10}$' then
    raise exception 'code de groupe invalide';
  end if;

  insert into scores (player_id, mode, name, score, grp)
  values (p_player, p_mode, v_name, p_score, v_grp)
  on conflict (player_id, mode) do update
    set score = greatest(scores.score, excluded.score),
        updated_at = case when excluded.score > scores.score then now() else scores.updated_at end;

  -- Le pseudo et le groupe suivent le joueur sur ses deux modes.
  update scores set name = v_name, grp = v_grp where player_id = p_player;
end;
$$;

-- Renvoie le top 50 d'un mode (monde entier, ou un groupe), plus la ligne du joueur s'il est au-delà.
create or replace function public.get_leaderboard(
  p_mode   text,
  p_grp    text default null,
  p_player uuid default null
) returns table (pos bigint, name text, score integer, me boolean)
language sql
stable
security definer
set search_path = public
as $$
  with ranked as (
    select s.player_id, s.name, s.score,
           row_number() over (order by s.score desc, s.updated_at asc) as rk
    from scores s
    where s.mode = p_mode
      and (nullif(upper(btrim(coalesce(p_grp, ''))), '') is null
           or s.grp = upper(btrim(p_grp)))
  )
  select r.rk, r.name, r.score, (p_player is not null and r.player_id = p_player)
  from ranked r
  where r.rk <= 50 or (p_player is not null and r.player_id = p_player)
  order by r.rk;
$$;

revoke all on function public.submit_score(uuid, text, text, integer, text) from public;
revoke all on function public.get_leaderboard(text, text, uuid) from public;
grant execute on function public.submit_score(uuid, text, text, integer, text) to anon, authenticated;
grant execute on function public.get_leaderboard(text, text, uuid) to anon, authenticated;

-- Demande à l'API de prendre en compte les nouvelles fonctions tout de suite.
notify pgrst, 'reload schema';
