import { en } from '@/content/en';
import { es, type Dictionary } from '@/content/es';

import type { Locale } from './config';

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };

/**
 * Replaces `{{token}}` placeholders. Values are injected as plain text by React,
 * so there is no interpolation path that can produce markup.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

/** Picks the singular or plural form of a `{ one, other }` pair. */
export function plural(
  forms: { one: string; other: string },
  count: number,
): string {
  return count === 1 ? forms.one : fill(forms.other, { count });
}
