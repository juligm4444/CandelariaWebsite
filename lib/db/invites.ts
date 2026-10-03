import 'server-only';

import type { AreaKey } from '@/content/areas';
import type { InternalRole } from '@/lib/auth/roles';

import { query, queryOne } from './client';

/**
 * Invitation lookups used by the sign-up hook.
 *
 * They live apart from lib/db/members.ts so lib/auth/server.ts can import them
 * without pulling in the member-management queries, which import the session
 * helpers that depend on the auth instance.
 */
export async function findPendingInvite(
  email: string,
): Promise<{ areaKey: AreaKey; role: InternalRole } | null> {
  return queryOne<{ areaKey: AreaKey; role: InternalRole }>(
    `select area_key as "areaKey", role
       from area_invites
      where lower(email) = lower($1) and consumed_at is null`,
    [email],
  );
}

export async function consumeInvite(email: string): Promise<void> {
  await query(
    `update area_invites set consumed_at = now()
      where lower(email) = lower($1) and consumed_at is null`,
    [email],
  );
}
