-- Durable media storage for Django uploads
-- Creates a public bucket used by the backend Supabase storage adapter.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read access for published media assets.
drop policy if exists media_public_read on storage.objects;
create policy media_public_read
on storage.objects
for select
using (bucket_id = 'media');
