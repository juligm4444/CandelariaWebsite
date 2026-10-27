'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Where the money goes, as a legend and a donut that answer each other.
 *
 * Pointing at a row lifts its slice out of the ring, dims the
 * others and writes its share in the centre; pointing at a slice does the
 * same for its row. The ring draws itself the first time it comes into view.
 *
 * The legend is the accessible version (each row is a real list item with its
 * share as text); the donut is decorative and hidden from assistive tech.
 * Under reduced motion the ring is drawn from the start and nothing slides.
 */

type Slice = { title: string; body: string; share: number; color: string };

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export function AllocationChart({
  slices,
  provisionalMark,
  centreLabel,
}: {
  slices: Slice[];
  /** Appended to every share, e.g. "*" pointing at the provisional note. */
  provisionalMark: string;
  /** Shown in the centre when nothing is selected. */
  centreLabel: string;
}) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const drawn = reduce || seen;
  const [active, setActive] = useState<number | null>(null);

  const starts = slices.map((_, index) =>
    slices.slice(0, index).reduce((sum, slice) => sum + (slice.share / 100) * CIRCUMFERENCE, 0),
  );
  const current = active === null ? null : slices[active];

  return (
    <div ref={ref} className="grid items-center gap-7 lg:grid-cols-[7fr_5fr] lg:gap-9">
      <ul className="flex flex-col border-t border-hairline">
        {slices.map((slice, index) => (
          <li
            key={slice.title}
            onPointerEnter={() => setActive(index)}
            onPointerLeave={() => setActive(null)}
            data-light=""
            className={cn(
              'cdl-light grid cursor-default grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 border-b border-hairline px-2 py-4 transition-opacity duration-300',
              active !== null && active !== index && 'opacity-50',
            )}
            style={{ '--cdl-light-alpha': '0.14', '--cdl-light-rgb': '166 52 218' } as React.CSSProperties}
          >
            <span
              aria-hidden
              className={cn(
                'mt-2 size-3 shrink-0 rounded-full transition-[scale] duration-300 ease-out-ui',
                active === index && 'scale-150',
              )}
              style={{ backgroundColor: slice.color }}
            />
            <h3 className="font-titulo text-2xl font-bold">{slice.title}</h3>
            <span className="font-titulo text-2xl font-bold tabular-nums">
              {slice.share}%{provisionalMark}
            </span>
            <p className="col-start-2 col-end-4 text-base text-ink-muted sm:col-end-3">{slice.body}</p>
          </li>
        ))}
      </ul>

      <div aria-hidden className="relative mx-auto size-64 md:size-80">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90 overflow-visible">
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--cdl-border)" strokeWidth="28" />
          {slices.map((slice, index) => {
            const length = Math.max(0, (slice.share / 100) * CIRCUMFERENCE - GAP);
            // Direction of the slice's middle, to push it out of the ring.
            const middle = ((starts[index] ?? 0) + length / 2) / RADIUS;
            const lifted = active === index;
            return (
              <motion.circle
                key={slice.title}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={lifted ? 34 : 28}
                strokeDashoffset={-(starts[index] ?? 0)}
                initial={false}
                animate={{
                  strokeDasharray: drawn ? `${length} ${CIRCUMFERENCE}` : `0 ${CIRCUMFERENCE}`,
                  opacity: active === null || lifted ? 1 : 0.35,
                  x: lifted ? Math.cos(middle) * 6 : 0,
                  y: lifted ? Math.sin(middle) * 6 : 0,
                }}
                transition={{
                  strokeDasharray: { duration: reduce ? 0 : 1.1, delay: reduce ? 0 : index * 0.18, ease: [0.77, 0, 0.175, 1] },
                  default: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
                }}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                className="cursor-default transition-[stroke-width] duration-300"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-titulo text-[3rem] leading-none font-bold tabular-nums text-ink">
            {current ? `${current.share}%` : '100%'}
          </span>
          <span className="mt-1 max-w-[10ch] text-base text-ink-muted">{current ? current.title : centreLabel}</span>
        </div>
      </div>
    </div>
  );
}
