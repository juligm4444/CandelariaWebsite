-- Reads per publication, for "lo más leído" on the log.
--
-- A plain counter, not an event log: the site needs a ranking, not analytics
-- (PostHog covers that). One read per visitor address and publication every
-- six hours is counted; app/api/publications/view enforces it.

alter table publications
  add column if not exists view_count bigint not null default 0;

create index if not exists publications_view_count_idx
  on publications (view_count desc, published_at desc);
