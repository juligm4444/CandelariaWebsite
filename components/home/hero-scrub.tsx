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
import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { ButtonLink } from '@/components/ui/button';
import { markLite, readLiteHint } from '@/lib/device-profile';
import { FrameStore } from '@/lib/frame-sequence';
import type { Locale } from '@/lib/i18n/config';
import { trackLoad, untrackLoad } from '@/lib/load-progress';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/utils';

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
 * The work adapts to the device, in three steps, each one only when needed:
 * - Frame set: the smallest that fills the screen; the 4K set only with
 *   positive evidence of headroom (Safari reports no memory, so an older
 *   Retina Mac stays on 1920). A slow first decode steps 4K down to 1920.
 * - Lite mode: no blending between frames, no blur on the copy, a 1x canvas
 *   and fewer decodes at once. Entered from hardware hints, a slow first
 *   decode, or measured frame times while scrubbing; remembered for the
 *   session, and site-wide (lib/device-profile.ts), so the backgrounds and
 *   the falling light stand down with it.
 * - Static fallback (reduced motion, data saver, a 2G connection, no AVIF, or
 *   a device that cannot decode a frame in time): the section collapses to
 *   one screen with the poster image and the headline.
 * None of this touches the site loader's own timing.
 */

const FRAME_COUNT = 145;
// What the site loader waits for: the whole sequence (fetched coarse-first,
// so any prefix is an even sample of the clip). The loader stays up at least
// 5.2 s anyway, which on a normal connection is longer than the 1-3 MB of
// frames take, so this costs no time there; on a slow one the loader's own
// cap (7 s) stops the wait and the remaining frames keep streaming. Waiting
// for only a handful left the clip full of gaps if the reader scrolled at
// once, and the picture jumped between the few frames it had.
const COARSE_FRAMES = FRAME_COUNT;
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

/**
 * Decode budgets, in ms. The probe is the first decode, so it carries the
 * decoder's start-up cost and the thresholds leave room for it.
 */
const PROBE_STEP_DOWN_MS = 70; // 4K too slow: use the 1920 set.
const PROBE_LITE_MS = 160; // Keep scrubbing, but draw less.
const PROBE_STATIC_MS = 450; // Scrubbing would stutter whatever we do.
const DECODE_LITE_MS = 60; // Running average while scrubbing.
/** Average time between draws, while scrubbing, above which lite mode starts (~36 fps). */
const FRAME_LITE_MS = 28;
const FRAME_SAMPLES = 45;
/** Faster than this (frames per draw), a blend between frames cannot be seen. */
const BLEND_MAX_SPEED = 0.75;

/**
 * Streaks of sunlight falling towards the car: position across the stage,
 * sideways drift, length, opacity, duration and phase. Fixed, so server and
 * client agree, and spread so no two fall together.
 */
const PHOTONS = [
  { x: 18, dx: '3vw', len: 4, o: 0.5, d: 7.5, delay: -1.2 },
  { x: 27, dx: '2vw', len: 6, o: 0.7, d: 6.2, delay: -4.1 },
  { x: 34, dx: '4vw', len: 3, o: 0.45, d: 8.4, delay: -2.6 },
  { x: 41, dx: '1vw', len: 5, o: 0.65, d: 6.8, delay: -5.3 },
  { x: 47, dx: '-1vw', len: 7, o: 0.75, d: 5.9, delay: -0.4 },
  { x: 53, dx: '0vw', len: 4, o: 0.55, d: 7.1, delay: -3.4 },
  { x: 59, dx: '-2vw', len: 6, o: 0.7, d: 6.5, delay: -6.0 },
  { x: 66, dx: '-3vw', len: 3, o: 0.45, d: 8.0, delay: -1.9 },
  { x: 73, dx: '-2vw', len: 5, o: 0.6, d: 7.3, delay: -4.7 },
  { x: 81, dx: '-4vw', len: 4, o: 0.5, d: 6.9, delay: -2.2 },
];

type DeviceHints = { deviceMemory?: number; connection?: Connection };
type Connection = { saveData?: boolean; effectiveType?: string };

function pickTier(): Tier {
  if (window.matchMedia('(max-width: 767px)').matches) return 'sm';
  const { deviceMemory } = navigator as Navigator & DeviceHints;
  const cores = navigator.hardwareConcurrency;
  const pixels = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  // Positive evidence only: an unknown memory figure is not "enough memory".
  const roomy = deviceMemory !== undefined && deviceMemory >= 8 && cores !== undefined && cores >= 8;
  return pixels > 2200 && roomy ? 'xl' : 'lg';
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

const noopSubscribe = () => () => {};
/** Data saver on, or a connection too slow to stream the sequence. */
const readConstrained = () => {
  const connection = (navigator as Navigator & DeviceHints).connection;
  return Boolean(
    connection?.saveData || connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g',
  );
};
const serverConstrained = () => false;

// The device profile is read once per page load and kept, so a later render
// (a resize, the switch to lite mode) never swaps the frame set mid-scrub.
let cachedTier: Tier | null = null;
const readTier = (): Tier | null => (cachedTier ??= pickTier());
const serverTier = (): Tier | null => null;
let cachedLiteHint: boolean | null = null;
const readCachedLiteHint = () => (cachedLiteHint ??= readLiteHint());
const serverLiteHint = () => false;

/**
 * Where the clip sits on a portrait screen, and the alpha mask that feathers
 * it at top and bottom. Rebuilt only when the canvas or source size changes.
 */
type PortraitLayout = {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mask: CanvasGradient;
};

function portraitLayout(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
  cached: PortraitLayout | null,
): PortraitLayout {
  const key = `${width}x${height}:${bitmap.width}x${bitmap.height}`;
  if (cached?.key === key) return cached;
  const scale = (width / bitmap.width) * PORTRAIT_ZOOM;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const x = Math.round((width - w) / 2);
  const y = Math.round(height * 0.32 - h / 2);
  const mask = ctx.createLinearGradient(0, y, 0, y + h);
  mask.addColorStop(0, 'rgba(0, 0, 0, 0)');
  mask.addColorStop(0.24, 'rgba(0, 0, 0, 1)');
  mask.addColorStop(0.76, 'rgba(0, 0, 0, 1)');
  mask.addColorStop(1, 'rgba(0, 0, 0, 0)');
  return { key, x, y, w, h, mask };
}

/** Paints one or two frames: cover on landscape, framed and feathered on portrait. */
function paint(
  ctx: CanvasRenderingContext2D,
  base: ImageBitmap,
  next: ImageBitmap | null,
  fraction: number,
  width: number,
  height: number,
  layout: PortraitLayout | null,
) {
  if (!layout) {
    const scale = Math.max(width / base.width, height / base.height);
    const w = base.width * scale;
    const h = base.height * scale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    ctx.drawImage(base, x, y, w, h);
    if (next) {
      ctx.globalAlpha = fraction;
      ctx.drawImage(next, x, y, w, h);
      ctx.globalAlpha = 1;
    }
    return;
  }

  // Portrait: only the clip lives on this canvas (the ambient fill is its own
  // layer underneath), so the feather is one masking pass over the clip,
  // with no intermediate surface and no per-frame gradient.
  const { x, y, w, h, mask } = layout;
  ctx.clearRect(x, y, w, h);
  ctx.drawImage(base, x, y, w, h);
  if (next) {
    ctx.globalAlpha = fraction;
    ctx.drawImage(next, x, y, w, h);
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = mask;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Ambient fill behind the portrait clip: a centre crop of the frame at the
 * screen's own aspect, shrunk to a few pixels and stretched back up, under
 * the brand's purple veil. Matching the aspect keeps the blur round instead
 * of smearing it into vertical streaks. It is drawn into a quarter-resolution
 * canvas (the image is a blur, so nothing is lost) and only when the frame
 * index changes, not on every draw.
 */
function paintAmbient(ambient: HTMLCanvasElement, tiny: HTMLCanvasElement, bitmap: ImageBitmap) {
  const actx = ambient.getContext('2d');
  const tctx = tiny.getContext('2d');
  if (!actx || !tctx) return;
  const aspect = ambient.width / ambient.height;
  const tinyWidth = Math.max(4, Math.round(24 * aspect));
  if (tiny.width !== tinyWidth || tiny.height !== 24) {
    tiny.width = tinyWidth;
    tiny.height = 24;
  }
  const cropWidth = bitmap.height * aspect;
  tctx.drawImage(bitmap, (bitmap.width - cropWidth) / 2, 0, cropWidth, bitmap.height, 0, 0, tiny.width, tiny.height);
  actx.imageSmoothingQuality = 'high';
  actx.drawImage(tiny, 0, 0, ambient.width, ambient.height);
  actx.fillStyle = 'rgba(30, 10, 41, 0.55)';
  actx.fillRect(0, 0, ambient.width, ambient.height);
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
  const constrained = useSyncExternalStore(noopSubscribe, readConstrained, serverConstrained);
  const [failed, setFailed] = useState(false);
  const isStatic = Boolean(reduce) || constrained || failed;
  // Chosen on the client (it reads the screen and the device; null while
  // hydrating), and stepped down if the first decode shows 4K is too heavy.
  const deviceTier = useSyncExternalStore(noopSubscribe, readTier, serverTier);
  const [steppedDown, setSteppedDown] = useState(false);
  const tier: Tier | null = deviceTier === 'xl' && steppedDown ? 'lg' : deviceTier;
  const liteHint = useSyncExternalStore(noopSubscribe, readCachedLiteHint, serverLiteHint);
  const [measuredLite, setMeasuredLite] = useState(false);
  const lite = liteHint || measuredLite;

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientRef = useRef<HTMLCanvasElement>(null);
  const tinyRef = useRef<HTMLCanvasElement | null>(null);
  const storeRef = useRef<FrameStore | null>(null);
  const layoutRef = useRef<PortraitLayout | null>(null);
  const portraitRef = useRef(false);
  const ambientIndexRef = useRef(-1);
  const liteRef = useRef(false);
  const positionRef = useRef(0);
  const lastPositionRef = useRef(0);
  const rafRef = useRef(0);
  const timingRef = useRef({ last: 0, average: 0, samples: 0 });

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

  const goLite = () => {
    if (liteRef.current) return;
    liteRef.current = true;
    if (storeRef.current) storeRef.current.maxParallelDecodes = 2;
    // Site-wide: the backgrounds and effects on every page stand down too.
    markLite();
    setMeasuredLite(true);
  };

  /** Frame times while scrubbing; a device that cannot keep up goes lite. */
  const measure = (now: number) => {
    const timing = timingRef.current;
    const gap = now - timing.last;
    timing.last = now;
    // Only consecutive draws count: a pause in scrolling is not a slow frame.
    if (liteRef.current || gap <= 0 || gap > 100) return;
    timing.average = timing.samples ? timing.average + (gap - timing.average) * 0.1 : gap;
    timing.samples++;
    const decodeMs = storeRef.current?.decodeMs ?? 0;
    if (timing.samples >= FRAME_SAMPLES && (timing.average > FRAME_LITE_MS || decodeMs > DECODE_LITE_MS)) {
      goLite();
    }
  };

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame((now) => {
      rafRef.current = 0;
      const canvas = canvasRef.current;
      const store = storeRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !store || !ctx) return;
      measure(now);
      const last = store.count - 1;
      const position = Math.max(0, Math.min(last, positionRef.current));
      const speed = Math.abs(position - lastPositionRef.current);
      lastPositionRef.current = position;
      store.focus(position);

      // Blend the two neighbouring frames only when it can be seen and the
      // device has room for it; otherwise show the nearest frame.
      const blend = !liteRef.current && speed < BLEND_MAX_SPEED;
      const i0 = blend ? Math.floor(position) : Math.round(position);
      const fraction = blend ? position - i0 : 0;
      const base = store.frame(i0);
      if (!base) return;
      // A stand-in base (the exact frame is still decoding) is not blended:
      // mixing it with i0 + 1 would show two frames that are not neighbours.
      const next =
        fraction > 0.02 && store.exact(i0) === base ? store.exact(Math.min(last, i0 + 1)) : null;

      const portrait = portraitRef.current;
      const layout = portrait ? portraitLayout(ctx, base, canvas.width, canvas.height, layoutRef.current) : null;
      layoutRef.current = layout;
      paint(ctx, base, next && next !== base ? next : null, fraction, canvas.width, canvas.height, layout);

      const ambient = ambientRef.current;
      if (portrait && ambient && ambientIndexRef.current !== i0) {
        ambientIndexRef.current = i0;
        paintAmbient(ambient, (tinyRef.current ??= document.createElement('canvas')), base);
        if (!ambient.dataset.ready) ambient.dataset.ready = '';
      }
      if (!canvas.dataset.ready) canvas.dataset.ready = '';
    });
  };

  useMotionValueEvent(progress, 'change', (value) => {
    positionRef.current = value * (FRAME_COUNT - 1);
    schedule();
  });
  // The same request, for the effects below (frame arrivals, resizes).
  const redraw = useEffectEvent(() => schedule());

  // The draw loop reads lite mode from a ref; keep it in step (one-way).
  useEffect(() => {
    if (lite) liteRef.current = true;
  }, [lite]);

  // Frames: load, register with the site loader, draw as they arrive.
  useEffect(() => {
    if (isStatic || !tier) return;
    const urls = Array.from(
      { length: FRAME_COUNT },
      (_, i) => `${FRAMES}/${tier}/${String(i).padStart(3, '0')}.avif`,
    );
    const store = new FrameStore(urls, TIER_WINDOW[tier]);
    if (liteRef.current) store.maxParallelDecodes = 2;
    storeRef.current = store;
    const report = trackLoad('hero-frames', 3);
    // Any frame in the window may be closer than the stand-in on screen, so
    // a finished decode anywhere near the position repaints.
    store.onFrameReady = (index) => {
      if (Math.abs(index - positionRef.current) <= TIER_WINDOW[tier] + 1) redraw();
    };
    store.onProbe = (ms) => {
      if (tier === 'xl' && ms > PROBE_STEP_DOWN_MS) {
        // Hand over to the 1920 set; this store stops here.
        storeRef.current = null;
        store.dispose();
        setSteppedDown(true);
        return;
      }
      // Collapsing the section only while the reader is still at the top, so
      // nothing moves under them; further down, draw less instead.
      if (ms > PROBE_STATIC_MS && window.scrollY < 1) {
        storeRef.current = null;
        store.dispose();
        setFailed(true);
        return;
      }
      if (ms > PROBE_LITE_MS) goLite();
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
  }, [isStatic, tier]);

  // Canvas backing size: device pixels, capped at what the source can fill,
  // and at 1x in lite mode.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ambient = ambientRef.current;
    if (!canvas || !ambient || isStatic || !tier) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const sourceWidth = TIER_WIDTH[tier];
      const portrait = width / height < 0.9;
      const drawnWidth = portrait ? width * PORTRAIT_ZOOM : Math.max(width, (height * 16) / 9);
      const ceiling = lite ? 1 : 2;
      const scale = Math.max(1, Math.min(window.devicePixelRatio || 1, ceiling, sourceWidth / drawnWidth));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      portraitRef.current = portrait;
      layoutRef.current = null;
      ambient.hidden = !portrait;
      if (portrait) {
        ambient.width = Math.max(4, Math.round(width / 4));
        ambient.height = Math.max(4, Math.round(height / 4));
        ambientIndexRef.current = -1;
      }
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [isStatic, tier, lite]);

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

        {/* Ambient fill for portrait screens, under the clip. Hidden on
            landscape, where the clip covers the whole stage. */}
        <canvas
          ref={ambientRef}
          aria-hidden
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[ready]:opacity-100"
        />

        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[ready]:opacity-100"
        />

        {/* Sunlight falling towards the car (CSS only; see .cdl-photons). */}
        {!isStatic && !lite ? (
          <div aria-hidden className="cdl-photons">
            {PHOTONS.map((photon, index) => (
              <i
                key={index}
                className="cdl-photon"
                style={
                  {
                    '--x': `${photon.x}%`,
                    '--dx': photon.dx,
                    '--len': `${photon.len}rem`,
                    '--o': photon.o,
                    '--d': `${photon.d}s`,
                    '--delay': `${photon.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ) : null}

        {/* Legibility veils: the brand's 60% purple scrim, as gradients. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-morado-300/85 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-morado-300 via-morado-300/55 to-transparent" />

        {/* Stage 1: headline. */}
        <motion.div
          style={isStatic ? undefined : lite ? { opacity: introOpacity, y: introY } : { opacity: introOpacity, y: introY, filter: introFilter }}
          className="gutter absolute inset-x-0 bottom-0 mx-auto w-full max-w-[120rem] pb-[6rem] md:pb-[7.5rem]"
        >
          <div className="flex max-w-[44rem] flex-col items-start gap-4">
            <p
              data-intro=""
              style={{ '--i': 0 } as React.CSSProperties}
              className={cn(
                'hidden rounded-pill border border-neutro-100/32 px-3 py-1 text-base text-neutro-100/85 sm:block',
                // Without the blur, a denser fill keeps the same legibility.
                lite ? 'bg-morado-300/60' : 'bg-morado-300/40 backdrop-blur-sm',
              )}
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
                className={cn(
                  'border-neutro-100/40 text-neutro-100',
                  lite ? 'bg-morado-300/60' : 'bg-morado-300/30 backdrop-blur-sm',
                )}
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
