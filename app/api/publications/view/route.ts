import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordPublicationView } from '@/lib/db/publications';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Counts a read of a publication, sent by a beacon from the detail page.
 *
 * The count only ranks "lo más leído", so it is cheap and approximate on
 * purpose: one read per visitor address and publication every six hours
 * (through the shared database limiter), crawlers ignored, and every answer
 * is an empty 204 so the endpoint tells a caller nothing. The slug is checked
 * against its format and travels to SQL only as a bound parameter.
 */
const schema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,160}$/) });

const CRAWLER = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  if (CRAWLER.test(request.headers.get('user-agent') ?? '')) return done();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return done();
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return done();

  const { slug } = parsed.data;
  const identifier = await clientIdentifier();
  const limit = await rateLimit(`pub-view:${slug}`, identifier, { window: 6 * 3600, max: 1 });
  if (!limit.allowed) return done();

  await recordPublicationView(slug).catch((error: unknown) => {
    console.error('[publications] view not recorded: %s', error instanceof Error ? error.message : error);
  });
  return done();
}
