'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';

/**
 * Switches the interface language.
 *
 * The value is validated against the locale list before it is written, so the
 * cookie can only ever hold `es` or `en`. It is deliberately not `httpOnly`:
 * it is a display preference, not a credential.
 */
export async function setLocale(next: string): Promise<void> {
  if (!isLocale(next)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, next satisfies Locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/', 'layout');
}
