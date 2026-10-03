import { webhooks } from '@polar-sh/sdk/2026-10';
import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

import { tierById, type MembershipTierId } from '@/content/catalog';
import { captureServerEvent } from '@/lib/analytics/server';
import { audit } from '@/lib/db/audit';
import {
  claimWebhookEvent,
  findUserIdByEmail,
  markWebhookProcessed,
  settleContribution,
  upsertMembership,
  type ContributionStatus,
} from '@/lib/db/commerce';
import { optionalEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Polar webhook receiver.
 *
 * Three guards, in order:
 *  1. the signature is verified against the raw body before anything is parsed,
 *  2. the provider event id is claimed in the database, so a replayed delivery
 *     is a primary-key conflict rather than a second settlement,
 *  3. settlement is idempotent at the SQL level (`status <> 'succeeded'`).
 *
 * Failures return 4xx without a body. A webhook response is an unauthenticated
 * channel and must not describe internal state.
 */
export async function POST(request: Request) {
  const secret = optionalEnv('POLAR_WEBHOOK_SECRET');
  if (!secret) return new NextResponse(null, { status: 503 });

  const raw = await request.text();

  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  };

  let event: Awaited<ReturnType<typeof webhooks.validateEvent>>;
  try {
    event = await webhooks.validateEvent(raw, headers, secret);
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError) {
      await audit({
        actorId: null,
        action: 'webhook.signature_invalid',
        severity: 'critical',
        details: { provider: 'polar' },
      });
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, { status: 400 });
  }

  const eventId = headers['webhook-id'] || `${event.type}:${event.timestamp}`;
  const digest = createHash('sha256').update(raw).digest('hex');

  const claimed = await claimWebhookEvent(eventId, event.type, digest);
  if (!claimed) {
    // Already handled. Acknowledge so the provider stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handle(event);
    await markWebhookProcessed(eventId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(
      '[polar] handling %s failed: %s',
      event.type,
      error instanceof Error ? error.message : 'unknown',
    );
    // A 500 makes Polar retry. The claim row stays, so the retry is a no-op
    // unless the event id changes, which is the conservative trade: a missed
    // settlement is recoverable by hand, a double settlement is not.
    return new NextResponse(null, { status: 500 });
  }
}

type PolarEvent = Awaited<ReturnType<typeof webhooks.validateEvent>>;

async function handle(event: PolarEvent): Promise<void> {
  switch (event.type) {
    case 'order.paid':
      await settleOrder(event.data, 'succeeded');
      break;

    case 'order.refunded':
      await settleOrder(event.data, 'refunded');
      break;

    case 'subscription.active':
    case 'subscription.created':
    case 'subscription.cycled':
    case 'subscription.uncanceled':
      await syncSubscription(event.data, 'active');
      break;

    case 'subscription.past_due':
      await syncSubscription(event.data, 'past_due');
      break;

    case 'subscription.canceled':
    case 'subscription.revoked':
      await syncSubscription(event.data, 'canceled');
      break;

    default:
      // Everything else is acknowledged and ignored on purpose.
      break;
  }
}

function readReference(metadata: Record<string, unknown> | null | undefined): string | null {
  const value = metadata?.reference;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

async function settleOrder(
  order: Extract<PolarEvent, { type: 'order.paid' }>['data'],
  status: ContributionStatus,
): Promise<void> {
  const reference = readReference(order.metadata) ?? readReference(order.subscription?.metadata);
  if (!reference) {
    await audit({
      actorId: null,
      action: 'webhook.order_without_reference',
      target: order.id,
      severity: 'warning',
      details: { provider: 'polar' },
    });
    return;
  }

  // The e-mail is only used to resolve the order to the account that paid.
  // It is never written anywhere else.
  const userId = order.customer?.email ? await findUserIdByEmail(order.customer.email) : null;

  await settleContribution({
    reference,
    status,
    orderId: order.id,
    amount: order.total_amount,
    currency: order.currency,
    userId,
  });

  await audit({
    actorId: userId,
    action: `contribution.${status}`,
    target: reference,
    details: { amount: order.total_amount, currency: order.currency },
  });

  if (userId && status === 'succeeded') {
    await captureServerEvent('contribution_settled', userId, {
      amount: order.total_amount,
      currency: order.currency,
    });
  }
}

async function syncSubscription(
  subscription: Extract<PolarEvent, { type: 'subscription.active' }>['data'],
  status: 'active' | 'canceled' | 'past_due',
): Promise<void> {
  const email = subscription.customer?.email;
  const userId = email ? await findUserIdByEmail(email) : null;

  if (!userId) {
    await audit({
      actorId: null,
      action: 'webhook.subscription_without_account',
      target: subscription.id,
      severity: 'warning',
      details: { provider: 'polar' },
    });
    return;
  }

  const metadataTier = subscription.metadata?.tierId;
  const tierId =
    typeof metadataTier === 'string' && tierById.has(metadataTier as MembershipTierId)
      ? (metadataTier as MembershipTierId)
      : 'aluminio';

  await upsertMembership({
    userId,
    tierId,
    status,
    polarSubscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_period_end ?? null,
  });

  await audit({
    actorId: userId,
    action: `membership.${status}`,
    target: subscription.id,
    details: { tierId },
  });
}
