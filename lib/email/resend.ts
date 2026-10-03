import 'server-only';

import { Resend } from 'resend';

import { optionalEnv } from '@/lib/env';

/**
 * Transactional e-mail through Resend.
 *
 * When `RESEND_API_KEY` is absent the send is skipped and logged instead of
 * throwing, so local development never blocks on mail delivery. In production
 * the missing key is surfaced as an error log, because a silently dropped
 * password-reset mail is the exact failure the previous stack shipped with.
 */
let client: Resend | null = null;

function resend(): Resend | null {
  const key = optionalEnv('RESEND_API_KEY');
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

export type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, text, replyTo }: MailInput): Promise<void> {
  const service = resend();
  const from = process.env.RESEND_FROM ?? 'Candelaria Solar Car <no-reply@candelaria.website>';

  if (!service) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[email] RESEND_API_KEY is not set; message to %s was not sent', to);
    } else {
      console.warn('[email] skipped (no RESEND_API_KEY). Subject: %s', subject);
    }
    return;
  }

  const { error } = await service.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    // The address is logged, never the body: reset links are credentials.
    console.error('[email] delivery failed for %s: %s', to, error.message);
    throw new Error('EMAIL_DELIVERY_FAILED');
  }
}
