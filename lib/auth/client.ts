'use client';

import { createAuthClient } from 'better-auth/react';

/**
 * Browser auth client. The base URL is relative on purpose: the handler lives
 * at `/api/auth` on the same origin, so no public URL has to be inlined into
 * the bundle and preview deployments work without extra configuration.
 */
export const authClient = createAuthClient({
  basePath: '/api/auth',
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient;
