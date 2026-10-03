import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an amount in minor units (cents) for display. */
export function formatMoney(minorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: currency.toUpperCase() === 'COP' ? 0 : 2,
  }).format(minorUnits / 100);
}

export function formatDate(value: string | Date, locale: string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Only same-origin, path-like redirect targets are accepted. Anything that
 * could leave the site (absolute URL, protocol-relative `//evil.com`, or a
 * backslash variant) collapses to the given fallback.
 */
export function safeRedirectPath(candidate: string | null | undefined, fallback = '/'): string {
  if (!candidate) return fallback;
  const value = candidate.trim();
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (value.includes('\\')) return fallback;
  return value;
}
