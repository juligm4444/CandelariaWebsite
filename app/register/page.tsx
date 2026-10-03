import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { getCurrentUser } from '@/lib/auth/session';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const { t } = await getContent();

  const user = await getCurrentUser().catch(() => null);
  if (user) redirect('/profile');

  return (
    <AuthShell
      title={t.auth.register.title}
      lead={t.auth.register.lead}
      footer={
        <>
          {t.auth.register.hasAccount}{' '}
          <Link href="/login" className="font-medium text-accent">
            {t.auth.register.loginLink}
          </Link>
        </>
      }
    >
      <RegisterForm t={t} />
    </AuthShell>
  );
}
