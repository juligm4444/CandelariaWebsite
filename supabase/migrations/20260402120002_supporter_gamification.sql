-- Gamified supporter system: tiers, score, and progression support.

begin;

create table if not exists public.supporter_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_donated numeric(12,2) not null default 0,
  months_subscribed integer not null default 0,
  current_tier text not null default 'visitor' check (current_tier in ('visitor', 'supporter', 'bronze', 'silver', 'gold', 'core')),
  score numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.payments add column if not exists supporter_processed_at timestamptz;
alter table public.subscriptions add column if not exists supporter_processed_at timestamptz;

create or replace function public.supporter_amount_to_cop(p_amount numeric, p_currency text)
returns numeric
language sql
immutable
as $$
  select case
    when upper(coalesce(p_currency, 'COP')) = 'USD' then coalesce(p_amount, 0) * 4000
    else coalesce(p_amount, 0)
  end;
$$;

create or replace function public.compute_supporter_tier(p_score numeric)
returns text
language plpgsql
immutable
as $$
begin
  if coalesce(p_score, 0) >= 300000 then
    return 'core';
  elsif coalesce(p_score, 0) >= 150000 then
    return 'gold';
  elsif coalesce(p_score, 0) >= 60000 then
    return 'silver';
  elsif coalesce(p_score, 0) >= 20000 then
    return 'bronze';
  elsif coalesce(p_score, 0) > 0 then
    return 'supporter';
  end if;

  return 'visitor';
end;
$$;

create or replace function public.update_supporter_tier(p_user_id uuid)
returns public.supporter_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stats public.supporter_stats%rowtype;
  v_subscription_bonus constant numeric := 5000;
begin
  insert into public.supporter_stats (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
    into v_stats
  from public.supporter_stats
  where user_id = p_user_id
  for update;

  v_stats.score := coalesce(v_stats.total_donated, 0) + (coalesce(v_stats.months_subscribed, 0) * v_subscription_bonus);
  v_stats.current_tier := public.compute_supporter_tier(v_stats.score);
  v_stats.updated_at := now();

  update public.supporter_stats
  set
    score = v_stats.score,
    current_tier = v_stats.current_tier,
    updated_at = v_stats.updated_at
  where user_id = p_user_id;

  return v_stats;
end;
$$;

create or replace function public.process_approved_payment(p_payment_id bigint)
returns public.supporter_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_row public.supporter_stats%rowtype;
  v_amount_cop numeric;
begin
  select *
    into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'payment % not found', p_payment_id;
  end if;

  if v_payment.status <> 'succeeded' then
    raise exception 'payment % is not succeeded', p_payment_id;
  end if;

  if v_payment.supporter_processed_at is not null then
    return (
      select s from public.supporter_stats s where s.user_id = v_payment.user_id
    );
  end if;

  v_amount_cop := public.supporter_amount_to_cop(v_payment.amount, v_payment.currency);

  insert into public.supporter_stats (user_id, total_donated)
  values (v_payment.user_id, v_amount_cop)
  on conflict (user_id)
  do update set total_donated = public.supporter_stats.total_donated + excluded.total_donated;

  if v_payment.type = 'subscription' then
    update public.supporter_stats
    set months_subscribed = months_subscribed + 1,
        updated_at = now()
    where user_id = v_payment.user_id;
  end if;

  update public.payments
  set supporter_processed_at = now()
  where id = v_payment.id;

  v_row := public.update_supporter_tier(v_payment.user_id);
  return v_row;
end;
$$;

create or replace function public.process_subscription_renewal(p_subscription_id bigint)
returns public.supporter_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription public.subscriptions%rowtype;
  v_row public.supporter_stats%rowtype;
begin
  select *
    into v_subscription
  from public.subscriptions
  where id = p_subscription_id
  for update;

  if not found then
    raise exception 'subscription % not found', p_subscription_id;
  end if;

  if v_subscription.supporter_processed_at is not null then
    return (
      select s from public.supporter_stats s where s.user_id = v_subscription.user_id
    );
  end if;

  insert into public.supporter_stats (user_id, months_subscribed)
  values (v_subscription.user_id, 1)
  on conflict (user_id)
  do update set months_subscribed = public.supporter_stats.months_subscribed + 1;

  update public.subscriptions
  set supporter_processed_at = now()
  where id = v_subscription.id;

  v_row := public.update_supporter_tier(v_subscription.user_id);
  return v_row;
end;
$$;

create or replace function public.ensure_supporter_stats_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.supporter_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_insert_supporter_stats on public.profiles;
create trigger on_profile_insert_supporter_stats
after insert on public.profiles
for each row execute function public.ensure_supporter_stats_profile();

insert into public.supporter_stats (user_id)
select p.id
from public.profiles p
on conflict (user_id) do nothing;

alter table public.supporter_stats enable row level security;

drop policy if exists supporter_stats_owner_select on public.supporter_stats;
create policy supporter_stats_owner_select
on public.supporter_stats
for select
using (user_id = auth.uid());

drop policy if exists supporter_stats_owner_update on public.supporter_stats;
create policy supporter_stats_owner_update
on public.supporter_stats
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists supporter_stats_owner_insert on public.supporter_stats;
create policy supporter_stats_owner_insert
on public.supporter_stats
for insert
with check (user_id = auth.uid());

grant execute on function public.update_supporter_tier(uuid) to anon, authenticated, service_role;
grant execute on function public.process_approved_payment(bigint) to anon, authenticated, service_role;
grant execute on function public.process_subscription_renewal(bigint) to anon, authenticated, service_role;

commit;
