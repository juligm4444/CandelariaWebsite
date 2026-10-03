import { NextResponse } from 'next/server';
import { z } from 'zod';

import { CURRENCY, tierById } from '@/content/catalog';
import { getCurrentUser } from '@/lib/auth/session';
import { audit } from '@/lib/db/audit';
import { createPendingContribution } from '@/lib/db/commerce';
import { appUrl } from '@/lib/env';
import { createCheckout, paymentsEnabled, polarProductId } from '@/lib/payments/polar';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Opens a Polar checkout for a membership subscription.
 *
 * There used to be two other intents here: a merch cart (Polar is a
 * merchant-of-record platform for digital goods and does not accept physical
 * merchandise) and a free-form one-off donation (Polar's acceptable-use
 * policy prohibits donations outright, as a product category, regardless of
 * presentation). See content/catalog.ts for the full rationale on both.
 *
 * Every amount is re-derived here from `content/catalog.ts`, so a tampered
 * client cannot set its own price.
 */
const schema = z.object({
  kind: z.literal('membership'),
  tierId: z.enum(['cobre', 'aluminio', 'titanio']),
});

function fail(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request) {
  if (!paymentsEnabled()) return fail('PAYMENTS_DISABLED', 503);

  const identifier = await clientIdentifier();
  const limit = await rateLimit('checkout', identifier, { window: 300, max: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('BAD_REQUEST', 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('BAD_REQUEST', 400);

  const user = await getCurrentUser().catch(() => null);
  const input = parsed.data;

  if (!user) return fail('AUTH_REQUIRED', 401);
  if (!user.isActive) return fail('ACCOUNT_DISABLED', 403);

  const reference = crypto.randomUUID();

  try {
    const plan = buildPlan(input);
    if (!plan) return fail('CATALOG_UNAVAILABLE', 503);

    await createPendingContribution({
      userId: user?.id ?? null,
      kind: plan.kind,
      amount: plan.amount,
      currency: CURRENCY,
      reference,
      description: plan.description,
      checkoutId: null,
      metadata: plan.metadata,
    });

    const checkout = await createCheckout({
      lines: plan.lines,
      reference,
      successUrl: `${appUrl()}/purchases?checkout=ok`,
      customer: user ? { email: user.email, name: user.name, externalId: user.id } : null,
      metadata: { reference, kind: plan.kind, ...plan.metadata },
      locale: 'es',
    });

    await audit({
      actorId: user?.id ?? null,
      action: 'checkout.created',
      target: reference,
      details: { kind: plan.kind, amount: plan.amount, currency: CURRENCY },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    // The provider message can name internal product ids, so it is logged and
    // never returned to the browser.
    console.error(
      '[checkout] failed: %s',
      error instanceof Error ? error.message : 'unknown error',
    );
    await audit({
      actorId: user?.id ?? null,
      action: 'checkout.failed',
      target: reference,
      severity: 'warning',
      details: { kind: input.kind },
    });
    return fail('CHECKOUT_FAILED', 502);
  }
}

type Plan = {
  kind: 'subscription';
  amount: number;
  description: string;
  lines: { productId: string; amount?: number }[];
  metadata: Record<string, string | number>;
};

/** Resolves intent into a Polar product id and a server-side total. */
function buildPlan(input: z.infer<typeof schema>): Plan | null {
  const tier = tierById.get(input.tierId);
  if (!tier) return null;
  const productId = polarProductId(tier.polarEnvKey);
  if (!productId) return null;
  return {
    kind: 'subscription',
    amount: tier.monthlyPrice,
    description: `Membresía ${tier.name.es}`,
    lines: [{ productId }],
    metadata: { tierId: tier.id },
  };
}
