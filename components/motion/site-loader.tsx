'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';

import { trackedProgress } from '@/lib/load-progress';
import { cn } from '@/lib/utils';

/**
 * First-load screen. Adapted from Originkit's "Masthead Reveal" to the brand,
 * and long enough (at least MIN_TIME_S) to be read, not just glimpsed:
 * - a deep purple panel with the brand halo, over a faint grid of solar
 *   cells that a band of gold light sweeps across;
 * - the isotipo inside two rings: a gold one that fills with real loading
 *   progress, and seven arcs in the area colours that light up one by one
 *   until they close the circle (the mark's "Ciclo": seven areas, one cycle);
 * - the name set in Sansation Bold rising letter by letter, "SOLAR CAR" in
 *   gold under it, exactly as the lockup pairs them;
 * - the three attributes of the isotipo (Ciclo, Facetas, Dirección), one at
 *   a time, beside the counter;
 * - the four values along the foot of the screen.
 * On reveal the letters leave upward and the panel wipes off the page with a
 * line of gold light riding its edge. The isotipo itself is never lit or
 * glowed (manual §2.6): only the rings and the type move.
 *
 * Two layers of motion, so the screen is never blank:
 * - CSS runs the entrance from the very first paint (mark, letters, rule),
 *   before any script has arrived. On a slow connection that is seconds.
 * - Once hydrated, the script takes over: progress, counter and the exit.
 *   Every element has an outer wrapper the script moves and an inner one the
 *   CSS entrance animates, so the two never fight over the same property.
 *
 * Progress is real: the minimum of the document's readiness and every task
 * registered through lib/load-progress (the home hero registers its first
 * frames). A seeded curve only paces the counter so it never jumps. Times are
 * measured from navigation start, so a fast load is not held back, and the
 * script stops waiting MAX_WAIT_S after it starts.
 *
 * Shown once per browser session; later full loads get a quick fade. Safety
 * nets: <noscript> hides it, and a CSS failsafe hides it after 10s whatever
 * happens to the script.
 */

const SEEN_KEY = 'cdl:intro-seen';
/**
 * Earliest reveal, from navigation start. Long enough for the whole sequence
 * (letters, the seven arcs, the three attributes) to be seen, per the team's
 * request that the intro be appreciable rather than a flash.
 */
const MIN_TIME_S = 5.2;
/** Longest the script waits for assets after it starts. */
const MAX_WAIT_S = 7;
const REVEAL_S = 1.1;
const TRAVEL = 130;
const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;

/** The seven area arcs: radius, and the angular gap between two arcs. */
const ARC_R = 54;
const ARC_GAP_DEG = 7;

/** SVG path of one arc of the area ring, centred on (60, 60), clockwise from 12 o'clock. */
function arcPath(index: number, total: number): string {
  const span = 360 / total;
  const start = ((index * span + ARC_GAP_DEG / 2 - 90) * Math.PI) / 180;
  const end = (((index + 1) * span - ARC_GAP_DEG / 2 - 90) * Math.PI) / 180;
  const x1 = 60 + ARC_R * Math.cos(start);
  const y1 = 60 + ARC_R * Math.sin(start);
  const x2 = 60 + ARC_R * Math.cos(end);
  const y2 = 60 + ARC_R * Math.sin(end);
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${ARC_R} ${ARC_R} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (x: number, a: number, b: number) => clamp((x - a) / Math.max(1e-6, b - a));
const inCubic = (x: number) => x * x * x;
const inOutQuart = (x: number) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uneven, chunked progress over `seconds`, the way real loading looks. */
function pacingCurve(seed: number, seconds: number): (t: number) => number {
  const random = seeded(seed);
  const k = Math.min(1, seconds / 4.4);
  const chunks: { size: number; start: number; len: number }[] = [];
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const size = 0.4 + random() * 1.2;
    chunks.push({ size, start: random() * 0.78 * seconds, len: (0.25 + random() * 0.9) * k });
    total += size;
  }
  chunks.push({ size: total * 0.12, start: seconds - 0.45 * k, len: 0.45 * k });
  total *= 1.12;
  return (t) => {
    if (t >= seconds) return 1;
    let p = 0;
    for (const c of chunks) {
      const x = clamp((t - c.start) / Math.max(1e-3, c.len));
      p += c.size * x * x * (3 - 2 * x);
    }
    return Math.min(0.999, p / total);
  };
}

/** Document readiness: images already requested, fonts, and the load event. */
function documentProgress(): number {
  if (document.readyState === 'complete') return 1;
  const images = document.images;
  let done = 0;
  for (let i = 0; i < images.length; i++) if (images[i]?.complete) done++;
  const fraction = images.length ? done / images.length : 1;
  const fonts = document.fonts?.status === 'loaded' ? 1 : 0;
  return Math.min(0.95, 0.15 + 0.6 * fraction + 0.2 * fonts);
}

export function SiteLoader({
  name,
  subtitle,
  caption,
  attributes,
  values,
  areaColors,
  loadingLabel,
}: {
  /** Display word, set letter by letter. */
  name: string;
  /** Second line of the lockup, in gold ("SOLAR CAR"). */
  subtitle: string;
  /** Institutional line at the foot of the screen. */
  caption: string;
  /** The isotipo's attributes, shown one at a time beside the counter. */
  attributes: { title: string; body: string }[];
  /** The group's values, along the foot of the screen. */
  values: string[];
  /** One colour per area, in order: the seven arcs of the ring. */
  areaColors: string[];
  /** Spoken while the screen is up. */
  loadingLabel: string;
}) {
  const chars = Array.from(name);
  const subChars = Array.from(subtitle);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = Array.from(name).length;
    const arcs = arcRefs.current.filter((el): el is SVGPathElement => el !== null);

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // Storage blocked (private mode, policy): treat as a first visit.
    }

    const finish = () => {
      root.style.visibility = 'hidden';
      root.style.pointerEvents = 'none';
      root.dataset.done = '';
      html.style.removeProperty('overflow');
      try {
        window.sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // Nothing to do: the sequence simply plays again next load.
      }
    };

    // Repeat load in the same session: a quick fade, no ceremony.
    if (seen) {
      const fade = root.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 260,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'forwards',
      });
      fade.finished.then(finish, finish);
      return () => fade.cancel();
    }

    html.dataset.intro = 'pending';
    html.style.overflow = 'hidden';

    const now = () => performance.now() / 1000;
    const startedAt = now();
    const loadS = reduce ? 0.6 : MIN_TIME_S;
    const revealS = reduce ? 0.35 : REVEAL_S;
    const curve = pacingCurve(7, loadS);

    let last = startedAt;
    let progress = 0;
    let revealAt = -1;
    let introStarted = false;
    let raf = 0;
    let lastDigits = '';

    const draw = (reveal: number) => {
      // Exit only: the entrance belongs to CSS (see .cdl-loader-* rules).
      const stagger = Math.min(0.035, 0.3 / count);
      for (let i = 0; i < count; i++) {
        const el = charRefs.current[i];
        if (!el) continue;
        const exit = reduce ? 0 : inCubic(seg(reveal, i * stagger, i * stagger + 0.32));
        el.style.transform = exit ? `translateY(${(-exit * TRAVEL).toFixed(2)}%)` : '';
      }

      const leave = seg(reveal, 0, 0.3);
      if (markRef.current) {
        markRef.current.style.opacity = String(1 - leave);
        markRef.current.style.transform = reduce ? '' : `translateY(${(-24 * leave).toFixed(2)}px)`;
      }
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_C * (1 - progress));
      // Each area arc draws itself in turn as progress passes its share.
      for (let i = 0; i < arcs.length; i++) {
        const lit = clamp(progress * arcs.length - i);
        const arc = arcs[i]!;
        arc.style.strokeDashoffset = String(1 - lit);
        arc.style.opacity = String(0.2 + 0.8 * lit);
      }
      if (ruleRef.current) ruleRef.current.style.transform = `scaleX(${progress})`;
      if (metaRef.current) metaRef.current.style.opacity = String(1 - seg(reveal, 0, 0.22));
      if (footRef.current) footRef.current.style.opacity = String(1 - seg(reveal, 0, 0.22));
      if (subRef.current) {
        subRef.current.style.opacity = String(1 - leave);
        subRef.current.style.transform = reduce ? '' : `translateY(${(-16 * leave).toFixed(2)}px)`;
      }
      const digits = String(Math.round(progress * 100)).padStart(3, '0');
      if (countRef.current && digits !== lastDigits) {
        countRef.current.textContent = digits;
        lastDigits = digits;
      }

      if (reduce) {
        root.style.opacity = String(1 - reveal);
        return;
      }
      const wipe = inOutQuart(seg(reveal, 0.3, 1));
      if (panelRef.current) panelRef.current.style.clipPath = `inset(0 0 ${(100 * wipe).toFixed(3)}% 0)`;
      if (edgeRef.current) {
        // transform, not `top`: moving a layout property would count as a
        // layout shift on every frame of the wipe.
        edgeRef.current.style.transform = `translateY(${(root.clientHeight * (1 - wipe)).toFixed(1)}px)`;
        edgeRef.current.style.opacity = wipe > 0 && wipe < 1 ? '1' : '0';
      }
    };

    const step = () => {
      const t = now();
      const dt = Math.min(0.05, t - last);
      last = t;

      if (revealAt < 0) {
        const waited = t - startedAt >= MAX_WAIT_S;
        const real = waited ? 1 : Math.min(documentProgress(), trackedProgress() ?? 1);
        const target = Math.min(curve(t), real);
        progress = target >= 1 ? 1 : Math.min(target, progress + dt * 1.5);
        if (progress >= 1 && t >= loadS) {
          revealAt = t;
          html.style.removeProperty('overflow');
        }
      }

      const reveal = revealAt < 0 ? 0 : clamp((t - revealAt) / revealS);
      // The page's own entrance starts while the panel is still wiping, so
      // the two read as one movement.
      if (revealAt >= 0 && !introStarted && reveal >= 0.35) {
        html.dataset.intro = 'run';
        introStarted = true;
      }

      draw(reveal);

      if (revealAt >= 0 && reveal >= 1) {
        if (!introStarted) html.dataset.intro = 'run';
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      try {
        step();
      } catch (error) {
        // Never leave the page covered or unscrollable because of a bug here.
        console.error('[loader] aborted: %s', error instanceof Error ? error.message : error);
        html.dataset.intro = 'run';
        finish();
      }
    };

    draw(0);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      html.style.removeProperty('overflow');
    };
  }, [name]);

  return (
    <div
      ref={rootRef}
      data-site-loader=""
      aria-hidden="true"
      className="cdl-loader fixed inset-0 z-[100] overflow-hidden"
    >
      <noscript>
        <style>{'[data-site-loader]{display:none!important}'}</style>
      </noscript>
      <span className="sr-only" role="status">
        {loadingLabel}
      </span>

      <div ref={panelRef} className="absolute inset-0 bg-morado-300 text-neutro-100">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0" />
        {/* Facetas: a faint grid of solar cells, swept by a band of light. */}
        <div aria-hidden className="cdl-loader-cells pointer-events-none absolute inset-0" />

        <div className="gutter absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center">
          {/* Isotipo inside the two rings: outer wrapper for the script's
              exit, inner for the CSS entrance. */}
          <div ref={markRef} className="mb-4 md:mb-5">
            <div className="cdl-loader-appear relative size-32 md:size-40">
              <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden>
                {/* Seven areas, one cycle: an arc per area, drawn in turn. */}
                {areaColors.map((color, i) => (
                  <path
                    key={i}
                    ref={(el) => {
                      arcRefs.current[i] = el;
                    }}
                    d={arcPath(i, areaColors.length)}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    strokeDashoffset={1}
                    style={{ stroke: color, opacity: 0.2 }}
                  />
                ))}
                <g className="origin-center -rotate-90 [transform-box:view-box]">
                  <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgb(239 238 234 / 0.14)" strokeWidth="1.5" />
                  <circle
                    ref={ringRef}
                    cx="60"
                    cy="60"
                    r={RING_R}
                    fill="none"
                    stroke="var(--color-dorado-100)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C}
                  />
                </g>
              </svg>
              <Image
                src="/brand/isotipo-institucional.webp"
                alt=""
                width={80}
                height={80}
                priority
                className="absolute left-1/2 top-1/2 size-[52%] -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* The name, a pair of spans per letter: the inner one rises in
              (CSS), the outer one leaves (script). Clipped so letters rise
              from a baseline instead of fading in. */}
          <div
            className="font-titulo text-[2.5rem] leading-none font-bold whitespace-nowrap sm:text-[4rem] md:text-[6rem] lg:text-[7.5rem] xl:text-[9rem]"
            style={{ clipPath: 'inset(-0.1em -10% -0.12em -10%)', padding: '0.12em 0' }}
          >
            {chars.map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  charRefs.current[i] = el;
                }}
                className="inline-block will-change-transform"
              >
                <span className="cdl-loader-char inline-block" style={{ '--i': i } as React.CSSProperties}>
                  {char === ' ' ? '\u00a0' : char}
                </span>
              </span>
            ))}
          </div>

          {/* Second line of the lockup, gold, rising after the name. */}
          <div ref={subRef}>
            <div
              className="font-titulo text-2xl leading-none font-bold whitespace-nowrap text-dorado-100 md:text-[2.5rem]"
              style={{ clipPath: 'inset(-0.1em -10% -0.14em -10%)', padding: '0.12em 0' }}
            >
              {subChars.map((char, i) => (
                <span
                  key={i}
                  className="cdl-loader-char inline-block"
                  style={{ '--i': chars.length + 4 + i } as React.CSSProperties}
                >
                  {char === ' ' ? '\u00a0' : char}
                </span>
              ))}
            </div>
          </div>

          <div ref={metaRef} className="mt-5 w-full max-w-[min(100%,56rem)] md:mt-7">
            <div className="cdl-loader-appear" style={{ '--d': '700ms' } as React.CSSProperties}>
              <div className="relative h-px">
                <div className="absolute inset-0 bg-neutro-100/15" />
                <div
                  ref={ruleRef}
                  className="absolute inset-0 origin-left bg-dorado-100"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-4 text-base">
                {/* The three attributes, one at a time (CSS timeline). The
                    invisible sizer keeps the row as tall as the longest. */}
                <div className="relative grid min-w-0 flex-1">
                  {attributes.map((attribute, i) => (
                    <p
                      key={attribute.title}
                      className={cn(
                        'cdl-loader-attr [grid-area:1/1]',
                        i === attributes.length - 1 && 'cdl-loader-attr-last',
                      )}
                      style={{ '--i': i } as React.CSSProperties}
                    >
                      <span className="font-medium text-dorado-100">{attribute.title}</span>
                      <span className="text-neutro-100/72"> · {attribute.body}</span>
                    </p>
                  ))}
                </div>
                <span ref={countRef} className="font-medium text-dorado-100 tabular-nums">
                  000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Foot: the institution on one side, the four values on the other. */}
        <div
          ref={footRef}
          className="gutter absolute inset-x-0 bottom-0 flex flex-col gap-2 pb-5 text-base md:flex-row md:items-end md:justify-between md:pb-7"
        >
          <p className="cdl-loader-appear text-neutro-100/56" style={{ '--d': '1100ms' } as React.CSSProperties}>
            {caption}
          </p>
          {/* Each value carries its own dot, so a wrapped line never starts
              with a separator. */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {values.map((value, i) => (
              <li
                key={value}
                className="cdl-loader-appear flex items-center gap-2 text-neutro-100/72"
                style={{ '--d': `${1300 + i * 260}ms` } as React.CSSProperties}
              >
                <span aria-hidden className="size-1 rounded-full bg-dorado-100" />
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Light riding the wipe edge. */}
      <div
        ref={edgeRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 will-change-transform"
        style={{
          transform: 'translateY(100vh)',
          background:
            'linear-gradient(90deg, transparent, var(--color-dorado-100) 20%, #fff2d6 50%, var(--color-dorado-100) 80%, transparent)',
        }}
      >
        <div
          className="absolute inset-x-0 -top-10 h-20"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, rgb(255 185 56 / 0.28), transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
