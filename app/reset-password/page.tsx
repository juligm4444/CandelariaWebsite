import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/password-forms';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nueva contraseña',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getContent();
  const params = await searchParams;

  const raw = params.token;
  const candidate = Array.isArray(raw) ? raw[0] : raw;

  // The token is only ever handed to better-auth. It is validated for shape
  // here so a malformed value renders the "ask for a new link" state instead
  // of being echoed anywhere.
  const token = candidate && /^[A-Za-z0-9._-]{16,512}$/.test(candidate) ? candidate : null;

  return (
    <AuthShell
      title={t.auth.reset.title}
      lead={t.auth.reset.lead}
      footer={
        <Link href="/login" className="font-medium text-accent">
          {t.auth.forgot.backToLogin}
        </Link>
      }
    >
      <ResetPasswordForm t={t} token={token} />
    </AuthShell>
  );
}
