import Link from 'next/link';

import { AreaMark } from '@/components/brand/lockup';
import type { Area } from '@/content/areas';
import type { Locale } from '@/lib/i18n/config';

/**
 * Area card. The area colour appears only as the top bar and the label, which
 * is the accent-only rule from the brand manual (§3), and the area name is
 * always next to its mark.
 */
export function AreaCard({
  area,
  locale,
  memberCount,
  href,
}: {
  area: Area;
  locale: Locale;
  memberCount?: number;
  href?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: area.accent }}
      />
      <AreaMark src={area.isotipo} name={area.name[locale]} size={56} className="-ml-3.5" />
      <h3 className="mt-2 font-titulo text-2xl font-bold">{area.name[locale]}</h3>
      <p className="mt-2 text-base text-ink-muted">{area.brief[locale]}</p>
      {memberCount !== undefined ? (
        <p className="mt-auto pt-3 text-base font-medium" style={{ color: area.label }}>
          {memberCount}
        </p>
      ) : null}
    </>
  );

  const shell =
    'relative flex h-full flex-col overflow-hidden rounded-block border border-hairline bg-surface p-4 md:p-5';

  if (!href) {
    return <article className={shell}>{body}</article>;
  }

  return (
    <Link
      href={href}
      className={`${shell} transition-colors duration-200 ease-brand hover:border-hairline-strong hover:bg-surface-raised`}
    >
      {body}
    </Link>
  );
}
