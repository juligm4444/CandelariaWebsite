'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { areaByKey, type AreaKey } from '@/content/areas';
import { isInternalEmail } from '@/lib/auth/server';
import { canManageArea, getCurrentUser, isAreaLeader } from '@/lib/auth/session';
import { audit } from '@/lib/db/audit';
import {
  createInvite,
  revokeMember,
  setColeader,
  transferLeadership,
} from '@/lib/db/members';
import { createPublication, deletePublicationScoped, reserveSlug } from '@/lib/db/publications';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';
import { removeFile, uploadFile } from '@/lib/storage';

export type ActionState = { status: 'idle' | 'success' | 'error'; message?: string };

const ok: ActionState = { status: 'success' };
const fail = (message: string): ActionState => ({ status: 'error', message });

/**
 * Every action here re-reads the session and re-checks authorisation. The
 * dashboard UI hides what a member cannot do, but hiding a button is not an
 * access control: these checks are.
 */
async function requireAreaMember() {
  const user = await getCurrentUser();
  if (!user || !user.isActive || !user.isInternal || !user.areaKey) return null;
  if (!areaByKey.has(user.areaKey)) return null;
  return { user, areaKey: user.areaKey as AreaKey };
}

// ---------------------------------------------------------------------------
// Publications
// ---------------------------------------------------------------------------

const publicationSchema = z.object({
  titleEs: z.string().trim().min(4).max(300),
  titleEn: z.string().trim().min(4).max(300),
  abstractEs: z.string().trim().min(40).max(20000),
  abstractEn: z.string().trim().min(40).max(20000),
});

export async function createPublicationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');

  const identifier = await clientIdentifier();
  const limit = await rateLimit('publication', `${context.user.id}:${identifier}`, {
    window: 3600,
    max: 20,
  });
  if (!limit.allowed) return fail('RATE_LIMITED');

  const parsed = publicationSchema.safeParse({
    titleEs: formData.get('titleEs'),
    titleEn: formData.get('titleEn'),
    abstractEs: formData.get('abstractEs'),
    abstractEn: formData.get('abstractEn'),
  });

  if (!parsed.success) return fail('INVALID');

  let coverPath: string | null = null;
  let pdfPath: string | null = null;

  const cover = formData.get('cover');
  if (cover instanceof File && cover.size > 0) {
    const result = await uploadFile(cover, 'image', `publications/${context.areaKey}`);
    if ('error' in result) return fail(result.error);
    coverPath = result.path;
  }

  const pdf = formData.get('pdf');
  if (pdf instanceof File && pdf.size > 0) {
    const result = await uploadFile(pdf, 'pdf', `publications/${context.areaKey}/files`);
    if ('error' in result) {
      await removeFile(coverPath);
      return fail(result.error);
    }
    pdfPath = result.path;
  }

  try {
    const slug = await reserveSlug(parsed.data.titleEs);
    const created = await createPublication({
      slug,
      areaKey: context.areaKey,
      authorId: context.user.id,
      titleEs: parsed.data.titleEs,
      titleEn: parsed.data.titleEn,
      abstractEs: parsed.data.abstractEs,
      abstractEn: parsed.data.abstractEn,
      coverPath,
      pdfPath,
    });

    await audit({
      actorId: context.user.id,
      action: 'publication.created',
      target: created.id,
      details: { areaKey: context.areaKey, slug: created.slug },
    });

    revalidatePath('/dashboard');
    revalidatePath('/publications');
    revalidatePath('/');

    return ok;
  } catch (error) {
    await removeFile(coverPath);
    await removeFile(pdfPath);
    console.error(
      '[dashboard] publication create failed: %s',
      error instanceof Error ? error.message : 'unknown',
    );
    return fail('FAILED');
  }
}

export async function deletePublicationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');
  if (!canManageArea(context.user, context.areaKey)) return fail('FORBIDDEN');

  const id = String(formData.get('id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail('INVALID');

  // The area is part of the delete statement, so an id from another area
  // matches nothing instead of relying on a separate check.
  const removed = await deletePublicationScoped(id, context.areaKey);
  if (!removed) return fail('FORBIDDEN');

  await removeFile(removed.pdfPath);
  await removeFile(removed.coverPath);

  await audit({
    actorId: context.user.id,
    action: 'publication.deleted',
    target: id,
    severity: 'warning',
    details: { areaKey: context.areaKey },
  });

  revalidatePath('/dashboard');
  revalidatePath('/publications');

  return ok;
}

// ---------------------------------------------------------------------------
// Area membership
// ---------------------------------------------------------------------------

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(['member', 'coleader']),
});

export async function inviteMemberAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');
  if (!canManageArea(context.user, context.areaKey)) return fail('FORBIDDEN');

  const identifier = await clientIdentifier();
  const limit = await rateLimit('invite', `${context.user.id}:${identifier}`, {
    window: 3600,
    max: 30,
  });
  if (!limit.allowed) return fail('RATE_LIMITED');

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  });
  if (!parsed.success) return fail('INVALID');

  // The invited address must belong to an allow-listed institutional domain
  // (INTERNAL_EMAIL_DOMAINS). This is the one place that check happens: an
  // internal account is never granted by domain match at sign-up (see
  // lib/auth/server.ts), only by consuming an invite, so this is what keeps a
  // compromised or careless lead from onboarding an outside address as staff.
  if (!isInternalEmail(parsed.data.email)) {
    await audit({
      actorId: context.user.id,
      action: 'invite.domain_rejected',
      target: parsed.data.email,
      severity: 'warning',
      details: { areaKey: context.areaKey, role: parsed.data.role },
    });
    return fail('EMAIL_DOMAIN_NOT_ALLOWED');
  }

  // Only a lead can hand out a co-lead seat.
  if (parsed.data.role === 'coleader' && !isAreaLeader(context.user, context.areaKey)) {
    return fail('FORBIDDEN');
  }

  const result = await createInvite({
    email: parsed.data.email,
    areaKey: context.areaKey,
    role: parsed.data.role,
    invitedBy: context.user.id,
  });

  await audit({
    actorId: context.user.id,
    action: result === 'created' ? 'invite.created' : 'invite.duplicate',
    target: parsed.data.email,
    details: { areaKey: context.areaKey, role: parsed.data.role },
  });

  revalidatePath('/dashboard');
  return result === 'created' ? ok : fail('ALREADY_INVITED');
}

export async function revokeMemberAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');
  if (!isAreaLeader(context.user, context.areaKey)) return fail('FORBIDDEN');

  const targetId = String(formData.get('targetId') ?? '');
  if (!targetId || targetId === context.user.id) return fail('INVALID');

  const done = await revokeMember(targetId, context.areaKey);

  await audit({
    actorId: context.user.id,
    action: done ? 'member.revoked' : 'member.revoke_denied',
    target: targetId,
    severity: 'warning',
    details: { areaKey: context.areaKey },
  });

  revalidatePath('/dashboard');
  revalidatePath('/team');
  return done ? ok : fail('FORBIDDEN');
}

export async function setColeaderAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');
  if (!isAreaLeader(context.user, context.areaKey)) return fail('FORBIDDEN');

  const targetId = String(formData.get('targetId') ?? '');
  const promote = formData.get('promote') === 'true';
  if (!targetId) return fail('INVALID');

  const done = await setColeader(targetId, context.areaKey, promote);

  await audit({
    actorId: context.user.id,
    action: promote ? 'member.coleader_granted' : 'member.coleader_revoked',
    target: targetId,
    details: { areaKey: context.areaKey },
  });

  revalidatePath('/dashboard');
  revalidatePath('/team');
  return done ? ok : fail('FAILED');
}

export async function transferLeadershipAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requireAreaMember();
  if (!context) return fail('FORBIDDEN');
  if (!isAreaLeader(context.user, context.areaKey)) return fail('FORBIDDEN');

  const targetId = String(formData.get('targetId') ?? '');
  if (!targetId || targetId === context.user.id) return fail('INVALID');

  try {
    const done = await transferLeadership(context.user.id, targetId, context.areaKey);

    await audit({
      actorId: context.user.id,
      action: 'member.leadership_transferred',
      target: targetId,
      severity: 'critical',
      details: { areaKey: context.areaKey },
    });

    revalidatePath('/dashboard');
    revalidatePath('/team');
    return done ? ok : fail('FAILED');
  } catch (error) {
    console.error(
      '[dashboard] leadership transfer failed: %s',
      error instanceof Error ? error.message : 'unknown',
    );
    return fail('FAILED');
  }
}
