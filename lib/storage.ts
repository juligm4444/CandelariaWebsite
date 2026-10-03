import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { optionalEnv } from '@/lib/env';

/**
 * Supabase Storage, server side only.
 *
 * The service-role key never reaches the browser: this module is `server-only`
 * and the public bucket URL is assembled from `NEXT_PUBLIC_SUPABASE_URL`, which
 * is not a credential.
 *
 * Uploads are validated here rather than trusting the client: the declared
 * content type is ignored in favour of a magic-byte check, because a `.pdf`
 * name and a `application/pdf` header say nothing about the bytes.
 */
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'media';

let admin: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (admin) return admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = optionalEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    throw new Error('STORAGE_NOT_CONFIGURED');
  }

  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type UploadKind = 'image' | 'pdf';

const SIGNATURES: Record<UploadKind, { mime: string; ext: string; test: (b: Uint8Array) => boolean }[]> =
  {
    image: [
      {
        mime: 'image/jpeg',
        ext: 'jpg',
        test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
      },
      {
        mime: 'image/png',
        ext: 'png',
        test: (b) =>
          b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
      },
      {
        mime: 'image/webp',
        ext: 'webp',
        test: (b) =>
          b[0] === 0x52 &&
          b[1] === 0x49 &&
          b[2] === 0x46 &&
          b[3] === 0x46 &&
          b[8] === 0x57 &&
          b[9] === 0x45 &&
          b[10] === 0x42 &&
          b[11] === 0x50,
      },
    ],
    pdf: [
      {
        mime: 'application/pdf',
        ext: 'pdf',
        test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
      },
    ],
  };

export type UploadResult = { path: string } | { error: 'TOO_LARGE' | 'BAD_TYPE' | 'FAILED' };

/**
 * Validates and stores a file. `prefix` is built by the caller from trusted
 * values only (a user id, an area key), never from the client file name, so a
 * name like `../../evil` cannot escape the bucket folder.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  prefix: string,
): Promise<UploadResult> {
  const limit = kind === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size === 0 || file.size > limit) return { error: 'TOO_LARGE' };

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.length < 12) return { error: 'BAD_TYPE' };

  const match = SIGNATURES[kind].find((signature) => signature.test(buffer));
  if (!match) return { error: 'BAD_TYPE' };

  const safePrefix = prefix.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.{2,}/g, '');
  const path = `${safePrefix}/${crypto.randomUUID()}.${match.ext}`;

  try {
    const { error } = await client()
      .storage.from(BUCKET)
      .upload(path, buffer, {
        contentType: match.mime,
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      console.error('[storage] upload failed: %s', error.message);
      return { error: 'FAILED' };
    }

    return { path };
  } catch (error) {
    console.error(
      '[storage] upload threw: %s',
      error instanceof Error ? error.message : 'unknown',
    );
    return { error: 'FAILED' };
  }
}

export async function removeFile(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    await client().storage.from(BUCKET).remove([path]);
  } catch (error) {
    console.error(
      '[storage] remove failed for %s: %s',
      path,
      error instanceof Error ? error.message : 'unknown',
    );
  }
}
