'use client';

import { useEffect, useRef } from 'react';

/**
 * Living background for a section, drawn behind its content (the section is
 * `isolate`, this layer sits at `z-index: -1`). Every layer is either static
 * paint (rasterised once) or a `transform`/`opacity` animation, so nothing
 * here repaints the page while it moves.
 *
 * Dark surfaces (canvas, raised):
 * - aurora: two soft pools of brand and area light drifting very slowly;
 * - cells: the loader's faint solar-cell grid, with a band of gold light
 *   that crosses it as the section scrolls through the viewport;
 * - grain: a fixed film-grain tile, so flat purple never reads as dead;
 * - halo: a pool of light that follows a mouse pointer (moved by
 *   components/interaction/interaction-layer.tsx, `transform` only).
 * Paper surfaces:
 * - blueprint: an engineering grid with registration marks in the corners;
 * - grain, lighter.
 * Both: a seam of gold light along the top edge that draws itself in as the
 * section enters.
 *
 * Cost control, all in CSS (see "Backdrops" in app/globals.css):
 * - `data-inview` (set here) is the only state that runs the aurora, so a
 *   page of ten sections animates only the one or two on screen;
 * - `html[data-lite]` and reduced motion hold everything still, and drop the
 *   halo;
 * - scroll-linked pieces use scroll-driven animations where the browser has
 *   them, and are simply static elsewhere.
 */

let observer: IntersectionObserver | null = null;

function watch(node: HTMLElement) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) target.dataset.inview = '';
        else delete target.dataset.inview;
      }
    },
    { rootMargin: '10% 0px' },
  );
  observer.observe(node);
  return () => observer?.unobserve(node);
}

export function Backdrop({ variant }: { variant: 'dark' | 'paper' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return watch(node);
  }, []);

  return (
    <div ref={ref} aria-hidden className="cdl-backdrop" data-variant={variant}>
      {variant === 'dark' ? (
        <>
          <div className="cdl-bd-aurora" />
          <div className="cdl-bd-cells" />
          <div className="cdl-bd-halo" />
        </>
      ) : (
        <>
          <div className="cdl-bd-blueprint" />
          <div className="cdl-bd-marks" />
        </>
      )}
      <div className="cdl-bd-grain" />
      <div className="cdl-bd-seam" />
    </div>
  );
}
