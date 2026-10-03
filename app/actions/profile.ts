'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/session';
import { isCareerKey } from '@/content/careers';
import { audit } from '@/lib/db/audit';
import { updateOwnProfile } from '@/lib/db/members';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';
import { removeFile, uploadFile } from '@/lib/storage';

export type ProfileActionState = { status: 'idle' | 'success' | 'error'; message?: string };

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  careerKey: z
    .string()
    .trim()
    .max(64)
    .nullable()
    .refine((value) => value === null || value === '' || isCareerKey(value), 'INVALID_CAREER'),
  roleTitle: z.string().trim().max(120).nullable(),
});

/**
 * Updates the signed-in user's own profile.
 *
 * Deliberately absent from the payload: area, internal role and active flag.
 * Those are assigned by an area lead, and letting the owner post them would be
 * a privilege-escalation path straight from the browser.
 */
export async function updateProfile(
  _previous: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return { status: 'error', message: 'AUTH_REQUIRED' };

  const identifier = await clientIdentifier();
  const limit = await rateLimit('profile', `${user.id}:${identifier}`, { window: 60, max: 10 });
  if (!limit.allowed) return { status: 'error', message: 'RATE_LIMITED' };

  const parsed = schema.safeParse({
    name: formData.get('name'),
    careerKey: (formData.get('careerKey') as string | null) || null,
    roleTitle: (formData.get('roleTitle') as string | null) || null,
  });

  if (!parsed.success) return { status: 'error', message: 'INVALID' };

  let imagePath: string | null = null;
  const photo = formData.get('photo');

  if (photo instanceof File && photo.size > 0) {
    // The path prefix comes from the session user id, never from the uploaded
    // file name, so a crafted name cannot escape the user's own folder.
    const result = await uploadFile(photo, 'image', `members/${user.id}`);
    if ('error' in result) return { status: 'error', message: result.error };
    imagePath = result.path;
  }

  try {
    await updateOwnProfile(user.id, {
      name: parsed.data.name,
      careerKey: parsed.data.careerKey || null,
      roleTitle: parsed.data.roleTitle || null,
      imagePath,
    });

    if (imagePath && user.imagePath) await removeFile(user.imagePath);

    await audit({ actorId: user.id, action: 'profile.updated', target: user.id });
    revalidatePath('/profile');
    revalidatePath('/team');

    return { status: 'success' };
  } catch (error) {
    console.error(
      '[profile] update failed: %s',
      error instanceof Error ? error.message : 'unknown',
    );
    return { status: 'error', message: 'FAILED' };
  }
}
