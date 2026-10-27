'use client';

import { IconArrowRight, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * The log's mini hero: the newest entry, alternating on its own with the most
 * read one.
 *
 * The timer is the CSS animation of the active tab's progress bar; when it
 * ends, the next entry shows. Pausing is therefore just
 * `animation-play-state`, and it happens on hover, while focus is inside, and
 * with the pause button (WCAG 2.2.2). Under reduced motion the bar does not
 * run, so nothing changes by itself and the tabs switch by hand. Each entry
 * is a plain link, so the whole block works without script.
 */

const INTERVAL_S = 8;

export type FeaturedItem = {
  key: string;
  tab: string;
  href: string;
  title: string;
  abstract: string;
  date: string;
  /** "312 lecturas", or null. */
  meta: string | null;
  areaName: string;
  areaLabel: string;
  areaRgb: string;
  cover: string | null;
};

export function FeaturedRotator({
  items,
  labels,
}: {
  items: FeaturedItem[];
  labels: { region: string; read: string; pause: string; play: string };
}) {
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState({ hover: false, focus: false, user: false });
  const paused = hold.hover || hold.focus || hold.user;
  const item = items[active] ?? items[0];
  if (!item) return null;
  const rotates = items.length > 1;

  return (
    <section
      aria-label={labels.region}
      aria-roledescription="carousel"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHold((h) => ({ ...h, hover: true }));
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHold((h) => ({ ...h, hover: false }));
      }}
      onFocus={() => setHold((h) => ({ ...h, focus: true }))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHold((h) => ({ ...h, focus: false }));
        }
      }}
      className="relative flex flex-col overflow-hidden rounded-block border border-hairline bg-surface"
    >
      {rotates ? (
        <div className="flex items-stretch border-b border-hairline">
          <div role="tablist" aria-label={labels.region} className="grid flex-1 grid-cols-2">
            {items.map((entry, index) => {
              const selected = index === active;
              return (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="bitacora-destacado"
                  onClick={() => setActive(index)}
                  data-light=""
                  className="cdl-light cdl-nav-item relative flex min-h-14 items-center px-4 text-left text-base font-medium"
                >
                  {entry.tab}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-hairline">
                    {selected ? (
                      <span
                        key={`${entry.key}-${active}`}
                        className="block h-full origin-left bg-dorado-100"
                        style={{
                          animation: reduce ? undefined : `cdl-progress ${INTERVAL_S}s linear forwards`,
                          animationPlayState: paused ? 'paused' : 'running',
                          transform: reduce ? undefined : 'scaleX(0)',
                        }}
                        onAnimationEnd={() => setActive((current) => (current + 1) % items.length)}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label={hold.user ? labels.play : labels.pause}
            title={hold.user ? labels.play : labels.pause}
            onClick={() => setHold((h) => ({ ...h, user: !h.user }))}
            data-light=""
            className="cdl-light cdl-press inline-flex w-14 shrink-0 items-center justify-center border-l border-hairline text-ink-muted hover:text-accent motion-reduce:hidden"
          >
            {hold.user ? (
              <IconPlayerPlay className="icon-brand size-5" aria-hidden />
            ) : (
              <IconPlayerPause className="icon-brand size-5" aria-hidden />
            )}
          </button>
        </div>
      ) : null}

      <div id="bitacora-destacado" role={rotates ? 'tabpanel' : undefined} aria-live={paused ? 'polite' : 'off'} className="relative grid">
        {/* Invisible copies of every entry share the cell, so the block is
            always as tall as its tallest entry and nothing below it jumps
            when the entries change. */}
        {rotates
          ? items.map((entry) => (
              <div key={`size-${entry.key}`} aria-hidden inert className="invisible [grid-area:1/1]">
                <Entry entry={entry} readLabel={labels.read} />
              </div>
            ))
          : null}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={item.key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="[grid-area:1/1]"
          >
            <Entry entry={item} readLabel={labels.read} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Entry({ entry, readLabel }: { entry: FeaturedItem; readLabel: string }) {
  return (
    <Link
      href={entry.href}
      data-light=""
      data-ripple=""
      className="cdl-light group grid h-full gap-0 md:grid-cols-[7fr_5fr]"
      style={{ '--cdl-light-rgb': entry.areaRgb, '--cdl-light-alpha': '0.14' } as React.CSSProperties}
    >
      <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-80 lg:min-h-[26rem]">
        {entry.cover ? (
          <Image
            src={entry.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-cover transition-[scale] duration-700 ease-out-ui group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-end p-4"
            style={{
              background: `radial-gradient(90% 90% at 30% 20%, rgb(${entry.areaRgb} / 0.35), transparent 70%), linear-gradient(160deg, var(--color-morado-100), var(--color-morado-300))`,
            }}
          >
            <span className="font-titulo text-[3rem] font-bold text-neutro-100/20 md:text-[4rem]">
              {entry.areaName}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-3 p-4 md:p-7">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base">
          <span className="font-medium uppercase" style={{ color: entry.areaLabel }}>
            {entry.areaName}
          </span>
          <span className="text-ink-faint">{entry.date}</span>
          {entry.meta ? <span className="text-ink-faint">· {entry.meta}</span> : null}
        </p>
        <h2 className="line-clamp-3 font-titulo text-2xl leading-tight font-bold text-ink md:text-[2rem]">
          {entry.title}
        </h2>
        <p className="line-clamp-3 text-base text-ink-muted">{entry.abstract}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-base font-medium text-accent">
          {readLabel}
          <IconArrowRight
            className="icon-brand size-5 transition-[translate] duration-300 ease-out-ui group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
