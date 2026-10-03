import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import type { AreaKey } from '@/content/areas';

import { isInternalRole, type InternalRole } from './roles';
import { getAuth } from './server';

export type { InternalRole };

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  isInternal: boolean;
  isActive: boolean;
  areaKey: AreaKey | null;
  internalRole: InternalRole | null;
  careerKey: string | null;
  roleTitle: string | null;
  imagePath: string | null;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asRole(value: unknown): InternalRole | null {
  return isInternalRole(value) ? value : null;
}

/**
 * Current session, de-duplicated per request by `React.cache` so a page that
 * reads it in three components still hits the session store once.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const raw = session.user as Record<string, unknown>;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    emailVerified: Boolean(session.user.emailVerified),
    image: session.user.image ?? null,
    isInternal: raw.isInternal === true,
    isActive: raw.isActive !== false,
    areaKey: asString(raw.areaKey) as AreaKey | null,
    internalRole: asRole(raw.internalRole),
    careerKey: asString(raw.careerKey),
    roleTitle: asString(raw.roleTitle),
    imagePath: asString(raw.imagePath),
  };
});

/** Any authenticated, verified, non-revoked account. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** Members of the semillero. Gates the internal dashboard. */
export async function requireInternal(returnTo: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (!user.isInternal) {
    redirect('/profile');
  }
  return user;
}

/** Area leads and co-leads. Gates destructive area management. */
export function canManageArea(user: CurrentUser, areaKey: AreaKey): boolean {
  if (!user.isInternal || !user.isActive) return false;
  if (user.areaKey !== areaKey) return false;
  return user.internalRole === 'leader' || user.internalRole === 'coleader';
}

/** Only the lead. Gates transfers and revocations. */
export function isAreaLeader(user: CurrentUser, areaKey: AreaKey): boolean {
  return user.isInternal && user.isActive && user.areaKey === areaKey && user.internalRole === 'leader';
}
