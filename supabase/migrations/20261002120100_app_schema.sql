-- ============================================================================
-- Application schema.
--
-- The seven areas are static content (content/areas.ts), so there is no
-- `teams` table: an area key is a checked string, which removes a join from
-- every public page and makes an invalid area a constraint violation rather
-- than a dangling foreign key.
--
-- Same RLS posture as the auth migration: enabled with no policy, access only
-- through the owner connection used by the server.
-- ============================================================================

begin;

create extension if not exists "pgcrypto";

-- Reused by every area column so an invalid key cannot be written.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'area_key') then
    create domain area_key as text
      check (value in ('comite', 'rrhh', 'diseno', 'chasis', 'celdas', 'logistica', 'baterias'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Publications
-- ---------------------------------------------------------------------------
create table if not exists publications (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  area_key     area_key    not null,
  author_id    text        references "user" ("id") on delete set null,
  title_es     text        not null check (length(trim(title_es)) between 1 and 300),
  title_en     text        not null check (length(trim(title_en)) between 1 and 300),
  abstract_es  text        not null check (length(abstract_es) between 1 and 20000),
  abstract_en  text        not null check (length(abstract_en) between 1 and 20000),
  cover_path   text,
  pdf_path     text,
  published_at date        not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists publications_published_idx on publications (published_at desc, id desc);
create index if not exists publications_area_idx on publications (area_key, published_at desc);
create index if not exists publications_author_idx on publications (author_id);

-- ---------------------------------------------------------------------------
-- Internal invitations. The only route into an internal account: a lead adds
-- the address here, and sign-up reads it. Nothing in the browser can write it.
-- ---------------------------------------------------------------------------
create table if not exists area_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  area_key    area_key    not null,
  role        text        not null default 'member'
                check (role in ('leader', 'coleader', 'member')),
  invited_by  text        references "user" ("id") on delete set null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

create unique index if not exists area_invites_email_idx on area_invites (lower(email));

-- One active lead and one active co-lead per area, enforced in the database so
-- a race between two concurrent transfers cannot produce two leads.
create unique index if not exists user_one_active_leader_per_area
  on "user" ("areaKey")
  where "internalRole" = 'leader' and "isActive" and "isInternal";

create unique index if not exists user_one_active_coleader_per_area
  on "user" ("areaKey")
  where "internalRole" = 'coleader' and "isActive" and "isInternal";

-- ---------------------------------------------------------------------------
-- Money. Amounts are integers in minor units, never floating point.
-- ---------------------------------------------------------------------------
create table if not exists contributions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text        references "user" ("id") on delete set null,
  kind               text        not null check (kind in ('subscription')),
  amount             bigint      not null check (amount > 0),
  currency           text        not null default 'COP' check (currency ~ '^[A-Z]{3}$'),
  status             text        not null default 'pending'
                       check (status in ('pending', 'succeeded', 'failed', 'refunded', 'canceled')),
  reference          text        not null unique,
  polar_checkout_id  text unique,
  polar_order_id     text unique,
  description        text,
  metadata           jsonb       not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists contributions_user_idx on contributions (user_id, created_at desc);
create index if not exists contributions_status_idx on contributions (status, created_at desc);

create table if not exists memberships (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text        not null references "user" ("id") on delete cascade,
  tier_id               text        not null check (tier_id in ('cobre', 'aluminio', 'titanio')),
  status                text        not null
                          check (status in ('active', 'canceled', 'past_due', 'incomplete')),
  polar_subscription_id text        not null unique,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists memberships_user_idx on memberships (user_id, created_at desc);
create unique index if not exists memberships_one_active_per_user
  on memberships (user_id) where status = 'active';

-- ---------------------------------------------------------------------------
-- Supporter progression. Derived state, recomputed by trigger so a webhook
-- replay cannot double-count.
-- ---------------------------------------------------------------------------
create table if not exists supporter_stats (
  user_id           text primary key references "user" ("id") on delete cascade,
  total_contributed bigint      not null default 0,
  months_subscribed integer     not null default 0,
  score             bigint      not null default 0,
  tier              text        not null default 'visitor'
                      check (tier in ('visitor', 'supporter', 'bronze', 'silver', 'gold', 'core')),
  updated_at        timestamptz not null default now()
);

create or replace function compute_supporter_tier(p_score bigint)
returns text
language sql
immutable
as $$
  select case
    when p_score >= 30000000 then 'core'
    when p_score >= 15000000 then 'gold'
    when p_score >=  6000000 then 'silver'
    when p_score >=  2000000 then 'bronze'
    when p_score >        0  then 'supporter'
    else 'visitor'
  end;
$$;

-- A month of membership is worth 5.000 COP of progression, i.e. 500000 minor
-- units. Recurring support is what the budget actually needs.
create or replace function refresh_supporter_stats(p_user_id text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total  bigint;
  v_months integer;
  v_score  bigint;
begin
  if p_user_id is null then
    return;
  end if;

  select coalesce(sum(amount), 0)
    into v_total
    from contributions
   where user_id = p_user_id
     and status = 'succeeded';

  select coalesce(
           sum(greatest(0, (date_part('year', age(now(), created_at)) * 12
                            + date_part('month', age(now(), created_at)))::integer)),
           0)
    into v_months
    from memberships
   where user_id = p_user_id
     and status in ('active', 'canceled', 'past_due');

  v_score := v_total + (v_months::bigint * 500000);

  insert into supporter_stats (user_id, total_contributed, months_subscribed, score, tier, updated_at)
  values (p_user_id, v_total, v_months, v_score, compute_supporter_tier(v_score), now())
  on conflict (user_id) do update
     set total_contributed = excluded.total_contributed,
         months_subscribed = excluded.months_subscribed,
         score             = excluded.score,
         tier              = excluded.tier,
         updated_at        = now();
end;
$$;

create or replace function trg_refresh_supporter_stats()
returns trigger
language plpgsql
as $$
begin
  perform refresh_supporter_stats(coalesce(new.user_id, old.user_id));
  return null;
end;
$$;

drop trigger if exists contributions_supporter_sync on contributions;
create trigger contributions_supporter_sync
  after insert or update or delete on contributions
  for each row execute function trg_refresh_supporter_stats();

drop trigger if exists memberships_supporter_sync on memberships;
create trigger memberships_supporter_sync
  after insert or update or delete on memberships
  for each row execute function trg_refresh_supporter_stats();

-- ---------------------------------------------------------------------------
-- Webhook replay protection. The provider event id is the primary key, so a
-- duplicate delivery is a constraint violation instead of a double charge.
-- ---------------------------------------------------------------------------
create table if not exists payment_webhook_events (
  provider_event_id text primary key,
  event_type        text        not null,
  payload_digest    text        not null,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz
);

create index if not exists webhook_events_received_idx on payment_webhook_events (received_at desc);

-- ---------------------------------------------------------------------------
-- Audit trail for sensitive actions: role changes, revocations, payments.
-- ---------------------------------------------------------------------------
create table if not exists audit_log (
  id         bigserial primary key,
  actor_id   text        references "user" ("id") on delete set null,
  action     text        not null,
  target     text,
  severity   text        not null default 'info'
               check (severity in ('info', 'warning', 'critical')),
  ip_address inet,
  details    jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_action_idx on audit_log (action, created_at desc);
create index if not exists audit_log_actor_idx on audit_log (actor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists publications_touch on publications;
create trigger publications_touch before update on publications
  for each row execute function touch_updated_at();

drop trigger if exists contributions_touch on contributions;
create trigger contributions_touch before update on contributions
  for each row execute function touch_updated_at();

drop trigger if exists memberships_touch on memberships;
create trigger memberships_touch before update on memberships
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- Lock down
-- ---------------------------------------------------------------------------
alter table publications           enable row level security;
alter table area_invites           enable row level security;
alter table contributions          enable row level security;
alter table memberships            enable row level security;
alter table supporter_stats        enable row level security;
alter table payment_webhook_events enable row level security;
alter table audit_log              enable row level security;

do $$
declare
  r text;
begin
  for r in select unnest(array['anon', 'authenticated', 'service_role']) loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format(
        'revoke all on publications, area_invites, contributions, memberships,
                        supporter_stats, payment_webhook_events, audit_log from %I', r);
      execute format('revoke all on function refresh_supporter_stats(text) from %I', r);
    end if;
  end loop;
end
$$;

commit;
