import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { appUrl } from '@/lib/env';
import { createPortalSession, paymentsEnabled } from '@/lib/payments/polar';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Opens the Polar customer portal for the signed-in account.
 *
 * The external customer id is taken from the session, never from the request,
 * so one supporter cannot open another supporter's billing portal.
 */
export async function POST() {
  if (!paymentsEnabled()) return NextResponse.json({ error: 'PAYMENTS_DISABLED' }, { status: 503 });

  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

  const identifier = await clientIdentifier();
  const limit = await rateLimit('portal', `${user.id}:${identifier}`, { window: 300, max: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const url = await createPortalSession(user.id, `${appUrl()}/purchases`);
  if (!url) return NextResponse.json({ error: 'FAILED' }, { status: 502 });

  return NextResponse.json({ url });
}
