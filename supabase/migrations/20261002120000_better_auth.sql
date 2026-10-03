-- ============================================================================
-- better-auth core schema (generated from @better-auth/core getAuthTables with
-- rateLimit.storage = 'database' and the user additionalFields declared in
-- lib/auth/server.ts).
--
-- Identifiers are quoted because better-auth uses camelCase column names and
-- "user" is a reserved word in Postgres.
--
-- Row Level Security is enabled on every table with no policy attached. The
-- application never reaches these tables through the Supabase anon key: all
-- access goes through the pooled Postgres connection in lib/auth/server.ts,
-- which connects as the database owner and therefore bypasses RLS. A leaked
-- anon key reads nothing.
-- ============================================================================

begin;

create table if not exists "user" (
  "id"            text primary key,
  "name"          text        not null,
  "email"         text        not null unique,
  "emailVerified" boolean     not null default false,
  "image"         text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  -- application fields, all server-assigned (input: false in the auth config)
  "isInternal"    boolean     not null default false,
  "areaKey"       text,
  "internalRole"  text,
  "careerKey"     text,
  "roleTitle"     text,
  "imagePath"     text,
  "isActive"      boolean     not null default true,
  constraint user_internal_role_valid
    check ("internalRole" is null or "internalRole" in ('leader', 'coleader', 'member')),
  constraint user_area_key_valid
    check (
      "areaKey" is null
      or "areaKey" in ('comite', 'rrhh', 'diseno', 'chasis', 'celdas', 'logistica', 'baterias')
    ),
  -- An external supporter can never carry an area or an internal role.
  constraint user_internal_consistency
    check ("isInternal" or ("areaKey" is null and "internalRole" is null))
);

create unique index if not exists user_email_lower_idx on "user" (lower("email"));
create index if not exists user_area_idx on "user" ("areaKey") where "isInternal";

create table if not exists "session" (
  "id"        text primary key,
  "expiresAt" timestamptz not null,
  "token"     text        not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId"    text        not null references "user" ("id") on delete cascade
);

create index if not exists session_user_idx on "session" ("userId");
create index if not exists session_expires_idx on "session" ("expiresAt");

create table if not exists "account" (
  "id"                    text primary key,
  "accountId"             text        not null,
  "providerId"            text        not null,
  "userId"                text        not null references "user" ("id") on delete cascade,
  "accessToken"           text,
  "refreshToken"          text,
  "idToken"               text,
  "accessTokenExpiresAt"  timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope"                 text,
  "password"              text,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now()
);

create index if not exists account_user_idx on "account" ("userId");
create unique index if not exists account_provider_idx on "account" ("providerId", "accountId");

create table if not exists "verification" (
  "id"         text primary key,
  "identifier" text        not null,
  "value"      text        not null,
  "expiresAt"  timestamptz not null,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);

create index if not exists verification_identifier_idx on "verification" ("identifier");
create index if not exists verification_expires_idx on "verification" ("expiresAt");

-- Rate limiting is stored in the database on purpose. The in-memory limiter
-- resets on every serverless cold start, which makes brute-force throttling on
-- Vercel effectively a no-op.
create table if not exists "rateLimit" (
  "id"          text primary key,
  "key"         text   not null unique,
  "count"       bigint not null default 0,
  "lastRequest" bigint not null default 0
);

-- RLS is enabled with no policy, which denies every non-owner role. It is
-- deliberately NOT forced: the application connects as the table owner, and
-- FORCE ROW LEVEL SECURITY would lock the application out of its own tables.
alter table "user"         enable row level security;
alter table "session"      enable row level security;
alter table "account"      enable row level security;
alter table "verification" enable row level security;
alter table "rateLimit"    enable row level security;

-- Belt and braces: strip the Supabase API roles outright, so a leaked anon or
-- service key cannot reach the auth tables through PostgREST either.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on "user", "session", "account", "verification", "rateLimit" from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on "user", "session", "account", "verification", "rateLimit" from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    revoke all on "user", "session", "account", "verification", "rateLimit" from service_role;
  end if;
end
$$;

commit;
