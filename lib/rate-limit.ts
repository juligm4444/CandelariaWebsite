import 'server-only';

import { headers } from 'next/headers';

import { queryOne } from '@/lib/db/client';

/**
 * Fixed-window limiter backed by the database.
 *
 * In-memory counters are useless on Vercel: every cold start resets them, so a
 * burst spread across instances passes untouched. This shares better-auth's
 * `rateLimit` table, which already exists and has the right shape, under
 * namespaced keys so the two never collide.
 */
export type RateLimitResult = { allowed: boolean; retryAfter: number };

export async function rateLimit(
  namespace: string,
  identifier: string,
  options: { window: number; max: number },
): Promise<RateLimitResult> {
  const key = `app:${namespace}:${identifier}`;
  const now = Date.now();
  const windowMs = options.window * 1000;

  try {
    const row = await queryOne<{ count: string; lastRequest: string }>(
      `insert into "rateLimit" ("id", "key", "count", "lastRequest")
       values ($1, $1, 1, $2)
       on conflict ("key") do update
          set "count" = case
                          when "rateLimit"."lastRequest" < $3 then 1
                          else "rateLimit"."count" + 1
                        end,
              "lastRequest" = case
                          when "rateLimit"."lastRequest" < $3 then $2
                          else "rateLimit"."lastRequest"
                        end
       returning "count"::text as "count", "lastRequest"::text as "lastRequest"`,
      [key, now, now - windowMs],
    );

    const count = Number(row?.count ?? 1);
    const windowStart = Number(row?.lastRequest ?? now);

    if (count > options.max) {
      const retryAfter = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
      return { allowed: false, retryAfter };
    }

    return { allowed: true, retryAfter: 0 };
  } catch (error) {
    // Fail closed on anything that touches money or mail: a limiter that
    // cannot reach the database must not become an open door.
    console.error(
      '[rate-limit] %s unavailable: %s',
      namespace,
      error instanceof Error ? error.message : 'unknown',
    );
    return { allowed: false, retryAfter: 30 };
  }
}

/** Client address as seen behind the Vercel edge. */
export async function clientIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
}
