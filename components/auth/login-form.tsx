'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormMessage, TextField } from '@/components/ui/field';
import { signIn } from '@/lib/auth/client';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { safeRedirectPath } from '@/lib/utils';

export function LoginForm({ t, next }: { t: Dictionary; next: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setUnverified(false);

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    const { error: authError } = await signIn.email({ email, password });

    if (authError) {
      // The same message for a wrong address and a wrong password: telling
      // them apart turns the form into an account-enumeration oracle.
      const code = authError.status;
      setError(
        code === 429
          ? t.auth.login.errors.tooMany
          : code === 403
            ? t.auth.login.errors.unverified
            : t.auth.login.errors.invalid,
      );
      setUnverified(code === 403);
      setPending(false);
      return;
    }

    router.push(safeRedirectPath(next, '/profile'));
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        label={t.auth.login.email}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.auth.login.emailPlaceholder}
        required
      />

      <TextField
        label={t.auth.login.password}
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={t.auth.login.passwordPlaceholder}
        required
      />

      {error ? (
        <FormMessage tone="error">
          {error}
          {unverified ? (
            <>
              {' '}
              <Link href="/verify-email" className="font-medium underline">
                {t.auth.verify.resend}
              </Link>
            </>
          ) : null}
        </FormMessage>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.login.submitting : t.auth.login.submit}
      </Button>

      <Link href="/forgot-password" className="text-base font-medium text-accent">
        {t.auth.login.forgot}
      </Link>
    </form>
  );
}
