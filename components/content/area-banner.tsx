import { IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Area } from '@/content/areas';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Photographic banner for one area, linking to it on the Team page.
 *
 * Every banner is the same shape whatever its copy (the aspect ratio is set
 * on the frame, and the copy sits on top of the photo), so a row of them
 * always balances. The photo carries the manual's 60% Morado 300 veil where
 * text sits on it (§2.5).
 *
 * Interaction, all light and no shadow:
 * - Hover (fine pointer only): the photo pushes in, the veil lifts, a halo in
 *   the area's own colour follows the pointer, the accent bar grows down the
 *   edge, the isotipo turns a few degrees (the mark's "Ciclo") and the call
 *   to action lights up.
 * - Press: the usual ripple, which is the only feedback on touch.
 * - Scroll: the photo drifts against the frame as the banner crosses the
 *   viewport, on every device, so phones get movement without hover.
 */
export function AreaBanner({
  area,
  locale,
  href,
  body,
  cta,
  index,
  className,
}: {
  area: Area;
  locale: Locale;
  href: string;
  body: string;
  cta: string;
  /** Position in the row, shown as "01". */
  index?: number;
  className?: string;
}) {
  const name = area.name[locale];

  return (
    <Link
      href={href}
      data-light=""
      data-ripple=""
      className={cn(
        'cdl-light cdl-light-edge cdl-press group relative isolate flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-block border border-hairline bg-surface sm:aspect-[16/10] lg:aspect-[3/4]',
        className,
      )}
      style={
        {
          '--cdl-light-rgb': area.rgb,
          '--cdl-light-alpha': '0.34',
          '--cdl-light-size': '420px',
        } as React.CSSProperties
      }
    >
      {area.cover ? (
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <Image
            src={area.cover.src}
            alt={area.cover.alt[locale]}
            fill
            sizes="(min-width: 1024px) 31vw, 100vw"
            className="cdl-parallax scale-110 object-cover transition-[scale,filter] duration-[900ms] ease-out-ui group-hover:scale-[1.18] group-hover:saturate-[1.15]"
          />
        </div>
      ) : null}

      {/* Veil: dense under the copy, light at the top so the photo reads. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-morado-300)_8%,rgb(30_10_41/0.6)_48%,rgb(30_10_41/0.18)_100%)] transition-opacity duration-500 ease-out-ui group-hover:opacity-80"
      />

      {/* Accent bar: a strip along the top that runs down the left edge on hover. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: area.accent }} />
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 transition-transform duration-500 ease-out-ui group-hover:scale-y-100"
        style={{ backgroundColor: area.accent }}
      />

      <div className="flex items-center justify-between gap-3 p-4 md:p-5">
        <span className="inline-flex size-14 items-center justify-center rounded-pill bg-morado-300/60 backdrop-blur-sm">
          <Image
            src={area.isotipo}
            alt=""
            width={40}
            height={40}
            className="size-10 transition-[rotate] duration-700 ease-out-ui group-hover:rotate-[18deg]"
          />
        </span>
        {index !== undefined ? (
          <span className="font-titulo text-2xl font-bold text-neutro-100/56 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 p-4 transition-[translate] duration-500 ease-out-ui group-hover:-translate-y-1 md:p-5">
        <h3
          className="font-titulo text-[2rem] leading-none font-bold md:text-[2.5rem]"
          style={{ color: area.label }}
        >
          {name}
        </h3>
        {/* Three lines reserved at desktop, so the names line up across a row. */}
        <p className="max-w-[40ch] text-base text-neutro-100 lg:min-h-[4.8em]">{body}</p>
        <span className="inline-flex min-h-12 items-center gap-2 self-start text-base font-medium text-dorado-100 transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_14px_rgb(255_185_56/0.5)]">
          {cta}
          <IconArrowRight
            className="icon-brand size-5 transition-[translate] duration-300 ease-out-ui group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
