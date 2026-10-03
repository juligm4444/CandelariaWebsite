'use client';

import { useTransition } from 'react';

import { setLocale } from '@/app/actions/locale';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Language toggle. Two states, so a single button that names the destination
 * language is clearer than a dropdown.
 */
export function LocaleSwitch({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === 'es' ? 'en' : 'es';

  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={() => startTransition(() => setLocale(next))}
      className={cn(
        'inline-flex min-h-12 items-center gap-1 rounded-pill border border-hairline px-2 text-base font-medium',
        'transition-colors duration-200 ease-brand hover:border-accent hover:text-accent',
        'disabled:opacity-60',
        className,
      )}
    >
      <span className={locale === 'es' ? 'text-ink' : 'text-ink-faint'}>ES</span>
      <span aria-hidden className="text-ink-faint">
        /
      </span>
      <span className={locale === 'en' ? 'text-ink' : 'text-ink-faint'}>EN</span>
    </button>
  );
}
