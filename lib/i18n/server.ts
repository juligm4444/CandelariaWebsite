import 'server-only';

import { cookies } from 'next/headers';

import { LOCALE_COOKIE, resolveLocale, type Locale } from './config';
import { getDictionary, type Dictionary } from './dictionary';

/** Reads the visitor's language preference from its cookie. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getContent(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
