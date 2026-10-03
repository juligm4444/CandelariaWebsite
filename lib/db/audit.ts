import 'server-only';

import { headers } from 'next/headers';

import { query } from './client';

export type AuditSeverity = 'info' | 'warning' | 'critical';

/**
 * Append-only record of sensitive actions: role changes, revocations,
 * publication deletions, payment settlements, blocked authorisation attempts.
 *
 * Details are explicit at the call site. Never pass a whole request body: it
 * can carry passwords, tokens or card data.
 */
export async function audit(input: {
  actorId: string | null;
  action: string;
  target?: string | null;
  severity?: AuditSeverity;
  details?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get('x-forwarded-for');
    const candidate = forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || null;

    // `x-forwarded-for` is attacker-controlled. Anything that is not a plain
    // address is dropped, so the `::inet` cast cannot fail the insert and the
    // audit row is still written.
    const ip = candidate && /^[0-9a-fA-F:.]{3,45}$/.test(candidate) ? candidate : null;

    await query(
      `insert into audit_log (actor_id, action, target, severity, ip_address, details)
       values ($1, $2, $3, $4, $5::inet, $6::jsonb)`,
      [
        input.actorId,
        input.action,
        input.target ?? null,
        input.severity ?? 'info',
        ip,
        JSON.stringify(input.details ?? {}),
      ],
    );
  } catch (error) {
    // Auditing must never break the action it is recording, but a failure to
    // record has to be visible in the platform logs.
    console.error(
      '[audit] failed to record %s: %s',
      input.action,
      error instanceof Error ? error.message : 'unknown',
    );
  }
}
