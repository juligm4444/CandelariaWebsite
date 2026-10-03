import 'server-only';

import { z } from 'zod';

/**
 * Server-side environment contract.
 *
 * Importing this module from a Client Component is a build error thanks to
 * `server-only`, which is the guard that keeps service-role keys and payment
 * secrets out of the browser bundle.
 *
 * Validation is lazy: `serverEnv()` throws the first time a route actually
 * needs a variable, instead of crashing the whole build. That keeps `next build`
 * working on a machine that only has the public variables configured, while
 * still failing loudly in the request that depends on a missing secret.
 */
/**
 * `.env.example` ships every optional key present but empty (`KEY=`), and
 * `cp .env.example .env.local` - the documented first step - copies that
 * verbatim. A plain `.optional()` does not treat `''` as absent, only
 * `undefined` does, so an unfilled optional var would fail validation with
 * the same severity as a genuinely missing required one. This normalises the
 * empty string to `undefined` first so "not configured yet" reads as exactly
 * that, for every optional field below.
 */
const optionalString = (schema: z.ZodString) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Public origin of the deployment, used for auth callbacks and e-mail links.
  APP_URL: z.string().url(),

  // Supabase Postgres connection string (pooled). Used by better-auth.
  DATABASE_URL: z.string().min(1),

  // better-auth
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: optionalString(z.string().min(1)),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('media'),

  // Polar.sh
  POLAR_ACCESS_TOKEN: optionalString(z.string().min(1)),
  POLAR_WEBHOOK_SECRET: optionalString(z.string().min(1)),
  POLAR_SERVER: z.enum(['sandbox', 'production']).default('sandbox'),

  // Resend
  RESEND_API_KEY: optionalString(z.string().min(1)),
  RESEND_FROM: z.string().min(1).default('Candelaria Solar Car <no-reply@candelaria.website>'),
  CONTACT_INBOX: optionalString(z.string().email()),

  // PostHog server-side capture
  POSTHOG_API_KEY: optionalString(z.string().min(1)),

  // Comma-separated e-mail domains an area lead is allowed to invite as an
  // internal account. Does NOT grant internal status by itself - see
  // isInternalEmail() in lib/auth/server.ts and inviteMemberAction.
  INTERNAL_EMAIL_DOMAINS: z.string().default(''),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    // Only the variable names are surfaced. Never the values.
    const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(
      `Invalid or missing server environment variables: ${missing}. See docs/MANUAL_SETUP.md.`,
    );
  }

  cached = parsed.data;
  return cached;
}

/** Returns a single optional secret without forcing the whole schema to parse. */
export function optionalEnv(key: keyof ServerEnv): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export const isProduction = process.env.NODE_ENV === 'production';

/**
 * The public origin, read directly rather than through `serverEnv()`. A
 * feature that only needs to build a redirect URL (checkout success, the
 * billing portal return) has no reason to fail because an unrelated secret
 * - Resend, Polar, PostHog - isn't configured yet.
 */
export function appUrl(): string {
  return process.env.APP_URL ?? 'http://localhost:3000';
}

/** Domains an invite's e-mail is allowed to belong to, normalised once. */
export function internalEmailDomains(): string[] {
  return (process.env.INTERNAL_EMAIL_DOMAINS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
}
