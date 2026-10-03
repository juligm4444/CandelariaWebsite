import 'server-only';

import { Pool } from 'pg';

/**
 * One Postgres pool for the whole process, shared by better-auth and the
 * application queries. It lives in its own module so the auth configuration
 * and the data layer can both reach it without importing each other.
 *
 * Reads `DATABASE_URL` directly, never through `serverEnv()`: that validates
 * the *entire* server contract (Polar, Resend, PostHog secrets included), and
 * a database query has no business failing because `POSTHOG_API_KEY` isn't
 * set yet. Each feature's env requirement should fail on its own.
 *
 * `max` is deliberately small: a serverless deployment multiplies instances,
 * and Supabase's pooler has a finite connection budget.
 */
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. See docs/MANUAL_SETUP.md, section 1.');
    }

    pool = new Pool({
      connectionString,
      max: 4,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      // Supabase terminates TLS at the pooler with a public certificate
      // chain, so full verification stays on in production. It is relaxed
      // outside production because plenty of developer machines and campus
      // networks run antivirus or firewall software that intercepts TLS to
      // inspect it (Kaspersky, ESET, campus proxies...), which injects its
      // own certificate into the chain and makes Node reject it with
      // SELF_SIGNED_CERT_IN_CHAIN even though the connection is genuinely
      // Supabase. The traffic is still encrypted either way; only the extra
      // chain-of-trust check is skipped, and only on a machine the team
      // actually controls, never on the deployed site.
      ssl: connectionString.includes('localhost')
        ? undefined
        : { rejectUnauthorized: process.env.NODE_ENV === 'production' },
    });

    // `pg` emits `error` on an idle client when the connection drops, for
    // example when Supabase recycles the pooler. Without this listener Node
    // treats it as an uncaught exception and the whole function dies, taking
    // every in-flight request with it. Logging it lets the pool replace the
    // client and the next query reconnect.
    pool.on('error', (error) => {
      console.error('[db] idle client error: %s', error.message);
    });
  }
  return pool;
}
