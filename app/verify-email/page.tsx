import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { ResendVerificationForm } from '@/components/auth/password-forms';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Confirma tu correo',
  robots: { index: false, follow: false },
};

/**
 * Re-sends the account-confirmation e-mail.
 *
 * An unverified account cannot sign in at all (`emailAndPassword.
 * requireEmailVerification: true`), and `requestPasswordReset` does not
 * verify the address either - it only changes the password. Without this
 * page, a confirmation link that expired, bounced, or never sent (a provider
 * not configured yet) was a dead end with no way back in except an admin
 * editing the database by hand.
 */
export default async function VerifyEmailPage() {
  const { t } = await getContent();

  return (
    <AuthShell
      title={t.auth.verify.title}
      lead={t.auth.verify.lead}
      footer={
        <Link href="/login" className="font-medium text-accent">
          {t.auth.forgot.backToLogin}
        </Link>
      }
    >
      <ResendVerificationForm t={t} />
    </AuthShell>
  );
}
