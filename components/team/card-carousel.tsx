'use client';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Horizontal rail of cards.
 *
 * Native scroll with snap points, so trackpads, touch and keyboard (the rail
 * is focusable) all work without script. On top of that: previous/next
 * buttons that disable at the ends, drag-to-scroll for a mouse, and edge fades
 * that only appear where there is more to see.
 *
 * A drag never counts as a click: if the pointer travelled, the click that
 * ends the drag is cancelled before it reaches a card (so it neither flips a
 * card nor follows a link).
 */
export function CardCarousel({
  children,
  label,
  previousLabel,
  nextLabel,
}: {
  children: ReactNode[];
  label: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const reduce = usePrefersReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      setEdges({ start: track.scrollLeft <= 4, end: track.scrollLeft >= max - 4 });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    onScroll();
    track.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(':scope > li');
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0;
    const width = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    const perView = Math.max(1, Math.floor(track.clientWidth / width));
    track.scrollBy({ left: direction * width * perView, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = { active: true, moved: false, x: event.clientX, left: track.scrollLeft };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const state = drag.current;
    const track = trackRef.current;
    if (!state.active || !track) return;
    const dx = event.clientX - state.x;
    if (!state.moved && Math.abs(dx) > 6) {
      state.moved = true;
      track.setPointerCapture(event.pointerId);
      track.style.scrollSnapType = 'none';
      track.style.cursor = 'grabbing';
    }
    if (state.moved) track.scrollLeft = state.left - dx;
  };

  const endDrag = () => {
    const track = trackRef.current;
    drag.current.active = false;
    if (track) {
      track.style.removeProperty('scroll-snap-type');
      track.style.removeProperty('cursor');
    }
  };

  const showEdges = cn(!edges.start && 'cdl-fade-start', !edges.end && 'cdl-fade-end');

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        role="list"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className={cn(
          'cdl-rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-4 [scrollbar-width:none] focus-visible:outline-offset-4 [&::-webkit-scrollbar]:hidden',
          showEdges,
        )}
      >
        {children.map((child, index) => (
          <li key={index} className="snap-start">
            {child}
          </li>
        ))}
      </ul>

      {!(edges.start && edges.end) ? (
        <div className="mt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={edges.start}
            aria-label={previousLabel}
            data-light=""
            data-ripple=""
            className="cdl-light cdl-press inline-flex size-12 items-center justify-center rounded-pill border border-hairline-strong text-ink hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
          >
            <IconChevronLeft className="icon-brand size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={edges.end}
            aria-label={nextLabel}
            data-light=""
            data-ripple=""
            className="cdl-light cdl-press inline-flex size-12 items-center justify-center rounded-pill border border-hairline-strong text-ink hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
          >
            <IconChevronRight className="icon-brand size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
