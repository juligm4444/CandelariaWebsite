'use client';

import { IconChevronLeft, IconChevronRight, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { MemberFlipCard } from './member-flip-card';
import type { CardArea, CardLabels, CardMember, RingLabels } from './types';

/**
 * Members on a turning ring, after Originkit's "Round Carousel", with the
 * site's own flip cards on it instead of flat images.
 *
 * - It turns on its own at a third of the reference speed (14°/s against 42).
 * - Under a mouse it stops. The wheel then turns it: down (or right) moves it
 *   forward, the same way it turns on its own; up moves it back. The page does
 *   not scroll while the pointer is on the ring, which is the point: leaving
 *   the ring gives the wheel back to the page and the ring resumes.
 * - It can be dragged with a mouse or swiped on a touch screen (vertical
 *   swipes still scroll the page). A drag never flips a card.
 * - Keyboard focus on a card stops the ring and turns that card to the front,
 *   and there is a pause button, so the motion can always be stopped (WCAG
 *   2.2.2).
 *
 * The ring needs at least six slots to read as a ring, so smaller teams are
 * repeated. The copies flip under the pointer like the originals, but they
 * are hidden from assistive tech and out of the tab order (not `inert`: an
 * inert element ignores the pointer too), and only the original carries the
 * member's anchor. The angle lives in refs and is
 * written straight to the DOM every frame: nothing re-renders while it turns,
 * and the loop stops while the ring is off screen or the tab is hidden.
 *
 * Callers fall back to the flat rail under reduced motion and for teams of
 * fewer than three.
 */

const DEG_PER_SEC = 14;
const MIN_SLOTS = 6;
/** Arc length per card, as a multiple of the card width. */
const SPACING = 1.22;
const TILT = -6;
const PERSPECTIVE = 2200;
const WHEEL_DEG_PER_PX = 0.12;
const DRAG_DEG_PER_PX = 0.32;
const DRAG_THRESHOLD = 6;
const CARD_RATIO = 512 / 324;

type Slot = { member: CardMember; copy: number };

/** The ring angle closest to `current` that puts slot `index` at the front. */
function nearestFront(current: number, index: number, step: number) {
  const base = -index * step;
  return base + 360 * Math.round((current - base) / 360);
}

export function MemberRing({
  members,
  area,
  labels,
  ringLabels,
  highlight,
}: {
  members: CardMember[];
  area: CardArea;
  labels: CardLabels;
  ringLabels: RingLabels;
  /** Member id to turn to the front and light up (deep link). */
  highlight: string | null;
}) {
  const slots = useMemo<Slot[]>(() => {
    const repeats = Math.max(1, Math.ceil(MIN_SLOTS / members.length));
    return Array.from({ length: repeats }, (_, copy) => members.map((member) => ({ member, copy }))).flat();
  }, [members]);

  const count = slots.length;
  const step = 360 / count;

  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardWidth, setCardWidth] = useState(272);
  const [paused, setPaused] = useState(false);

  const radius = (cardWidth * SPACING) / (2 * Math.tan(Math.PI / count));
  const cardHeight = Math.round(cardWidth * CARD_RATIO);

  // Motion state, read by the frame loop.
  const motion = useRef({
    angle: 0,
    target: null as number | null,
    velocity: 0,
    hover: false,
    focus: false,
    paused: false,
    drag: { active: false, moved: false, x: 0, time: 0 },
  });
  useEffect(() => {
    motion.current.paused = paused;
  }, [paused]);

  // Smaller cards on narrow screens, so the neighbours stay in view.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      setCardWidth(width < 480 ? 232 : 272);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // The frame loop.
  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;
    const state = motion.current;
    let frame = 0;
    let last = 0;
    let onScreen = false;

    const draw = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (!state.drag.active) {
        if (state.target !== null) {
          const gap = state.target - state.angle;
          state.angle += gap * Math.min(1, dt * 9);
          if (Math.abs(gap) < 0.05) {
            state.angle = state.target;
            state.target = null;
          }
        } else if (Math.abs(state.velocity) > 0.5) {
          state.angle += state.velocity * dt;
          state.velocity *= Math.pow(0.92, dt * 60);
        } else if (!state.hover && !state.focus && !state.paused) {
          state.velocity = 0;
          state.angle += DEG_PER_SEC * dt;
        }
      }

      ring.style.transform = `translateZ(${-radius}px) rotateY(${state.angle}deg)`;

      // Cards turning away dim, so the front card reads first. Cards past the
      // sides stop taking the pointer: Chrome hit-tests a hidden backface, so
      // a card at the back of the ring would otherwise catch clicks meant for
      // the one in front of it.
      for (let index = 0; index < count; index++) {
        const facing = Math.cos(((index * step + state.angle) * Math.PI) / 180);
        const dim = dimRefs.current[index];
        if (dim) dim.style.opacity = String(Math.min(0.72, Math.max(0, (1 - facing) * 2.2)));
        const face = faceRefs.current[index];
        if (face) face.style.pointerEvents = facing > 0.25 ? 'auto' : 'none';
      }

      frame = onScreen && !document.hidden ? requestAnimationFrame(draw) : 0;
    };

    const start = () => {
      if (frame || !onScreen || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(draw);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      start();
    });
    visibility.observe(stage);
    document.addEventListener('visibilitychange', start);

    // The wheel turns the ring while the pointer is on it. It has to be a
    // non-passive listener to keep the page from scrolling at the same time.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      const delta = (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * unit;
      state.velocity = 0;
      state.target = (state.target ?? state.angle) + delta * WHEEL_DEG_PER_PX;
      start();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });

    // Before this effect re-runs (new radius), draw once so nothing jumps.
    ring.style.transform = `translateZ(${-radius}px) rotateY(${state.angle}deg)`;

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      document.removeEventListener('visibilitychange', start);
      stage.removeEventListener('wheel', onWheel);
    };
  }, [radius, count, step]);

  /** Nearest angle that puts slot `index` at the front. */
  const angleFor = (index: number) => nearestFront(motion.current.angle, index, step);

  const turn = (direction: 1 | -1) => {
    const state = motion.current;
    state.velocity = 0;
    const from = state.target ?? state.angle;
    // Snap to the slot grid, then move one slot.
    state.target = Math.round(from / step) * step + direction * step;
  };

  // Deep link: turn the highlighted member to the front.
  useEffect(() => {
    if (!highlight) return;
    const index = slots.findIndex((slot) => slot.member.id === highlight);
    if (index < 0) return;
    motion.current.velocity = 0;
    motion.current.target = nearestFront(motion.current.angle, index, step);
  }, [highlight, slots, step]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const drag = motion.current.drag;
    drag.active = true;
    drag.moved = false;
    drag.x = event.clientX;
    drag.time = event.timeStamp;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = motion.current;
    const drag = state.drag;
    if (!drag.active) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      drag.moved = true;
      state.target = null;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const dt = Math.max((event.timeStamp - drag.time) / 1000, 0.001);
    state.angle += dx * DRAG_DEG_PER_PX;
    state.velocity = (dx * DRAG_DEG_PER_PX) / dt;
    drag.x = event.clientX;
    drag.time = event.timeStamp;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = motion.current.drag;
    if (!drag.active) return;
    drag.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // A pointer that stopped before letting go should not fling the ring.
    if (event.timeStamp - drag.time > 80) motion.current.velocity = 0;
  };

  return (
    <div
      role="region"
      aria-roledescription={ringLabels.roleDescription}
      aria-label={ringLabels.label}
      className="flex flex-col gap-3"
    >
      <div
        ref={stageRef}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') motion.current.hover = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') motion.current.hover = false;
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          // The click that ends a drag must not flip a card or follow a link.
          if (motion.current.drag.moved) {
            event.preventDefault();
            event.stopPropagation();
            motion.current.drag.moved = false;
          }
        }}
        onFocus={(event) => {
          motion.current.focus = true;
          const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-slot]');
          if (slot) {
            motion.current.velocity = 0;
            motion.current.target = angleFor(Number(slot.dataset.slot));
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            motion.current.focus = false;
          }
        }}
        className="relative -mx-8 flex touch-pan-y items-center justify-center overflow-clip select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] sm:mx-0"
        style={{ height: cardHeight + 96, perspective: `${PERSPECTIVE}px` }}
      >
        {/* Floor light under the ring, in the area colour. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: `radial-gradient(50% 60% at 50% 100%, rgb(${area.rgb} / 0.16), transparent 70%)`,
          }}
        />
        {/* The tilt and ring planes take no pointer events: in a 3D context
            they sit level with the front card and would swallow its clicks. */}
        <div className="pointer-events-none" style={{ transform: `rotateX(${TILT}deg)`, transformStyle: 'preserve-3d' }}>
          <div
            ref={ringRef}
            className="relative"
            style={{ width: cardWidth, height: cardHeight, transformStyle: 'preserve-3d' }}
          >
            {slots.map((slot, index) => {
              const copy = slot.copy > 0;
              const angle = index * step;
              return (
                <Fragment key={`${slot.member.id}-${slot.copy}`}>
                  {/* The card, facing out of the ring. Kept flat (no
                      preserve-3d) on purpose: Chrome loses hit-testing on 3D
                      content nested inside another 3D context, and the card
                      tilts and flips in its own perspective anyway. */}
                  <div
                    ref={(node) => {
                      faceRefs.current[index] = node;
                    }}
                    data-slot={index}
                    aria-hidden={copy || undefined}
                    className="pointer-events-auto absolute inset-0"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <MemberFlipCard
                      member={slot.member}
                      area={area}
                      labels={labels}
                      width={cardWidth}
                      anchor={!copy}
                      focusable={!copy}
                      highlight={!copy && highlight === slot.member.id}
                    />
                    <div
                      ref={(node) => {
                        dimRefs.current[index] = node;
                      }}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-40 rounded-card bg-morado-300"
                      style={{ opacity: 0 }}
                    />
                  </div>
                  {/* The same slot seen from inside the ring: a dim plate. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-card border border-hairline"
                    style={{
                      transform: `rotateY(${angle + 180}deg) translateZ(${-radius}px)`,
                      backfaceVisibility: 'hidden',
                      background: `radial-gradient(80% 60% at 50% 40%, rgb(${area.rgb} / 0.14), var(--color-morado-300) 80%)`,
                    }}
                  >
                    <span className="font-titulo text-[3rem] font-bold opacity-30" style={{ color: area.label }}>
                      {slot.member.initials}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <p className="text-base text-ink-faint">
          <span className="pointer-coarse:hidden">{ringLabels.hintPointer}</span>
          <span className="hidden pointer-coarse:inline">{ringLabels.hintTouch}</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <RingButton label={ringLabels.previous} onClick={() => turn(-1)}>
            <IconChevronLeft className="icon-brand size-5" aria-hidden />
          </RingButton>
          <RingButton label={paused ? ringLabels.play : ringLabels.pause} onClick={() => setPaused((value) => !value)}>
            {paused ? (
              <IconPlayerPlay className="icon-brand size-5" aria-hidden />
            ) : (
              <IconPlayerPause className="icon-brand size-5" aria-hidden />
            )}
          </RingButton>
          <RingButton label={ringLabels.next} onClick={() => turn(1)}>
            <IconChevronRight className="icon-brand size-5" aria-hidden />
          </RingButton>
        </div>
      </div>
    </div>
  );
}

function RingButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-light=""
      data-ripple=""
      className={cn(
        'cdl-press cdl-light cdl-light-edge inline-flex size-12 items-center justify-center rounded-pill border border-hairline-strong text-ink',
        'hover:text-accent [--cdl-light-alpha:0.14]',
      )}
    >
      {children}
    </button>
  );
}
