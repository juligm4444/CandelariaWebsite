import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/password-forms';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Restablecer la contraseña',
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const { t } = await getContent();

  return (
    <AuthShell
      title={t.auth.forgot.title}
      lead={t.auth.forgot.lead}
      footer={
        <Link href="/login" className="font-medium text-accent">
          {t.auth.forgot.backToLogin}
        </Link>
      }
    >
      <ForgotPasswordForm t={t} />
    </AuthShell>
  );
}
