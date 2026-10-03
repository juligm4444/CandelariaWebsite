import { toNextJsHandler } from 'better-auth/next-js';

import { getAuth } from '@/lib/auth/server';

/**
 * better-auth mounts its whole surface here: sign-in, sign-up, verification,
 * password reset and session. Rate limiting, CSRF and origin checks are
 * configured on the instance in lib/auth/server.ts.
 *
 * The instance is built inside each handler, not at module scope: `getAuth()`
 * needs real secrets, and this route is imported while Next collects build
 * metadata even though it is `force-dynamic`.
 */
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
