-- ============================================================================
-- Media bucket for profile photos, publication covers and publication PDFs.
--
-- Public read so the site can serve images straight from the CDN without
-- signing every URL. Writes happen only from the server with the service role,
-- so no insert or update policy is granted to anon or authenticated.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB, which also caps the publication PDF
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set public             = excluded.public,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Read-only for everyone. Nothing else.
drop policy if exists media_public_read on storage.objects;
create policy media_public_read
  on storage.objects
  for select
  using (bucket_id = 'media');

-- Any previous write policy from the Django era is removed explicitly.
drop policy if exists media_public_insert on storage.objects;
drop policy if exists media_public_update on storage.objects;
drop policy if exists media_public_delete on storage.objects;
