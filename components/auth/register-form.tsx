'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormMessage, TextField } from '@/components/ui/field';
import { signUp } from '@/lib/auth/client';
import type { Dictionary } from '@/lib/i18n/dictionary';

const MIN_PASSWORD = 12;

/** Rejects the handful of shapes that make a 12-character password worthless. */
function weakPassword(password: string, name: string, email: string): boolean {
  const lower = password.toLowerCase();
  if (/^(.)\1+$/.test(password)) return true;
  if (lower.includes('candelaria') || lower.includes('password') || lower.includes('contrasena')) {
    return true;
  }
  const local = email.split('@')[0]?.toLowerCase();
  if (local && local.length > 3 && lower.includes(local)) return true;
  const firstName = name.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstName && firstName.length > 3 && lower.includes(firstName)) return true;
  return false;
}

export function RegisterForm({ t }: { t: Dictionary }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirmPassword') ?? '');

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = t.auth.register.errors.nameRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = t.auth.register.errors.emailInvalid;
    }
    if (password.length < MIN_PASSWORD) errors.password = t.auth.register.errors.passwordShort;
    else if (weakPassword(password, name, email)) {
      errors.password = t.auth.register.errors.passwordWeak;
    }
    if (password !== confirm) errors.confirmPassword = t.auth.register.errors.passwordMismatch;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPending(true);
    const { error: authError } = await signUp.email({ name, email, password });

    if (authError) {
      setError(
        authError.status === 422 || authError.status === 409
          ? t.auth.register.errors.emailTaken
          : t.auth.register.errors.generic,
      );
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
  };

  if (done) {
    return <FormMessage tone="success">{t.auth.register.success}</FormMessage>;
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        label={t.auth.register.name}
        name="name"
        autoComplete="name"
        placeholder={t.auth.register.namePlaceholder}
        error={fieldErrors.name}
        required
      />

      <TextField
        label={t.auth.register.email}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t.auth.login.emailPlaceholder}
        helper={t.auth.register.externalNotice}
        error={fieldErrors.email}
        required
      />

      <TextField
        label={t.auth.register.password}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD}
        helper={t.auth.register.passwordHint}
        error={fieldErrors.password}
        required
      />

      <TextField
        label={t.auth.register.confirmPassword}
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        required
      />

      {error ? <FormMessage tone="error">{error}</FormMessage> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.auth.register.submitting : t.auth.register.submit}
      </Button>
    </form>
  );
}
