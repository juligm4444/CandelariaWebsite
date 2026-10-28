'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * "How we work" on the Team page, drawn instead of listed: the seven areas
 * are seven discs carrying their isotipos, and each practice rearranges them.
 *
 * 1. One weekly meeting: the areas gather round one table.
 * 2. A closing criterion: each area closes its own ring.
 * 3. Everything is written down: every area feeds the log at the centre.
 * 4. Cross review: each area is tied to the ones whose work it reviews.
 *
 * The steps advance on their own while the block is on screen (the gold bar
 * on the current step is the timer; its end advances the cycle) and pause
 * while the pointer or focus is inside it. Tabs,
 * arrow keys and a sideways swipe on the drawing all change the step. With
 * reduced motion nothing advances or moves; the drawing just switches.
 */

const STEP_MS = 6500;
const CENTER = 200;
const OUTER = 148;
const TABLE = 64;
/** Radius of the instrument plate everything sits on. */
const PLATE = 196;
/** Area disc. Its isotipo is LOGO units wide: at the drawing's smallest size
    (about 20.5rem on a 360px phone) that stays above the manual's 32px floor. */
const DISC = 28;
const LOGO = 40;
const CLOSE = DISC + 6;
/** Gathered round the table: clear of its edge, and of each other. */
const SEATED = TABLE + DISC + 12;
const TICKS = 84; // 12 per area

/** The brand palette, for the plate (always deep purple, on either surface). */
const MORADO_100 = 'var(--color-morado-100)';
const MORADO_200 = 'var(--color-morado-200)';
const MORADO_300 = 'var(--color-morado-300)';
const DORADO_100 = 'var(--color-dorado-100)';
const NEUTRO_100 = 'var(--color-neutro-100)';

type Step = { title: string; body: string };
type CycleArea = { color: string; logo: string };

function point(index: number, count: number, radius: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

/**
 * The drawing is an instrument plate in deep purple, set into the paper
 * section: depth comes from the contrast between plate, recessed track and
 * raised discs, and from radial light (the manual's halo), never a shadow.
 * Light falls from the top left, so every raised surface is lit on that side
 * and every recessed one on the other. The isotipos sit on Morado profundo,
 * as the manual asks for avatars, and are never lit or glowed themselves.
 */
function CycleDrawing({ step, areas, uid }: { step: number; areas: CycleArea[]; uid: string }) {
  const count = areas.length;
  const radius = step === 0 ? SEATED : OUTER;
  const dots = areas.map((_, index) => point(index, count, radius));
  const outer = areas.map((_, index) => point(index, count, OUTER));
  const ref = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${ref(name)})`;

  return (
    <svg viewBox="0 0 400 400" aria-hidden className="size-full overflow-visible">
      <defs>
        {/* Plate: lit from the top left, falling to the deepest purple. */}
        <radialGradient id={ref('plate')} cx="38%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: MORADO_100 }} />
          <stop offset="55%" style={{ stopColor: MORADO_200 }} />
          <stop offset="100%" style={{ stopColor: MORADO_300 }} />
        </radialGradient>
        {/* Bevel of the plate's edge: light at the top left, dark opposite. */}
        <linearGradient id={ref('bevel')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.34} />
          <stop offset="50%" stopColor="#fff" stopOpacity={0.04} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.4} />
        </linearGradient>
        {/* Raised surfaces (table, log, discs). */}
        <radialGradient id={ref('raised')} cx="34%" cy="28%" r="85%">
          <stop offset="0%" style={{ stopColor: MORADO_100 }} />
          <stop offset="100%" style={{ stopColor: MORADO_300 }} />
        </radialGradient>
        {/* Centre halo, the manual's #3E1057 over #1E0A29. */}
        <radialGradient id={ref('halo')}>
          <stop offset="0%" style={{ stopColor: MORADO_100 }} stopOpacity={0.9} />
          <stop offset="100%" style={{ stopColor: MORADO_100 }} stopOpacity={0} />
        </radialGradient>
        {/* Gold light pooling under the table and the log. */}
        <radialGradient id={ref('pool')}>
          <stop offset="0%" style={{ stopColor: DORADO_100 }} stopOpacity={0.22} />
          <stop offset="100%" style={{ stopColor: DORADO_100 }} stopOpacity={0} />
        </radialGradient>
        {areas.map((area, index) => (
          <radialGradient key={index} id={ref(`glow-${index}`)}>
            <stop offset="45%" style={{ stopColor: area.color }} stopOpacity={0.4} />
            <stop offset="100%" style={{ stopColor: area.color }} stopOpacity={0} />
          </radialGradient>
        ))}
        {/* Each line of the star runs from one area's colour to the other's. */}
        {outer.map((dot, index) => {
          const to = outer[(index + 2) % count] ?? dot;
          return (
            <linearGradient
              key={index}
              id={ref(`tie-${index}`)}
              gradientUnits="userSpaceOnUse"
              x1={dot.x}
              y1={dot.y}
              x2={to.x}
              y2={to.y}
            >
              <stop offset="0%" style={{ stopColor: areas[index]?.color }} />
              <stop offset="100%" style={{ stopColor: areas[(index + 2) % count]?.color }} />
            </linearGradient>
          );
        })}
        {/* Each feed into the log fades from the area's colour to gold. */}
        {outer.map((dot, index) => (
          <linearGradient
            key={index}
            id={ref(`feed-${index}`)}
            gradientUnits="userSpaceOnUse"
            x1={dot.x}
            y1={dot.y}
            x2={CENTER}
            y2={CENTER}
          >
            <stop offset="0%" style={{ stopColor: areas[index]?.color }} />
            <stop offset="100%" style={{ stopColor: DORADO_100 }} />
          </linearGradient>
        ))}
      </defs>

      {/* The plate and its bevelled rim. */}
      <circle cx={CENTER} cy={CENTER} r={PLATE} fill={url('plate')} />
      <circle cx={CENTER} cy={CENTER} r={PLATE - 1.5} fill="none" stroke={url('bevel')} strokeWidth={3} />
      <circle cx={CENTER} cy={CENTER} r={110} fill={url('halo')} />

      {/* Dial round the rim, outside the closing rings: twelve ticks per
          area, the one in line with each area longer and in its colour. */}
      <g>
        {Array.from({ length: TICKS }, (_, tick) => {
          const major = tick % (TICKS / count) === 0;
          const a = point(tick, TICKS, PLATE - 5);
          const b = point(tick, TICKS, PLATE - (major ? 11 : 8));
          return (
            <line
              key={tick}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
              style={{ stroke: major ? areas[tick / (TICKS / count)]?.color : NEUTRO_100 }}
              strokeOpacity={major ? 0.9 : 0.22}
            />
          );
        })}
      </g>

      {/* Inner guide rings, faint, for scale. */}
      <circle cx={CENTER} cy={CENTER} r={SEATED} fill="none" strokeWidth={0.75} strokeDasharray="2 6" style={{ stroke: NEUTRO_100 }} strokeOpacity={0.16} />

      {/* The cycle: a groove cut into the plate (dark floor, lit lower lip),
          with a pulse of light running round it. */}
      <circle cx={CENTER} cy={CENTER} r={OUTER} fill="none" strokeWidth={10} style={{ stroke: MORADO_300 }} strokeOpacity={0.9} />
      <circle cx={CENTER} cy={CENTER} r={OUTER + 5} fill="none" strokeWidth={1} stroke={url('bevel')} transform={`rotate(180 ${CENTER} ${CENTER})`} />
      <circle cx={CENTER} cy={CENTER} r={OUTER} fill="none" strokeWidth={1} style={{ stroke: NEUTRO_100 }} strokeOpacity={0.12} />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER}
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="6 94"
        className="cdl-cycle-pulse"
        style={{ stroke: DORADO_100 }}
      />

      {/* 1. The table everyone sits at: a raised disc with a lit rim, two
          inlaid rings and gold light pooling round it. */}
      <g className="cdl-cycle-part" data-on={step === 0 ? '' : undefined}>
        <circle cx={CENTER} cy={CENTER} r={TABLE + 26} fill={url('pool')} />
        <circle cx={CENTER} cy={CENTER} r={TABLE} fill={url('raised')} strokeWidth={2} style={{ stroke: DORADO_100 }} />
        <circle cx={CENTER} cy={CENTER} r={TABLE - 3} fill="none" stroke={url('bevel')} strokeWidth={2} />
        <circle cx={CENTER} cy={CENTER} r={TABLE - 16} fill="none" strokeWidth={0.75} style={{ stroke: DORADO_100 }} strokeOpacity={0.45} />
        <circle cx={CENTER} cy={CENTER} r={TABLE - 30} fill="none" strokeWidth={0.75} style={{ stroke: DORADO_100 }} strokeOpacity={0.25} />
        <circle cx={CENTER} cy={CENTER} r={4} style={{ fill: DORADO_100 }} />
      </g>

      {/* 3. The log at the centre, and a line from every area into it. */}
      <g className="cdl-cycle-part" data-on={step === 2 ? '' : undefined}>
        {outer.map((dot, index) => (
          <line
            key={index}
            x1={dot.x}
            y1={dot.y}
            x2={CENTER}
            y2={CENTER}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            className="cdl-cycle-flow"
            stroke={url(`feed-${index}`)}
          />
        ))}
        <circle cx={CENTER} cy={CENTER} r={70} fill={url('pool')} />
        {/* A stack of pages: the two behind are offset and darker. */}
        <rect x={CENTER - 22} y={CENTER - 44} width={60} height={76} rx={8} style={{ fill: MORADO_300, stroke: DORADO_100 }} strokeOpacity={0.3} strokeWidth={1} />
        <rect x={CENTER - 26} y={CENTER - 41} width={60} height={76} rx={8} style={{ fill: MORADO_200, stroke: DORADO_100 }} strokeOpacity={0.5} strokeWidth={1} />
        <rect x={CENTER - 30} y={CENTER - 38} width={60} height={76} rx={8} fill={url('raised')} strokeWidth={2} style={{ stroke: DORADO_100 }} />
        <rect x={CENTER - 28.5} y={CENTER - 36.5} width={57} height={73} rx={6.5} fill="none" stroke={url('bevel')} strokeWidth={1.5} />
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={CENTER - 18}
            x2={line === 3 ? CENTER + 4 : CENTER + 18}
            y1={CENTER - 20 + line * 14}
            y2={CENTER - 20 + line * 14}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ stroke: line === 0 ? DORADO_100 : NEUTRO_100 }}
            strokeOpacity={line === 0 ? 0.9 : 0.5}
          />
        ))}
      </g>

      {/* 4. Each area tied to the ones two places along: a seven-point star. */}
      <g className="cdl-cycle-part" data-on={step === 3 ? '' : undefined}>
        {outer.map((dot, index) => {
          const to = outer[(index + 2) % count] ?? dot;
          return (
            <line
              key={index}
              x1={dot.x}
              y1={dot.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={2.5}
              strokeLinecap="round"
              pathLength={1}
              className="cdl-cycle-draw"
              stroke={url(`tie-${index}`)}
              style={{ '--i': index } as React.CSSProperties}
            />
          );
        })}
      </g>

      {/* The areas: a raised disc in deep purple, rimmed in the area colour,
          over a pool of that colour's light, with its isotipo inside. */}
      {dots.map((dot, index) => {
        const area = areas[index];
        if (!area) return null;
        return (
          <g
            key={index}
            className="cdl-cycle-dot"
            style={{ transform: `translate(${dot.x}px, ${dot.y}px)`, '--i': index } as React.CSSProperties}
          >
            <circle r={DISC + 16} fill={url(`glow-${index}`)} />
            {/* 2. A closing ring round each area. */}
            <circle
              r={CLOSE}
              fill="none"
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              className="cdl-cycle-part cdl-cycle-close"
              data-on={step === 1 ? '' : undefined}
              transform="rotate(-90)"
              style={{ stroke: DORADO_100 }}
            />
            <circle r={DISC} fill={url('raised')} strokeWidth={2.5} style={{ stroke: area.color }} />
            <circle r={DISC - 2.5} fill="none" stroke={url('bevel')} strokeWidth={1.5} />
            <image
              href={area.logo}
              x={-LOGO / 2}
              y={-LOGO / 2}
              width={LOGO}
              height={LOGO}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function WorkCycle({
  steps,
  areas,
  labels,
}: {
  steps: Step[];
  /** One disc per area: its colour and its isotipo. */
  areas: CycleArea[];
  labels: { group: string };
}) {
  const reduce = usePrefersReducedMotion();
  const id = useId();
  // useId may carry characters that are awkward inside `url(#...)`.
  const uid = `cycle-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [step, setStep] = useState(0);
  const [holding, setHolding] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const running = !reduce && !holding && visible;

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const go = (next: number, focus = false) => {
    const index = (next + steps.length) % steps.length;
    setStep(index);
    if (focus) tabs.current[index]?.focus();
  };

  return (
    <div
      ref={root}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHolding(true);
      }}
      onPointerLeave={() => setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHolding(false);
      }}
      className="grid items-center gap-7 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-9"
    >
      <div
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, id: event.pointerId };
        }}
        onPointerUp={(event) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          if (Math.abs(dx) > 40) go(step + (dx < 0 ? 1 : -1));
        }}
        className="mx-auto aspect-square w-full max-w-[22rem] touch-pan-y select-none md:max-w-[34rem]"
      >
        <CycleDrawing step={step} areas={areas} uid={uid} />
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div
            role="tablist"
            aria-label={labels.group}
            className="grid flex-1 grid-cols-4 gap-2 md:grid-cols-1"
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                go(step + 1, true);
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                go(step - 1, true);
              }
            }}
          >
            {steps.map((item, index) => {
              const current = index === step;
              return (
                <button
                  key={item.title}
                  ref={(node) => {
                    tabs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${index}`}
                  aria-selected={current}
                  aria-controls={`${id}-panel`}
                  tabIndex={current ? 0 : -1}
                  onClick={() => go(index)}
                  data-light=""
                  className={cn(
                    'cdl-light cdl-nav-item relative flex min-h-12 items-center gap-3 overflow-hidden rounded-card border px-3 py-2 text-left',
                    current ? 'border-accent' : 'border-hairline',
                  )}
                >
                  <span className="font-titulo text-2xl font-bold tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                  <span className="hidden text-base font-medium md:inline">{item.title}</span>
                  {current && !reduce ? (
                    <span
                      key={step}
                      aria-hidden
                      className="cdl-cycle-timer absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
                      style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: running ? 'running' : 'paused' }}
                      onAnimationEnd={() => go(step + 1)}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${step}`}
          aria-live="polite"
          className="flex min-h-[12rem] flex-col gap-3"
        >
          <span aria-hidden className="font-titulo text-[4.5rem] font-bold leading-none text-accent tabular-nums">
            {String(step + 1).padStart(2, '0')}
          </span>
          <h3 key={`t-${step}`} className="cdl-cycle-text font-titulo text-[2rem] font-bold leading-tight md:text-[2.5rem]">
            {steps[step]?.title}
          </h3>
          <p key={`b-${step}`} className="cdl-cycle-text max-w-[44ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
            {steps[step]?.body}
          </p>
        </div>
      </div>
    </div>
  );
}
