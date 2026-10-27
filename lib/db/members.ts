import 'server-only';

import type { AreaKey } from '@/content/areas';
import type { InternalRole } from '@/lib/auth/roles';

import { query, queryOne, transaction } from './client';

export type Member = {
  id: string;
  name: string;
  areaKey: AreaKey;
  internalRole: InternalRole;
  careerKey: string | null;
  roleTitle: string | null;
  imagePath: string | null;
};

/** Public team listing. Never selects e-mail: the team page is unauthenticated. */
export async function listActiveMembers(): Promise<Member[]> {
  return query<Member>(
    `select "id",
            "name",
            "areaKey"       as "areaKey",
            "internalRole"  as "internalRole",
            "careerKey"     as "careerKey",
            "roleTitle"     as "roleTitle",
            "imagePath"     as "imagePath"
       from "user"
      where "isInternal"
        and "isActive"
        and "areaKey" is not null
        and "internalRole" is not null
      order by
        case "internalRole" when 'leader' then 0 when 'coleader' then 1 else 2 end,
        lower("name")`,
  );
}

/** Optional public-card fields, added by migration 20261013120000. */
export type MemberLinks = {
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
};

export const EMPTY_LINKS: MemberLinks = {
  bio: null,
  linkedinUrl: null,
  githubUrl: null,
  instagramUrl: null,
  websiteUrl: null,
};

/**
 * Bio and social links for a set of users. Kept out of the main listing on
 * purpose: if the migration has not run yet, this query fails on its own and
 * the team page still renders every card, just without links.
 */
export async function memberLinks(ids: string[]): Promise<Map<string, MemberLinks>> {
  if (ids.length === 0) return new Map();
  try {
    const rows = await query<MemberLinks & { id: string }>(
      `select "id", "bio", "linkedinUrl", "githubUrl", "instagramUrl", "websiteUrl"
         from "user"
        where "id" = any($1::text[])`,
      [ids],
    );
    return new Map(rows.map(({ id, ...links }) => [id, links]));
  } catch (error) {
    console.warn(
      '[members] links unavailable (has 20261013120000_member_profile.sql run?): %s',
      error instanceof Error ? error.message : error,
    );
    return new Map();
  }
}

/** Saves the owner's own card fields. Same ownership rule as updateOwnProfile. */
export async function updateOwnLinks(userId: string, links: MemberLinks): Promise<void> {
  await query(
    `update "user"
        set "bio"          = $2,
            "linkedinUrl"  = $3,
            "githubUrl"    = $4,
            "instagramUrl" = $5,
            "websiteUrl"   = $6,
            "updatedAt"    = now()
      where "id" = $1`,
    [userId, links.bio, links.linkedinUrl, links.githubUrl, links.instagramUrl, links.websiteUrl],
  );
}

export type AreaMember = Member & { email: string };

/** Area roster for the dashboard. Includes e-mail, so it is lead-gated. */
export async function listAreaMembers(areaKey: AreaKey): Promise<AreaMember[]> {
  return query<AreaMember>(
    `select "id", "name", "email",
            "areaKey"      as "areaKey",
            "internalRole" as "internalRole",
            "careerKey"    as "careerKey",
            "roleTitle"    as "roleTitle",
            "imagePath"    as "imagePath"
       from "user"
      where "isInternal" and "isActive" and "areaKey" = $1
      order by
        case "internalRole" when 'leader' then 0 when 'coleader' then 1 else 2 end,
        lower("name")`,
    [areaKey],
  );
}

export async function updateOwnProfile(
  userId: string,
  input: {
    name: string;
    careerKey: string | null;
    roleTitle: string | null;
    imagePath?: string | null;
  },
): Promise<void> {
  // `areaKey` and `internalRole` are intentionally absent: a member cannot
  // move themselves into another area or promote themselves.
  await query(
    `update "user"
        set "name"      = $2,
            "careerKey" = $3,
            "roleTitle" = $4,
            "imagePath" = coalesce($5, "imagePath"),
            "updatedAt" = now()
      where "id" = $1`,
    [userId, input.name, input.careerKey, input.roleTitle, input.imagePath ?? null],
  );
}

/**
 * Revokes an account's access. Scoped to the caller's area in the statement,
 * and refuses to touch a lead, so a co-lead cannot remove their own lead.
 */
export async function revokeMember(targetId: string, areaKey: AreaKey): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `update "user"
        set "isActive"     = false,
            "internalRole" = null,
            "updatedAt"    = now()
      where "id" = $1
        and "areaKey" = $2
        and "isInternal"
        and "internalRole" <> 'leader'
      returning "id"`,
    [targetId, areaKey],
  );
  return row !== null;
}

/** Sets or clears the co-lead role for one member of the caller's area. */
export async function setColeader(
  targetId: string,
  areaKey: AreaKey,
  makeColeader: boolean,
): Promise<boolean> {
  return transaction(async (tx) => {
    if (makeColeader) {
      // The partial unique index allows one active co-lead per area, so the
      // current holder is demoted inside the same transaction.
      await tx.query(
        `update "user" set "internalRole" = 'member', "updatedAt" = now()
          where "areaKey" = $1 and "internalRole" = 'coleader' and "isActive"`,
        [areaKey],
      );
    }

    const rows = await tx.query<{ id: string }>(
      `update "user"
          set "internalRole" = $3, "updatedAt" = now()
        where "id" = $1
          and "areaKey" = $2
          and "isInternal"
          and "isActive"
          and "internalRole" <> 'leader'
        returning "id"`,
      [targetId, areaKey, makeColeader ? 'coleader' : 'member'],
    );

    return rows.length > 0;
  });
}

/**
 * Hands the lead over. Both writes happen in one transaction so the partial
 * unique index can never see two leads for the area.
 */
export async function transferLeadership(
  currentLeaderId: string,
  targetId: string,
  areaKey: AreaKey,
): Promise<boolean> {
  return transaction(async (tx) => {
    const demoted = await tx.query<{ id: string }>(
      `update "user" set "internalRole" = 'member', "updatedAt" = now()
        where "id" = $1 and "areaKey" = $2 and "internalRole" = 'leader'
        returning "id"`,
      [currentLeaderId, areaKey],
    );

    if (demoted.length === 0) return false;

    const promoted = await tx.query<{ id: string }>(
      `update "user" set "internalRole" = 'leader', "updatedAt" = now()
        where "id" = $1 and "areaKey" = $2 and "isInternal" and "isActive"
        returning "id"`,
      [targetId, areaKey],
    );

    if (promoted.length === 0) throw new Error('TRANSFER_TARGET_INVALID');
    return true;
  });
}

// ---------------------------------------------------------------------------
// Internal invitations
// ---------------------------------------------------------------------------

export type AreaInvite = {
  id: string;
  email: string;
  areaKey: AreaKey;
  role: InternalRole;
  consumedAt: string | null;
  createdAt: string;
};

export async function listAreaInvites(areaKey: AreaKey): Promise<AreaInvite[]> {
  return query<AreaInvite>(
    `select id, email,
            area_key    as "areaKey",
            role,
            consumed_at as "consumedAt",
            created_at  as "createdAt"
       from area_invites
      where area_key = $1
      order by created_at desc
      limit 200`,
    [areaKey],
  );
}

export async function createInvite(input: {
  email: string;
  areaKey: AreaKey;
  role: InternalRole;
  invitedBy: string;
}): Promise<'created' | 'exists'> {
  const row = await queryOne<{ id: string }>(
    `insert into area_invites (email, area_key, role, invited_by)
     values (lower($1), $2, $3, $4)
     on conflict (lower(email)) do nothing
     returning id`,
    [input.email, input.areaKey, input.role, input.invitedBy],
  );
  return row ? 'created' : 'exists';
}

/** Applies an area and role to a freshly created internal account. */
export async function attachInternalMembership(
  userId: string,
  areaKey: AreaKey,
  role: InternalRole,
): Promise<void> {
  await query(
    `update "user"
        set "isInternal"   = true,
            "areaKey"      = $2,
            "internalRole" = $3,
            "updatedAt"    = now()
      where "id" = $1`,
    [userId, areaKey, role],
  );
}
