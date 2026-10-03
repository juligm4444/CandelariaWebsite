import 'server-only';

import { query, queryOne } from './client';

export type ContributionKind = 'subscription';
export type ContributionStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'canceled';

export type Contribution = {
  id: string;
  kind: ContributionKind;
  amount: number;
  currency: string;
  status: ContributionStatus;
  reference: string;
  description: string | null;
  createdAt: string;
};

export type Membership = {
  id: string;
  tierId: 'cobre' | 'aluminio' | 'titanio';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string | null;
  createdAt: string;
};

export type SupporterStats = {
  totalContributed: number;
  monthsSubscribed: number;
  score: number;
  tier: 'visitor' | 'supporter' | 'bronze' | 'silver' | 'gold' | 'core';
};

export async function listContributions(userId: string): Promise<Contribution[]> {
  return query<Contribution>(
    `select id, kind, amount::int as amount, currency, status, reference, description,
            to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') as "createdAt"
       from contributions
      where user_id = $1
      order by created_at desc
      limit 200`,
    [userId],
  );
}

export async function getActiveMembership(userId: string): Promise<Membership | null> {
  return queryOne<Membership>(
    `select id,
            tier_id as "tierId",
            status,
            to_char(current_period_end, 'YYYY-MM-DD"T"HH24:MI:SSOF') as "currentPeriodEnd",
            to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') as "createdAt"
       from memberships
      where user_id = $1 and status = 'active'
      limit 1`,
    [userId],
  );
}

export async function getSupporterStats(userId: string): Promise<SupporterStats> {
  const row = await queryOne<SupporterStats>(
    `select total_contributed::int as "totalContributed",
            months_subscribed      as "monthsSubscribed",
            score::int             as score,
            tier
       from supporter_stats
      where user_id = $1`,
    [userId],
  );

  return row ?? { totalContributed: 0, monthsSubscribed: 0, score: 0, tier: 'visitor' };
}

/**
 * Records an intent before the visitor leaves for Polar, so a successful
 * payment always has a local row to reconcile against, even if the webhook
 * arrives before the browser comes back.
 */
export async function createPendingContribution(input: {
  userId: string | null;
  kind: ContributionKind;
  amount: number;
  currency: string;
  reference: string;
  description: string | null;
  checkoutId: string | null;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `insert into contributions
       (user_id, kind, amount, currency, status, reference, description, polar_checkout_id, metadata)
     values ($1, $2, $3, $4, 'pending', $5, $6, $7, $8::jsonb)
     returning id`,
    [
      input.userId,
      input.kind,
      input.amount,
      input.currency.toUpperCase(),
      input.reference,
      input.description,
      input.checkoutId,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
  if (!row) throw new Error('CONTRIBUTION_INSERT_FAILED');
  return row.id;
}

/** Settles a contribution from a verified webhook. Idempotent by reference. */
export async function settleContribution(input: {
  reference: string;
  status: ContributionStatus;
  orderId: string | null;
  amount?: number;
  currency?: string;
  userId?: string | null;
}): Promise<void> {
  await query(
    `update contributions
        set status         = $2,
            polar_order_id = coalesce($3, polar_order_id),
            amount         = coalesce($4::bigint, amount),
            currency       = coalesce($5, currency),
            user_id        = coalesce(user_id, $6)
      where reference = $1
        and status <> 'succeeded'`,
    [
      input.reference,
      input.status,
      input.orderId,
      input.amount ?? null,
      input.currency?.toUpperCase() ?? null,
      input.userId ?? null,
    ],
  );
}

export async function upsertMembership(input: {
  userId: string;
  tierId: string;
  status: Membership['status'];
  polarSubscriptionId: string;
  currentPeriodEnd: string | null;
}): Promise<void> {
  await query(
    `insert into memberships
       (user_id, tier_id, status, polar_subscription_id, current_period_end)
     values ($1, $2, $3, $4, $5)
     on conflict (polar_subscription_id) do update
        set status             = excluded.status,
            tier_id            = excluded.tier_id,
            current_period_end = excluded.current_period_end`,
    [
      input.userId,
      input.tierId,
      input.status,
      input.polarSubscriptionId,
      input.currentPeriodEnd,
    ],
  );
}

/**
 * Claims a webhook delivery. Returns false when the provider event id was
 * already stored, which is the replay guard: the primary key does the work.
 */
export async function claimWebhookEvent(
  providerEventId: string,
  eventType: string,
  payloadDigest: string,
): Promise<boolean> {
  const row = await queryOne<{ provider_event_id: string }>(
    `insert into payment_webhook_events (provider_event_id, event_type, payload_digest)
     values ($1, $2, $3)
     on conflict (provider_event_id) do nothing
     returning provider_event_id`,
    [providerEventId, eventType, payloadDigest],
  );
  return row !== null;
}

export async function markWebhookProcessed(providerEventId: string): Promise<void> {
  await query(
    `update payment_webhook_events set processed_at = now() where provider_event_id = $1`,
    [providerEventId],
  );
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    `select "id" from "user" where lower("email") = lower($1)`,
    [email],
  );
  return row?.id ?? null;
}
