'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { TextLink } from '@/components/ui/text-link';
import type { AreaKey } from '@/content/areas';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import { useWebGLSupport } from '@/lib/webgl';

import { CardCarousel } from './card-carousel';
import { MemberFlipCard } from './member-flip-card';
import { MemberRing } from './member-ring';
import {
  createRingMotion,
  ringAngle,
  ringRadius,
  rotationFor,
  visibleWidth,
  type RingMotion,
} from './ring';
import type { ExplorerArea, ExplorerLabels } from './types';

/**
 * The Team page's areas: a ring of the seven 3D logos, each turning on its
 * own axis, and under it the selected area (what it owns, who is in it, its
 * log).
 *
 * The ring turns on its own until someone takes it. From the first drag or
 * pick it stays where it is left, with that area selected and its details
 * open. Once the pointer leaves the whole block (ring and details), or on
 * touch screens once the block has scrolled out of view, the ring turns
 * again and the selection is dropped: the logo settles back into the ring,
 * the details fold away and no area is shown until the next pick.
 *
 * Picking an area: click its logo, tap its name in the row under the ring, or
 * drag the ring and let go (the fling coasts, snaps the nearest logo to the
 * front and selects it). The selected logo rises and its name appears under
 * it. The row of names is the accessible way in (real buttons with
 * `aria-pressed`); the logos are a pointer shortcut.
 *
 * The selected area is mirrored in the URL (`/team?area=celdas`) with
 * history.replaceState. A link to a member (`#integrante-<id>`) selects that
 * member's area, then scrolls the card into view and lights it up.
 */

const TeamRingScene = dynamic(() => import('./team-ring-scene'), { ssr: false, loading: () => null });

/** Below this many people a ring would mostly show copies; they get the flat rail. */
const RING_MIN = 3;

/** The canvas surface this block sits on (Morado 300): the back of the ring fades into it. */
const SECTION_COLOR = '#1e0a29';

const phoneQuery = '(max-width: 767px)';
const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const readPhone = () => window.matchMedia(phoneQuery).matches;
const serverPhone = () => false;

const finePointerQuery = '(hover: hover) and (pointer: fine)';
const readFinePointer = () => window.matchMedia(finePointerQuery).matches;
const subscribeNever = () => () => {};
const serverFinePointer = () => true;

function syncUrl(key: AreaKey | null) {
  const url = new URL(window.location.href);
  if (key) url.searchParams.set('area', key);
  else url.searchParams.delete('area');
  url.hash = '';
  window.history.replaceState(window.history.state, '', url);
}

export function TeamExplorer({
  areas,
  initial,
  labels,
}: {
  areas: ExplorerArea[];
  initial: AreaKey | null;
  labels: ExplorerLabels;
}) {
  const reduce = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const narrow = useSyncExternalStore(subscribePhone, readPhone, serverPhone);
  const finePointer = useSyncExternalStore(subscribeNever, readFinePointer, serverFinePointer);
  const count = areas.length;

  const initialIndex = initial ? areas.findIndex((area) => area.key === initial) : -1;
  const [selected, setSelected] = useState<number | null>(initialIndex >= 0 ? initialIndex : null);
  // The details keep showing the last area while they fold away.
  const [shown, setShown] = useState<ExplorerArea | null>(areas[initialIndex] ?? null);
  const [instant, setInstant] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [pointing, setPointing] = useState(false);
  // Arriving with an area in the URL shows that area, held still.
  const motion = useRef<RingMotion>(
    createRingMotion(initialIndex >= 0 ? -initialIndex * ringAngle(count) : 0, initialIndex < 0),
  );
  const block = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const drag = useRef({ id: -1, x: 0, time: 0, total: 0, moved: false });

  const choose = (index: number) => {
    const area = areas[index];
    if (!area) return;
    setInstant(false);
    setSelected(index);
    setShown(area);
    syncUrl(area.key);
  };

  const select = (index: number) => {
    const m = motion.current;
    m.auto = false;
    m.vel = 0;
    m.settle = false;
    m.target = rotationFor(index, count, m.rot);
    choose(index);
  };

  /**
   * Gives the ring its own motion back and drops the selection. `offscreen`:
   * the block has scrolled out of view, so the details close at once, and if
   * the browser does not anchor scrolling itself, the page is moved by what
   * they took up so nothing on screen jumps.
   */
  const release = (offscreen = false) => {
    const m = motion.current;
    if (m.dragging) return;
    m.auto = true;
    m.target = null;
    m.settle = false;
    m.vel = 0;
    setSelected(null);
    if (new URLSearchParams(window.location.search).has('area')) syncUrl(null);
    if (!offscreen) return;
    const node = block.current;
    const above = node ? node.getBoundingClientRect().bottom < 0 : false;
    const before = node?.offsetHeight ?? 0;
    setInstant(true);
    setShown(null);
    if (above && node && !CSS.supports('overflow-anchor', 'auto')) {
      requestAnimationFrame(() => window.scrollBy(0, node.offsetHeight - before));
    }
  };

  // Effects below read the latest handlers through refs.
  const releaseRef = useRef(release);
  const selectRef = useRef(select);
  useEffect(() => {
    releaseRef.current = release;
    selectRef.current = select;
  });

  // Off screen: stop the render loop and let go of the ring (on a touch
  // screen this is the only way to "leave" the block).
  useEffect(() => {
    const node = block.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      setActive(visible);
      if (!visible) releaseRef.current(true);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // Deep link to a member: select their area, then reveal and light the card.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#integrante-')) return;
    const id = hash.slice('#integrante-'.length);
    const index = areas.findIndex((area) => area.members.some((member) => member.id === id));
    if (index < 0) return;
    const timer = window.setTimeout(() => {
      selectRef.current(index);
      setTarget(id);
      window.setTimeout(() => {
        document.getElementById(`integrante-${id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }, 600);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [areas]);
  // Drag: the ring follows the pointer as if it were grabbed at the front
  // logo. Listeners live on the window for the length of one drag, so the
  // drag survives leaving the stage and a click on a logo still reaches the
  // 3D layer.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const stageWidth = stage.current?.clientWidth ?? 1;
    const pxPerUnit = stageWidth / visibleWidth(count, narrow);
    const degPerPx = 180 / Math.PI / (pxPerUnit * ringRadius(count));
    drag.current = { id: event.pointerId, x: event.clientX, time: event.timeStamp, total: 0, moved: false };

    const move = (e: PointerEvent) => {
      const state = drag.current;
      if (e.pointerId !== state.id) return;
      const dx = e.clientX - state.x;
      state.x = e.clientX;
      state.total += dx;
      const m = motion.current;
      if (!state.moved && Math.abs(state.total) > 6) {
        state.moved = true;
        m.dragging = true;
        m.auto = false;
        m.target = null;
        m.settle = false;
        m.vel = 0;
      }
      if (!state.moved) return;
      const turn = dx * degPerPx;
      const dt = Math.max((e.timeStamp - state.time) / 1000, 1 / 120);
      state.time = e.timeStamp;
      m.rot += turn;
      m.vel = m.vel * 0.6 + (turn / dt) * 0.4;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== drag.current.id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const m = motion.current;
      if (drag.current.moved) {
        m.dragging = false;
        m.vel = Math.max(-720, Math.min(720, m.vel));
        m.settle = true;
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const current = selected === null ? null : (areas[selected] ?? null);
  const open = selected !== null;

  return (
    <div
      ref={block}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') release();
      }}
      className="flex flex-col gap-5 md:gap-7"
    >
      <div className="flex flex-col gap-3">
        {webgl === false ? null : (
          <div
            ref={stage}
            role="presentation"
            onPointerDown={onPointerDown}
            className={cn(
              'relative h-[18rem] w-full touch-pan-y select-none sm:h-[22rem] md:h-[26rem] lg:h-[30rem]',
              pointing ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
            )}
          >
            {webgl ? (
              <TeamRingScene
                logos={areas.map(({ key, name }) => ({ key, name }))}
                motion={motion}
                selected={selected}
                reduce={reduce}
                narrow={narrow}
                fog={SECTION_COLOR}
                active={active}
                label={label}
                onPick={(index) => {
                  if (!drag.current.moved) select(index);
                }}
                onSettle={choose}
                onPointing={setPointing}
              />
            ) : null}
            {/* The selected area's name, moved under its logo every frame. */}
            <span
              ref={label}
              aria-hidden
              data-hidden="true"
              className="cdl-ring-label pointer-events-none absolute left-0 top-0 whitespace-nowrap font-titulo text-2xl font-bold md:text-[2rem]"
              style={{ color: current?.label }}
            >
              {current?.name}
            </span>
          </div>
        )}

        <p className="text-base text-ink-faint md:text-center">
          {finePointer ? labels.ringHint.pointer : labels.ringHint.touch}
        </p>

        {/* Every area by name: the accessible way in, and the fastest one on
            a phone. A swipeable rail there, centred rows from tablet up. */}
        <div
          role="group"
          aria-label={labels.ringHint.label}
          className="gutter-scroll -mx-[max(1.5rem,6.25vw)] flex snap-x gap-2 overflow-x-auto px-[max(1.5rem,6.25vw)] pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {areas.map((each, index) => {
            const pressed = selected === index;
            return (
              <button
                key={each.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(index)}
                data-light=""
                data-ripple=""
                className={cn(
                  'cdl-press cdl-light cdl-light-edge cdl-nav-item inline-flex min-h-12 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-pill border px-4 text-base font-medium',
                  pressed ? 'border-accent' : 'border-hairline',
                )}
                style={{ '--cdl-light-rgb': each.rgb, '--cdl-light-alpha': '0.16' } as React.CSSProperties}
              >
                <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: each.accent }} />
                {each.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* The selected area's details. They fold open and shut (grid rows,
          not a measured height) and unmount once shut. */}
      <div
        aria-live="polite"
        inert={!open}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && !open) setShown(null);
        }}
        className={cn(
          'grid ease-in-out-ui',
          instant ? 'transition-none' : 'transition-[grid-template-rows] duration-500',
        )}
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          {shown ? (
            <div key={shown.key} data-open="">
              <AreaDetails area={shown} labels={labels} reduce={reduce} highlight={target} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** What the selected area owns, who is in it and where it writes. */
function AreaDetails({
  area,
  labels,
  reduce,
  highlight,
}: {
  area: ExplorerArea;
  labels: ExplorerLabels;
  reduce: boolean;
  highlight: string | null;
}) {
  const headingId = `area-${area.key}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-7 border-t-2 pt-5 md:gap-9 md:pt-7"
      style={{ borderColor: area.accent }}
    >
      <div data-stagger="" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-9">
        <div className="flex flex-col gap-2">
          <span className="text-base font-medium uppercase tabular-nums" style={{ color: area.label }}>
            {area.countLabel}
          </span>
          <h2 id={headingId} className="text-balance-tight text-[2.5rem] leading-none md:text-[3.5rem]">
            {area.name}
          </h2>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">{area.brief}</p>
          <TextLink href={`/publications?area=${area.key}`}>{labels.logLink}</TextLink>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 data-stagger="" style={{ '--i': 1 } as React.CSSProperties} className="text-base font-medium uppercase text-accent">
          {labels.dutiesTitle}
        </h3>
        <ol className="grid gap-3 md:grid-cols-3">
          {area.duties.map((duty, index) => (
            <li
              key={duty}
              data-stagger=""
              data-light=""
              style={
                {
                  '--i': index + 2,
                  '--cdl-light-rgb': area.rgb,
                  '--cdl-light-alpha': '0.16',
                } as React.CSSProperties
              }
              className="cdl-light cdl-light-edge relative flex flex-col gap-3 overflow-hidden rounded-card border border-hairline bg-surface p-4 md:p-5"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: area.accent }} />
              <span className="font-titulo text-[2.5rem] font-bold leading-none tabular-nums" style={{ color: area.label }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-base text-ink">{duty}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <h3 data-stagger="" style={{ '--i': 5 } as React.CSSProperties} className="text-base font-medium uppercase text-accent">
          {labels.membersTitle}
        </h3>
        {area.members.length === 0 ? (
          <div
            data-stagger=""
            style={{ '--i': 6 } as React.CSSProperties}
            className="flex min-h-48 flex-col items-start justify-center gap-3 rounded-block border border-dashed border-hairline-strong p-5"
          >
            <p className="font-titulo text-2xl font-bold">{labels.emptyTitle}</p>
            <p className="max-w-[48ch] text-base text-ink-muted">{labels.emptyBody}</p>
          </div>
        ) : !reduce && area.members.length >= RING_MIN ? (
          <div data-stagger="" style={{ '--i': 6 } as React.CSSProperties}>
            <MemberRing
              members={area.members}
              area={area}
              labels={labels.card}
              ringLabels={{ ...labels.ring, label: `${labels.membersTitle}: ${area.name}` }}
              highlight={highlight}
            />
          </div>
        ) : (
          <CardCarousel
            label={`${labels.membersTitle}: ${area.name}`}
            previousLabel={labels.previous}
            nextLabel={labels.next}
          >
            {area.members.map((member, index) => (
              <div key={member.id} data-stagger="" style={{ '--i': index + 6 } as React.CSSProperties}>
                <MemberFlipCard member={member} area={area} labels={labels.card} highlight={highlight === member.id} />
              </div>
            ))}
          </CardCarousel>
        )}
      </div>
    </section>
  );
}
