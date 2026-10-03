import 'server-only';

import { PostHog } from 'posthog-node';

import { optionalEnv } from '@/lib/env';

/**
 * Server-side event capture, for things the browser cannot see: a settled
 * payment, a role transfer, a published entry.
 *
 * Property values are chosen explicitly at the call site. Never spread a
 * request body or a database row in here: amounts and ids are fine, e-mails
 * and tokens are not.
 */
let client: PostHog | null = null;

function posthog(): PostHog | null {
  const key = optionalEnv('POSTHOG_API_KEY') ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  client ??= new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, string | number | boolean> = {},
): Promise<void> {
  const service = posthog();
  if (!service) return;

  try {
    service.capture({ distinctId, event, properties });
    await service.flush();
  } catch (error) {
    console.error(
      '[analytics] capture failed for %s: %s',
      event,
      error instanceof Error ? error.message : 'unknown',
    );
  }
}
