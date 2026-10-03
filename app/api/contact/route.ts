import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendMail } from '@/lib/email/resend';
import { contactEmail } from '@/lib/email/templates';
import { optionalEnv } from '@/lib/env';
import { clientIdentifier, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Contact form.
 *
 * The topic selects which inbox label the message carries, from a fixed list,
 * so the form cannot be used to address an arbitrary recipient. The body is
 * escaped before it reaches the HTML mail, and the visitor's address goes in
 * `Reply-To` rather than `From`, which keeps the domain's sending reputation
 * out of a stranger's hands.
 */
const TOPICS = ['general', 'rrhh', 'comite', 'prensa'] as const;

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  topic: z.enum(TOPICS),
  message: z.string().trim().min(20).max(4000),
  // Honeypot. A real person never fills a field they cannot see.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const inbox = optionalEnv('CONTACT_INBOX');
  if (!inbox) return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });

  const identifier = await clientIdentifier();
  const limit = await rateLimit('contact', identifier, { window: 3600, max: 5 });
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
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });

  // A filled honeypot gets the same success response a human sees, so a bot
  // learns nothing from the outcome.
  if (parsed.data.website) return NextResponse.json({ sent: true });

  const mail = contactEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    topic: parsed.data.topic,
    message: parsed.data.message,
  });

  try {
    await sendMail({ to: inbox, replyTo: parsed.data.email, ...mail });
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: 'FAILED' }, { status: 502 });
  }
}
