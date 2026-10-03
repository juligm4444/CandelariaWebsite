import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth/session';
import { getContent } from '@/lib/i18n/server';
import { safeRedirectPath } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { t } = await getContent();
  const params = await searchParams;

  const raw = params.next;
  const next = safeRedirectPath(Array.isArray(raw) ? raw[0] : raw, '/profile');

  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(next);

  return (
    <AuthShell
      title={t.auth.login.title}
      lead={t.auth.login.lead}
      footer={
        <>
          {t.auth.login.noAccount}{' '}
          <Link href="/register" className="font-medium text-accent">
            {t.auth.login.registerLink}
          </Link>
        </>
      }
    >
      <LoginForm t={t} next={next} />
    </AuthShell>
  );
}
