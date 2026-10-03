/**
 * Public URL for a file stored in the media bucket.
 *
 * Safe to import from a Client Component: `NEXT_PUBLIC_SUPABASE_URL` is a
 * hostname, not a credential, and the bucket is read-only to the public.
 *
 * A stored path is a bucket-relative key written by the server, but it is
 * validated again here so a tampered database row cannot turn an `<Image src>`
 * into an off-site or `javascript:` URL.
 */
const BUCKET = 'media';

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const clean = path.replace(/^\/+/, '');
  if (clean.includes('..') || /^[a-z][a-z0-9+.-]*:/i.test(clean)) return null;

  return `${base.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/${clean}`;
}

/**
 * Initials fallback for a member with no photo. Avoids the generic avatar
 * glyph, which reads as placeholder content.
 */
export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}
