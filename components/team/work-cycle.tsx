'use client';

import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * "How we work" on the Team page, drawn instead of listed: the seven areas
 * are seven dots in their colours, and each practice rearranges them.
 *
 * 1. One weekly meeting: the areas gather round one table.
 * 2. A closing criterion: each area closes its own ring.
 * 3. Everything is written down: every area feeds the log at the centre.
 * 4. Cross review: each area is tied to the ones whose work it reviews.
 *
 * The steps advance on their own while the block is on screen (the gold bar
 * on the current step is the timer; its end advances the cycle), pause while
 * the pointer or focus is inside it, and can be paused outright. Tabs,
 * arrow keys and a sideways swipe on the drawing all change the step. With
 * reduced motion nothing advances or moves; the drawing just switches.
 */

const STEP_MS = 6500;
const CENTER = 200;
const OUTER = 148;
const TABLE = 64;

type Step = { title: string; body: string };

function point(index: number, count: number, radius: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function CycleDrawing({ step, colors }: { step: number; colors: string[] }) {
  const count = colors.length;
  const radius = step === 0 ? TABLE + 22 : OUTER;
  const dots = colors.map((_, index) => point(index, count, radius));
  const outer = colors.map((_, index) => point(index, count, OUTER));

  return (
    <svg viewBox="0 0 400 400" aria-hidden className="size-full overflow-visible">
      {/* The cycle itself, with a pulse of light running round it. */}
      <circle cx={CENTER} cy={CENTER} r={OUTER} fill="none" strokeWidth={2} style={{ stroke: 'var(--cdl-border)' }} />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={OUTER}
        fill="none"
       
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="6 94"
        className="cdl-cycle-pulse" style={{ stroke: 'var(--cdl-accent)' }}
      />

      {/* 1. The table everyone sits at. */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={TABLE}
       
       
        strokeWidth={2}
        className="cdl-cycle-part"
        data-on={step === 0 ? '' : undefined} style={{ fill: 'var(--cdl-surface)', stroke: 'var(--cdl-accent)' }}
      />

      {/* 3. The log at the centre, and a line from every area into it. */}
      <g className="cdl-cycle-part" data-on={step === 2 ? '' : undefined}>
        {outer.map((dot, index) => (
          <line
            key={index}
            x1={dot.x}
            y1={dot.y}
            x2={CENTER}
            y2={CENTER}
           
            strokeWidth={2}
            pathLength={1}
            className="cdl-cycle-flow" style={{ stroke: colors[index] }}
          />
        ))}
        <rect x={CENTER - 30} y={CENTER - 38} width={60} height={76} rx={8} strokeWidth={2} style={{ fill: 'var(--cdl-surface)', stroke: 'var(--cdl-accent)' }} />
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1={CENTER - 18}
            x2={line === 3 ? CENTER + 4 : CENTER + 18}
            y1={CENTER - 20 + line * 14}
            y2={CENTER - 20 + line * 14}
           
            strokeWidth={3}
            strokeLinecap="round" style={{ stroke: 'var(--cdl-text-muted)' }}
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
             
              strokeWidth={2}
              pathLength={1}
              className="cdl-cycle-draw"
              style={{ stroke: colors[index],  '--i': index } as React.CSSProperties}
            />
          );
        })}
      </g>

      {/* The areas. */}
      {dots.map((dot, index) => (
        <g
          key={index}
          className="cdl-cycle-dot"
          style={{ transform: `translate(${dot.x}px, ${dot.y}px)`, '--i': index } as React.CSSProperties}
        >
          {/* 2. A closing ring round each area. */}
          <circle
            r={24}
            fill="none"
           
            strokeWidth={3}
            pathLength={1}
            className="cdl-cycle-part cdl-cycle-close"
            data-on={step === 1 ? '' : undefined}
            transform="rotate(-90)" style={{ stroke: 'var(--cdl-accent)' }}
          />
          <circle r={15} style={{ fill: colors[index] }} />
        </g>
      ))}
    </svg>
  );
}

export function WorkCycle({
  steps,
  colors,
  labels,
}: {
  steps: Step[];
  /** Area colours, one dot per area. */
  colors: string[];
  labels: { group: string; pause: string; play: string };
}) {
  const reduce = usePrefersReducedMotion();
  const id = useId();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const running = !reduce && !paused && !holding && visible;

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
        <CycleDrawing step={step} colors={colors} />
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
          {reduce ? null : (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? labels.play : labels.pause}
              data-ripple=""
              className="cdl-press inline-flex size-12 shrink-0 items-center justify-center rounded-pill border border-hairline-strong text-ink hover:border-accent hover:text-accent"
            >
              {paused ? <IconPlayerPlay className="icon-brand size-5" aria-hidden /> : <IconPlayerPause className="icon-brand size-5" aria-hidden />}
            </button>
          )}
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
