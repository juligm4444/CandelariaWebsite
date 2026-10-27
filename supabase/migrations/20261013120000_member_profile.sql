-- ============================================================================
-- Public team card: short bio and social links, edited by each member from
-- /profile. Every column is optional, and the application validates every URL
-- server-side (app/actions/profile.ts) before it reaches this table. The check
-- constraints are a second line: a row can never hold a non-https link or an
-- oversized bio, whatever wrote it.
--
-- Additive and idempotent. The site keeps working before this runs: the team
-- page reads these columns in a separate query and falls back to plain cards.
-- ============================================================================

begin;

alter table "user"
  add column if not exists "bio"          text,
  add column if not exists "linkedinUrl"  text,
  add column if not exists "githubUrl"    text,
  add column if not exists "instagramUrl" text,
  add column if not exists "websiteUrl"   text;

alter table "user" drop constraint if exists user_bio_length;
alter table "user" add constraint user_bio_length
  check ("bio" is null or char_length("bio") <= 280);

alter table "user" drop constraint if exists user_links_https;
alter table "user" add constraint user_links_https
  check (
    ("linkedinUrl"  is null or ("linkedinUrl"  like 'https://%' and char_length("linkedinUrl")  <= 300))
    and ("githubUrl"    is null or ("githubUrl"    like 'https://%' and char_length("githubUrl")    <= 300))
    and ("instagramUrl" is null or ("instagramUrl" like 'https://%' and char_length("instagramUrl") <= 300))
    and ("websiteUrl"   is null or ("websiteUrl"   like 'https://%' and char_length("websiteUrl")   <= 300))
  );

commit;
