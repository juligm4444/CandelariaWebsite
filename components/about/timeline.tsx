'use client';

import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef } from 'react';

import { MediaFrame } from '@/components/ui/media-frame';
import type { MediaSlot } from '@/content/media';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Vertical timeline of the group's milestones.
 *
 * A track runs down the middle (down the left edge on phones). As the reader
 * scrolls, a gold line fills it, and each node lights up when the line
 * reaches it. On wide screens the entries alternate sides, with the photo of
 * the milestone opposite its text.
 *
 * Content never depends on script: entries and images reveal through
 * scroll-driven CSS (`.cdl-tl-enter`, `.cdl-tl-clip`) and are visible by
 * default. The line and the lit nodes are the only script, and under reduced
 * motion the line is simply full and every node lit.
 */

export type TimelineEntry = {
  when: string;
  title: string;
  body: string;
  upcoming?: boolean;
  media: MediaSlot;
};

export function Timeline({
  entries,
  locale,
  imagePending,
  nextLabel,
}: {
  entries: TimelineEntry[];
  locale: Locale;
  imagePending: string;
  nextLabel: string;
}) {
  const reduce = usePrefersReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([]);
  const positions = useRef<number[]>([]);

  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 60%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Where each node sits along the list, as a fraction of its height.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const height = list.offsetHeight || 1;
      positions.current = nodeRefs.current.map((node) => (node ? (node.offsetTop + 32) / height : 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const light = (value: number) => {
    nodeRefs.current.forEach((node, index) => {
      if (!node) return;
      const lit = reduce || value >= (positions.current[index] ?? 1) - 0.01;
      if (lit) node.setAttribute('data-lit', '');
      else node.removeAttribute('data-lit');
    });
  };
  useMotionValueEvent(progress, 'change', light);
  useEffect(() => light(progress.get()));

  return (
    <ol ref={listRef} className="relative flex flex-col gap-9 md:gap-15">
      {/* Track and fill. */}
      <span aria-hidden className="absolute bottom-0 left-5 top-0 w-px bg-hairline lg:left-1/2" />
      <motion.span
        aria-hidden
        className="absolute left-5 top-0 h-full w-0.5 -translate-x-1/4 origin-top rounded-full lg:left-1/2"
        style={{
          scaleY: reduce ? 1 : progress,
          background: 'linear-gradient(to bottom, var(--color-dorado-100), var(--color-dorado-200) 85%, transparent)',
        }}
      />

      {entries.map((entry, index) => {
        const flip = index % 2 === 1;
        return (
          <li
            key={entry.when + entry.title}
            ref={(node) => {
              nodeRefs.current[index] = node;
            }}
            data-upcoming={entry.upcoming ? '' : undefined}
            className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-5 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] lg:gap-x-0"
          >
            {/* Node on the line. */}
            <span
              aria-hidden
              className={cn(
                'cdl-tl-node relative z-10 col-start-1 row-start-1 mt-5 size-4 justify-self-center rounded-full border-2 border-hairline-strong bg-canvas lg:col-start-2',
                entry.upcoming && 'border-dashed',
              )}
            />

            {/* Text. */}
            <div
              className={cn(
                'cdl-tl-enter col-start-2 row-start-1 flex flex-col gap-2',
                flip ? 'lg:col-start-3 lg:pl-7' : 'lg:col-start-1 lg:items-end lg:pr-7 lg:text-right',
              )}
              style={{ '--tl-from': flip ? '48px' : '-48px' } as React.CSSProperties}
            >
              <p className="flex items-baseline gap-3">
                <span
                  className={cn(
                    'font-titulo text-[3rem] leading-none font-bold tabular-nums md:text-[4rem]',
                    entry.upcoming ? 'text-ink-faint' : 'text-accent',
                  )}
                >
                  {entry.when}
                </span>
                {entry.upcoming ? (
                  <span className="rounded-pill border border-dashed border-hairline-strong px-2 py-0.5 text-base text-ink-muted">
                    {nextLabel}
                  </span>
                ) : null}
              </p>
              <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{entry.title}</h3>
              <p className="max-w-[48ch] text-base text-ink-muted">{entry.body}</p>
            </div>

            {/* Photo of the milestone, on the opposite side. */}
            <div
              className={cn(
                'cdl-tl-clip col-start-2 row-start-2 md:col-start-3 md:row-start-1 md:self-center',
                flip ? 'lg:col-start-1 lg:pr-7' : 'lg:col-start-3 lg:pl-7',
              )}
            >
              <MediaFrame
                slot={entry.media}
                locale={locale}
                pendingLabel={imagePending}
                sizes="(min-width: 1024px) 40vw, 90vw"
                rgb={entry.upcoming ? '166 52 218' : '255 185 56'}
                className={cn('aspect-[4/3] w-full', entry.upcoming && 'border-dashed')}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
