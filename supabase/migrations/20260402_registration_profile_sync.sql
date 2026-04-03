-- Registration profile sync hardening
-- Keeps open signup for external users while preserving whitelist-derived internal roles.

begin;

-- Ensure role enum exists (legacy projects may have text+check instead).
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'internal_role_enum'
      and n.nspname = 'public'
  ) then
    create type public.internal_role_enum as enum ('leader', 'coleader', 'member');
  end if;
end
$$;

-- Keep auth signup non-blocking and idempotent.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wl_role text;
  normalized_email text;
begin
  normalized_email := lower(coalesce(new.email, ''));

  select w.internal_role::text
    into wl_role
  from public.whitelist w
  where lower(w.email) = normalized_email
  limit 1;

  insert into public.profiles (id, email, name, is_internal, internal_role)
  values (
    new.id,
    normalized_email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), ''),
    wl_role is not null,
    wl_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    is_internal = excluded.is_internal,
    internal_role = excluded.internal_role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- If a user is added to whitelist after signup, promote profile to internal role.
create or replace function public.sync_profile_from_whitelist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set
    is_internal = true,
    internal_role = new.internal_role::text
  where lower(p.email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_whitelist_upsert_sync_profile on public.whitelist;
create trigger on_whitelist_upsert_sync_profile
after insert or update of internal_role, email on public.whitelist
for each row execute function public.sync_profile_from_whitelist();

comment on function public.handle_new_auth_user() is
  'Creates/updates profiles on auth signup and maps whitelist emails to internal roles.';

comment on function public.sync_profile_from_whitelist() is
  'Promotes existing profiles to internal when whitelist entries are added/updated.';

commit;
