'use client';

import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { ButtonLink } from '@/components/ui/button';
import { FrameStore } from '@/lib/frame-sequence';
import type { Locale } from '@/lib/i18n/config';
import { trackLoad, untrackLoad } from '@/lib/load-progress';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Home hero: the concept render of the car, scrubbed by scroll.
 *
 * The section is 340vh tall with a sticky 100dvh stage. Scroll progress
 * (Motion's useScroll, no scroll listeners) runs through a light spring and
 * selects a fractional frame; the two neighbouring frames are blended by the
 * fraction, so motion stays fluid between the 145 source frames and reverses
 * exactly when scrolling back up. Frames come from lib/frame-sequence, which
 * keeps only a small decoded window in memory.
 *
 * Copy appears in stages, the way car launch pages present a model: the
 * headline, then the race the car is built for, then three figures from the
 * spec sheet counting up with scroll. The figures are provisional and say so.
 *
 * Static fallback (reduced motion, data saver, no AVIF): the section collapses
 * to one screen with the poster image and the headline.
 */

const FRAME_COUNT = 145;
// What the site loader waits for: first, last, middle and quarter frames,
// enough to scrub the whole clip coarsely. The rest stream in afterwards.
const COARSE_FRAMES = 5;
const FRAMES = '/hero/v2';
// The car fills ~40% of the frame width, so portrait screens zoom in on it.
const PORTRAIT_ZOOM = 1.9;

/**
 * Source sizes of the sequence. The render is 4K; each screen takes the
 * smallest set that still fills it at device pixels, because a decoded 4K
 * frame is ~33 MB and only a handful may live in memory at once.
 */
type Tier = 'sm' | 'lg' | 'xl';
const TIER_WIDTH: Record<Tier, number> = { sm: 960, lg: 1920, xl: 3840 };
const TIER_WINDOW: Record<Tier, number> = { sm: 7, lg: 5, xl: 3 };

function pickTier(): Tier {
  if (window.matchMedia('(max-width: 767px)').matches) return 'sm';
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const pixels = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return pixels > 2200 && (memory === undefined || memory >= 4) ? 'xl' : 'lg';
}

export type HeroSpec = { label: string; value: number; unit: string; fractionDigits: number };

export type HeroCopy = {
  badge: string;
  title: string;
  lead: string;
  primary: string;
  secondary: string;
  routeTitle: string;
  routeBody: string;
  specsNote: string;
  specsCta: string;
  caption: string;
};

type Connection = { saveData?: boolean };
const noopSubscribe = () => () => {};
const readSaveData = () =>
  Boolean((navigator as Navigator & { connection?: Connection }).connection?.saveData);
const serverSaveData = () => false;

/** Offscreen surfaces reused across frames (never allocated per draw). */
type Scratch = { ambient: HTMLCanvasElement; feather: HTMLCanvasElement };

/** Paints `bitmap` into the canvas: cover on landscape, framed on portrait. */
function paint(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  alpha: number,
  scratch: Scratch,
) {
  ctx.globalAlpha = alpha;
  const portrait = width / height < 0.9;
  if (!portrait) {
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, (width - w) / 2, (height - h) / 2, w, h);
    ctx.globalAlpha = 1;
    return;
  }

  // Ambient fill: a centre crop of the frame at the screen's own aspect,
  // shrunk to a few pixels and stretched back up. Matching the aspect keeps
  // the blur round instead of smearing it into vertical streaks.
  const { ambient, feather } = scratch;
  const actx = ambient.getContext('2d');
  if (actx) {
    ambient.height = 24;
    ambient.width = Math.max(4, Math.round(24 * (width / height)));
    const cropWidth = bitmap.height * (width / height);
    actx.drawImage(bitmap, (bitmap.width - cropWidth) / 2, 0, cropWidth, bitmap.height, 0, 0, ambient.width, ambient.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(ambient, 0, 0, width, height);
    ctx.fillStyle = 'rgba(30, 10, 41, 0.55)';
    ctx.fillRect(0, 0, width, height);
  }

  // The framed clip, feathered at top and bottom with a real alpha mask so
  // it dissolves into the ambient fill instead of ending on a hard line.
  const scale = (width / bitmap.width) * PORTRAIT_ZOOM;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const x = (width - w) / 2;
  const y = height * 0.32 - h / 2;
  const fctx = feather.getContext('2d');
  if (!fctx) return;
  if (feather.width !== w || feather.height !== h) {
    feather.width = w;
    feather.height = h;
  }
  fctx.globalCompositeOperation = 'source-over';
  fctx.clearRect(0, 0, w, h);
  fctx.drawImage(bitmap, 0, 0, w, h);
  fctx.globalCompositeOperation = 'destination-in';
  const mask = fctx.createLinearGradient(0, 0, 0, h);
  mask.addColorStop(0, 'rgba(0, 0, 0, 0)');
  mask.addColorStop(0.24, 'rgba(0, 0, 0, 1)');
  mask.addColorStop(0.76, 'rgba(0, 0, 0, 1)');
  mask.addColorStop(1, 'rgba(0, 0, 0, 0)');
  fctx.fillStyle = mask;
  fctx.fillRect(0, 0, w, h);
  fctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(feather, x, y);
  ctx.globalAlpha = 1;
}

function SpecFigure({
  spec,
  progress,
  locale,
  animated,
}: {
  spec: HeroSpec;
  progress: MotionValue<number>;
  locale: Locale;
  animated: boolean;
}) {
  const format = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
        minimumFractionDigits: spec.fractionDigits,
        maximumFractionDigits: spec.fractionDigits,
      }),
    [locale, spec.fractionDigits],
  );
  const count = useTransform(progress, [0.62, 0.8], [0, spec.value], { clamp: true });
  const text = useTransform(count, (value) => format.format(value));
  const final = `${format.format(spec.value)} ${spec.unit}`;

  return (
    <div className="flex flex-col gap-1 border-t border-neutro-100/24 pt-3">
      <dt className="text-base leading-snug text-neutro-100/80">{spec.label}</dt>
      <dd
        aria-label={final}
        className="font-titulo text-2xl font-bold text-neutro-100 tabular-nums sm:text-[2rem] md:text-[2.5rem]"
      >
        <span aria-hidden>
          {animated ? <motion.span>{text}</motion.span> : format.format(spec.value)}
          <span className="ml-1 text-base text-dorado-100 sm:text-2xl">{spec.unit}</span>
        </span>
      </dd>
    </div>
  );
}

export function HeroScrub({
  copy,
  specs,
  provisional,
  locale,
}: {
  copy: HeroCopy;
  specs: HeroSpec[];
  provisional: boolean;
  locale: Locale;
}) {
  const reduce = usePrefersReducedMotion();
  const saveData = useSyncExternalStore(noopSubscribe, readSaveData, serverSaveData);
  const [failed, setFailed] = useState(false);
  const isStatic = Boolean(reduce) || saveData || failed;

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storeRef = useRef<FrameStore | null>(null);
  const scratchRef = useRef<Scratch | null>(null);
  const positionRef = useRef(0);
  const rafRef = useRef(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.5, restDelta: 0.0005 });

  // Past the hero: the header gets its solid background back.
  const { scrollYProgress: exit } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  useMotionValueEvent(exit, 'change', (value) => {
    const over = value < 0.97;
    const root = document.documentElement;
    if (over && !('overHero' in root.dataset)) root.dataset.overHero = '';
    if (!over && 'overHero' in root.dataset) delete root.dataset.overHero;
  });
  useEffect(() => {
    document.documentElement.dataset.overHero = '';
    return () => {
      delete document.documentElement.dataset.overHero;
    };
  }, []);

  // Staged copy.
  const introOpacity = useTransform(progress, [0, 0.1, 0.2], [1, 1, 0]);
  const introY = useTransform(progress, [0, 0.2], [0, -56]);
  const introBlur = useTransform(progress, [0.08, 0.2], [0, 10]);
  const introFilter = useMotionTemplate`blur(${introBlur}px)`;
  const routeOpacity = useTransform(progress, [0.26, 0.34, 0.5, 0.58], [0, 1, 1, 0]);
  const routeY = useTransform(progress, [0.26, 0.34, 0.5, 0.58], [40, 0, 0, -40]);
  const specsOpacity = useTransform(progress, [0.62, 0.7], [0, 1]);
  const specsY = useTransform(progress, [0.62, 0.72], [40, 0]);

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const canvas = canvasRef.current;
      const store = storeRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !store || !ctx) return;
      const last = store.count - 1;
      const position = Math.max(0, Math.min(last, positionRef.current));
      store.focus(position);
      const i0 = Math.floor(position);
      const fraction = position - i0;
      const base = store.frame(i0);
      if (!base) return;
      const scratch = (scratchRef.current ??= {
        ambient: document.createElement('canvas'),
        feather: document.createElement('canvas'),
      });
      paint(ctx, base, canvas.width, canvas.height, 1, scratch);
      const next = fraction > 0.02 ? store.exact(Math.min(last, i0 + 1)) : null;
      if (next && next !== base) paint(ctx, next, canvas.width, canvas.height, fraction, scratch);
      if (!canvas.dataset.ready) canvas.dataset.ready = '';
    });
  };

  useMotionValueEvent(progress, 'change', (value) => {
    positionRef.current = value * (FRAME_COUNT - 1);
    schedule();
  });

  // Frames: load, register with the site loader, draw as they arrive.
  useEffect(() => {
    if (isStatic) return;
    const set = pickTier();
    const urls = Array.from(
      { length: FRAME_COUNT },
      (_, i) => `${FRAMES}/${set}/${String(i).padStart(3, '0')}.avif`,
    );
    const store = new FrameStore(urls, TIER_WINDOW[set]);
    storeRef.current = store;
    const report = trackLoad('hero-frames', 3);
    store.onFrameReady = (index) => {
      if (Math.abs(index - positionRef.current) <= 1.5) schedule();
    };
    store.load(COARSE_FRAMES, report).then((ok) => {
      if (!ok && storeRef.current === store) {
        report(1);
        setFailed(true);
      }
    });
    return () => {
      untrackLoad('hero-frames');
      store.dispose();
      if (storeRef.current === store) storeRef.current = null;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [isStatic]);

  // Canvas backing size: device pixels, capped at what the source can fill.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isStatic) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const sourceWidth = TIER_WIDTH[pickTier()];
      const portrait = width / height < 0.9;
      const drawnWidth = portrait ? width * PORTRAIT_ZOOM : Math.max(width, (height * 16) / 9);
      const scale = Math.max(1, Math.min(window.devicePixelRatio || 1, 2, sourceWidth / drawnWidth));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      schedule();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [isStatic]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="inicio"
      data-static={isStatic ? '' : undefined}
      className="relative -mt-[4.5rem] h-[340vh] bg-morado-300 data-[static]:h-[100dvh] motion-reduce:h-[100dvh]"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* Poster: first frame, painted by the browser before any script. */}
        <picture>
          <source media="(max-width: 767px)" type="image/avif" srcSet={`${FRAMES}/poster-sm.avif`} />
          <source media="(max-width: 767px)" type="image/webp" srcSet={`${FRAMES}/poster-sm.webp`} />
          <source type="image/avif" srcSet={`${FRAMES}/poster-lg.avif`} />
          <img
            src={`${FRAMES}/poster-lg.webp`}
            alt={copy.caption}
            fetchPriority="high"
            decoding="async"
            className="cdl-hero-poster"
          />
        </picture>

        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[ready]:opacity-100"
        />

        {/* Legibility veils: the brand's 60% purple scrim, as gradients. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-morado-300/85 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-morado-300 via-morado-300/55 to-transparent" />

        {/* Stage 1: headline. */}
        <motion.div
          style={isStatic ? undefined : { opacity: introOpacity, y: introY, filter: introFilter }}
          className="gutter absolute inset-x-0 bottom-0 mx-auto w-full max-w-[120rem] pb-[6rem] md:pb-[7.5rem]"
        >
          <div className="flex max-w-[44rem] flex-col items-start gap-4">
            <p
              data-intro=""
              style={{ '--i': 0 } as React.CSSProperties}
              className="hidden rounded-pill border border-neutro-100/32 bg-morado-300/40 px-3 py-1 text-base text-neutro-100/85 backdrop-blur-sm sm:block"
            >
              {copy.badge}
            </p>
            <h1
              id="inicio"
              data-intro=""
              style={{ '--i': 1 } as React.CSSProperties}
              className="text-balance-tight text-[2.5rem] text-neutro-100 sm:text-[3.5rem] lg:text-[4.5rem]"
            >
              {copy.title}
            </h1>
            <p
              data-intro=""
              style={{ '--i': 2 } as React.CSSProperties}
              className="max-w-[40ch] text-base text-neutro-100/85 md:text-[1.5rem] md:leading-[1.45]"
            >
              {copy.lead}
            </p>
            <div data-intro="" style={{ '--i': 3 } as React.CSSProperties} className="flex flex-wrap gap-2 pt-1">
              <ButtonLink href="/vehicle" variant="accent" size="lg" magnetic>
                {copy.primary}
                <IconArrowRight className="icon-brand size-5" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/about"
                variant="secondary"
                size="lg"
                className="border-neutro-100/40 bg-morado-300/30 text-neutro-100 backdrop-blur-sm"
              >
                {copy.secondary}
              </ButtonLink>
            </div>
          </div>
        </motion.div>

        {!isStatic ? (
          <>
            {/* Stage 2: the race. */}
            <motion.div
              style={{ opacity: routeOpacity, y: routeY }}
              className="gutter pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[120rem] pb-15 md:top-[22%] md:bottom-auto md:justify-end md:pb-0"
            >
              <div className="relative isolate max-w-[26rem] md:text-right">
                {/* The manual's purple veil behind text on a busy image, as a
                    soft radial pool so it reads as light falloff, not a box. */}
                <div
                  aria-hidden
                  className="absolute -inset-x-20 -inset-y-16 -z-10"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgb(30 10 41 / 0.72), rgb(30 10 41 / 0.4) 55%, transparent)',
                  }}
                />
                <h2 className="text-balance-tight text-[2rem] text-neutro-100 md:text-[3rem]">{copy.routeTitle}</h2>
                <p className="mt-3 text-base text-neutro-100/85 md:text-[1.5rem] md:leading-[1.45]">{copy.routeBody}</p>
              </div>
            </motion.div>

            {/* Stage 3: figures. */}
            <motion.div
              style={{ opacity: specsOpacity, y: specsY }}
              className="gutter absolute inset-x-0 bottom-0 mx-auto w-full max-w-[120rem] pb-15"
            >
              <dl className="grid grid-cols-3 gap-3 sm:gap-7">
                {specs.map((spec) => (
                  <SpecFigure key={spec.label} spec={spec} progress={progress} locale={locale} animated />
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {provisional ? <p className="text-base text-neutro-100/72">* {copy.specsNote}</p> : <span />}
                <Link
                  href="/vehicle#especificaciones"
                  data-light=""
                  className="cdl-link inline-flex min-h-12 items-center gap-2 text-base font-medium text-dorado-100"
                >
                  <span>{copy.specsCta}</span>
                  <IconArrowRight className="icon-brand cdl-link-arrow size-5" aria-hidden />
                </Link>
              </div>
            </motion.div>

            {/* Scrub progress: a thread of gold along the bottom edge. */}
            <motion.div
              aria-hidden
              style={{ scaleX: progress }}
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-dorado-100"
            />
          </>
        ) : null}

        <p className="gutter pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-full max-w-[120rem] text-base leading-snug text-neutro-100/60 md:text-right">
          {copy.caption}
        </p>
      </div>
    </section>
  );
}
