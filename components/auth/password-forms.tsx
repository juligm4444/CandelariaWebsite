'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormMessage, TextField } from '@/components/ui/field';
import { requestPasswordReset, resetPassword, sendVerificationEmail } from '@/lib/auth/client';
import type { Dictionary } from '@/lib/i18n/dictionary';

const MIN_PASSWORD = 12;

/**
 * Request a reset link.
 *
 * The confirmation is identical whether or not the address has an account.
 * Anything else turns this form into an account-enumeration oracle.
 */
export function ForgotPasswordForm({ t }: { t: Dictionary }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();

    await requestPasswordReset({ email, redirectTo: '/reset-password' }).catch(() => null);

    setSent(true);
    setPending(false);
  };

  if (sent) return <FormMessage tone="success">{t.auth.forgot.sent}</FormMessage>;

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
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.forgot.submitting : t.auth.forgot.submit}
      </Button>
    </form>
  );
}

/** Set a new password from a one-time token. */
export function ResetPasswordForm({ t, token }: { t: Dictionary; token: string | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!token) {
    return <FormMessage tone="error">{t.auth.reset.invalidLink}</FormMessage>;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');

    const errors: Record<string, string> = {};
    if (password.length < MIN_PASSWORD) errors.password = t.auth.register.errors.passwordShort;
    if (password !== confirm) errors.confirmPassword = t.auth.register.errors.passwordMismatch;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPending(true);
    const { error: authError } = await resetPassword({ newPassword: password, token });

    if (authError) {
      setError(
        authError.status === 400 ? t.auth.reset.invalidLink : t.auth.reset.errors.generic,
      );
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
    window.setTimeout(() => router.push('/login'), 1800);
  };

  if (done) return <FormMessage tone="success">{t.auth.reset.success}</FormMessage>;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        label={t.auth.reset.password}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD}
        helper={t.auth.register.passwordHint}
        error={fieldErrors.password}
        required
      />
      <TextField
        label={t.auth.reset.confirmPassword}
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        required
      />

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.reset.submitting : t.auth.reset.submit}
      </Button>
    </form>
  );
}

/**
 * Re-sends the account-confirmation e-mail.
 *
 * There is no session yet at this point (an unverified account cannot sign
 * in), so the form asks for the address rather than reading it from a
 * cookie. better-auth's own `/send-verification-email` endpoint already
 * answers identically whether or not that address has a pending account, on
 * a constant-time floor - the same enumeration-safety as the reset-password
 * form, built in, so this component does not need to re-implement it.
 */
export function ResendVerificationForm({ t }: { t: Dictionary }) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setState('idle');

    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();

    const { error } = await sendVerificationEmail({ email, callbackURL: '/profile' });

    setState(error ? 'error' : 'sent');
    setPending(false);
  };

  if (state === 'sent') return <FormMessage tone="success">{t.auth.verify.resent}</FormMessage>;

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

      {state === 'error' ? <FormMessage tone="error">{t.auth.verify.error}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.verify.resending : t.auth.verify.resend}
      </Button>
    </form>
  );
}
