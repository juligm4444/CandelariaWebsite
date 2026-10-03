import 'server-only';

import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { haveIBeenPwned } from 'better-auth/plugins/haveibeenpwned';

import { consumeInvite, findPendingInvite } from '@/lib/db/invites';
import { getPool } from '@/lib/db/pool';
import { sendMail } from '@/lib/email/resend';
import {
  passwordChangedEmail,
  passwordResetEmail,
  verifyEmail,
} from '@/lib/email/templates';
import { internalEmailDomains, isProduction } from '@/lib/env';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

/**
 * Authentication. One shared Postgres pool against the Supabase database, so
 * better-auth and the application queries sit on the same connection budget.
 *
 * Security posture:
 *  - e-mail and password only, no social providers to review.
 *  - 12-character minimum, which is above the better-auth default of 8.
 *  - e-mail verification is required before a session is issued.
 *  - sessions are revoked on password reset.
 *  - rate limiting is on and stored in the database, so it survives the
 *    stateless function lifecycle on Vercel (an in-memory limiter resets on
 *    every cold start and effectively does nothing there).
 *  - cookies are host-only, `SameSite=Lax`, `Secure` in production.
 */

/** True when the address belongs to a domain allowed to hold a team account. */
export function isInternalEmail(email: string): boolean {
  const domains = internalEmailDomains();
  if (domains.length === 0) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? domains.includes(domain) : false;
}

function localeFromRequest(request?: Request): Locale {
  const cookie = request?.headers.get('cookie') ?? '';
  return /(?:^|;\s*)cdl_locale=en(?:;|$)/.test(cookie) ? 'en' : defaultLocale;
}

/**
 * Builds the better-auth instance. Called lazily (see `getAuth` below), never
 * at module import time: `database: getPool()` and the `secret` option both
 * need real environment values, and Next's build still imports this module
 * while collecting route metadata even for `force-dynamic` routes. A
 * top-level `export const auth = betterAuth(...)` would construct the
 * instance - and therefore require every secret - during `next build`, on a
 * machine (a CI runner, a contributor's first checkout) that has none of
 * them yet.
 */
function buildAuth() {
  return betterAuth({
  appName: 'Candelaria Solar Car',
  database: getPool(),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.APP_URL,
  basePath: '/api/auth',

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 256,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    async sendResetPassword({ user, url }, request) {
      const mail = passwordResetEmail({
        name: user.name || user.email,
        url,
        locale: localeFromRequest(request),
      });
      await sendMail({ to: user.email, ...mail });
    },
    async onPasswordReset({ user }, request) {
      const mail = passwordChangedEmail({
        name: user.name || user.email,
        locale: localeFromRequest(request),
      });
      await sendMail({ to: user.email, ...mail });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    async sendVerificationEmail({ user, url }, request) {
      const mail = verifyEmail({
        name: user.name || user.email,
        url,
        locale: localeFromRequest(request),
      });
      await sendMail({ to: user.email, ...mail });
    },
  },

  user: {
    additionalFields: {
      /** Whether the account belongs to the semillero or to an outside supporter. */
      isInternal: { type: 'boolean', required: false, defaultValue: false, input: false },
      /** One of the seven area keys, or null for external supporters. */
      areaKey: { type: 'string', required: false, input: false },
      /** 'leader' | 'coleader' | 'member' | null. Only a lead can change it. */
      internalRole: { type: 'string', required: false, input: false },
      /** Degree programme key, from content/careers.ts. */
      careerKey: { type: 'string', required: false, input: false },
      /** Free-text role inside the area, shown on the team page. */
      roleTitle: { type: 'string', required: false, input: false },
      /** Storage path of the profile photo inside the media bucket. */
      imagePath: { type: 'string', required: false, input: false },
      /** Set to false when a lead revokes access. Hides the member from the site. */
      isActive: { type: 'boolean', required: false, defaultValue: true, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 300, max: 8 },
      '/sign-up/email': { window: 3600, max: 5 },
      '/request-password-reset': { window: 3600, max: 5 },
      '/reset-password': { window: 3600, max: 8 },
      '/send-verification-email': { window: 3600, max: 5 },
    },
  },

  trustedOrigins: [process.env.APP_URL ?? 'http://localhost:3000'],

  advanced: {
    cookiePrefix: 'cdl',
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
    },
    ipAddress: {
      // Vercel terminates the request, so the client address arrives here.
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
  },

  databaseHooks: {
    user: {
      create: {
        /**
         * Decides internal membership at creation time, from server-side state
         * only: a pending invitation written by an area lead or co-lead.
         * `isInternal`, `areaKey` and `internalRole` all carry `input: false`,
         * so a crafted sign-up payload cannot set them, and this hook is the
         * only place they are assigned.
         *
         * Having an `@uniandes.edu.co` address is NOT enough on its own to
         * become an internal account: it only makes the address *eligible* to
         * be invited (enforced in `inviteMemberAction`, lib/env.ts
         * `internalEmailDomains`). Membership itself always traces back to a
         * specific invite row written by someone who already holds a role,
         * which is what keeps "who is internal" an auditable decision instead
         * of "whoever happens to have the right e-mail suffix".
         *
         * The only account not gated by an invite is the very first leader of
         * each area, seeded once by hand - see docs/MANUAL_SETUP.md.
         */
        before: async (user) => {
          const invite = await findPendingInvite(user.email).catch(() => null);

          if (invite) {
            return {
              data: {
                ...user,
                isInternal: true,
                areaKey: invite.areaKey,
                internalRole: invite.role,
                isActive: true,
              },
            };
          }

          return {
            data: {
              ...user,
              isInternal: false,
              areaKey: null,
              internalRole: null,
              isActive: true,
            },
          };
        },

        /** Burns the invitation so a single link cannot seat two accounts. */
        after: async (user) => {
          await consumeInvite(user.email).catch((error: unknown) => {
            console.error(
              '[auth] could not consume invite for a new account: %s',
              error instanceof Error ? error.message : 'unknown',
            );
          });
        },
      },
    },
  },

  onAPIError: {
    onError(error) {
      // Auth failures are logged without the request body, which carries
      // passwords and reset tokens.
      const message = error instanceof Error ? error.message : 'unknown auth error';
      console.error('[auth] %s', message);
    },
  },

  plugins: [
    /*
     * Rejects passwords that appear in the Have I Been Pwned corpus. Only the
     * first five characters of the SHA-1 hash leave the server (k-anonymity),
     * so the password itself is never sent anywhere. A 12-character minimum
     * does nothing against a password that is already in every wordlist.
     */
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        'Esa contraseña aparece en filtraciones públicas. Elige otra.',
    }),

    // Must stay last: it writes the Set-Cookie headers back through Next.
    nextCookies(),
  ],
  });
}

type AuthInstance = ReturnType<typeof buildAuth>;

let instance: AuthInstance | null = null;

/** The memoized better-auth instance. Built on first call, not at import time. */
export function getAuth(): AuthInstance {
  instance ??= buildAuth();
  return instance;
}

export type Auth = AuthInstance;
export type SessionUser = Awaited<ReturnType<Auth['api']['getSession']>> extends infer S
  ? S extends { user: infer U }
    ? U
    : never
  : never;
