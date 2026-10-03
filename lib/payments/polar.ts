import 'server-only';

import { createPolar } from '@polar-sh/sdk/2026-10';

import { optionalEnv } from '@/lib/env';

/**
 * Polar.sh is the payment gateway. Nothing about a card ever touches this
 * application: the visitor is sent to a Polar-hosted checkout, and the result
 * comes back as a signed webhook.
 *
 * The access token is organisation-scoped and lives only on the server.
 */
type PolarClient = ReturnType<typeof createPolar>;

let cached: PolarClient | null = null;

export function polar(): PolarClient {
  if (cached) return cached;

  const accessToken = optionalEnv('POLAR_ACCESS_TOKEN');
  if (!accessToken) throw new Error('PAYMENTS_NOT_CONFIGURED');

  cached = createPolar({
    accessToken,
    environment: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
    timeout: 20,
  });

  return cached;
}

export function paymentsEnabled(): boolean {
  return Boolean(optionalEnv('POLAR_ACCESS_TOKEN')) && Boolean(optionalEnv('POLAR_WEBHOOK_SECRET'));
}

/** Resolves a catalogue entry's Polar product id from the environment. */
export function polarProductId(envKey: string): string | null {
  const value = process.env[envKey];
  return value && value.length > 0 ? value : null;
}

export type CheckoutLine = {
  /** Polar product id. */
  productId: string;
  /** Only for pay-what-you-want products, in minor units. */
  amount?: number;
};

export type CreateCheckoutInput = {
  lines: CheckoutLine[];
  reference: string;
  successUrl: string;
  customer: { email: string; name: string; externalId: string } | null;
  metadata: Record<string, string | number | boolean>;
  locale: string;
};

/**
 * Opens a hosted checkout and returns its URL.
 *
 * `reference` is echoed back in the webhook metadata, which is how a payment
 * is matched to the pending row written before the redirect. The amount for a
 * pay-what-you-want product is validated by the caller before it gets here.
 */
export async function createCheckout(input: CreateCheckoutInput): Promise<{ url: string; id: string }> {
  const client = polar();
  const [first] = input.lines;
  if (!first) throw new Error('CHECKOUT_EMPTY');

  const checkout = await client.checkouts.create({
    products: input.lines.map((line) => line.productId),
    ...(first.amount !== undefined ? { amount: first.amount } : {}),
    success_url: input.successUrl,
    metadata: { ...input.metadata, reference: input.reference },
    locale: input.locale,
    ...(input.customer
      ? {
          customer_email: input.customer.email,
          customer_name: input.customer.name,
          external_customer_id: input.customer.externalId,
        }
      : {}),
  });

  if (!checkout.url) throw new Error('CHECKOUT_NO_URL');
  return { url: checkout.url, id: checkout.id };
}

/**
 * Customer portal session, so a supporter can change or cancel a membership
 * without the team handling billing data.
 */
export async function createPortalSession(
  externalCustomerId: string,
  returnUrl: string,
): Promise<string | null> {
  try {
    const client = polar();
    const session = await client.customerSessions.create({
      external_customer_id: externalCustomerId,
      return_url: returnUrl,
    });
    return session.customer_portal_url;
  } catch (error) {
    console.error(
      '[polar] portal session failed: %s',
      error instanceof Error ? error.message : 'unknown',
    );
    return null;
  }
}
