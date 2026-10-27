'use client';

import { IconCube3dSphereOff } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';

import { Skeleton } from '@/components/ui/surface';
import { useWebGLSupport } from '@/lib/webgl';

import { STAGE_SIZE, STAGE_SURFACE, type HotspotLabels, type ViewerHotspot } from './types';

/**
 * The Three.js bundle is the heaviest thing on the site, so it is loaded only
 * in the browser. The placeholder holds the exact aspect ratio of the canvas,
 * which keeps the layout from shifting when the model arrives.
 */
const placeholder = <Skeleton className={`${STAGE_SIZE} ${STAGE_SURFACE} w-full rounded-block`} />;

const SolarCarModel = dynamic(() => import('./solar-car-model'), {
  ssr: false,
  loading: () => placeholder,
});

/**
 * When to start downloading the model:
 * - `false`: as soon as the page hydrates (the vehicle page, where the model
 *   is the subject).
 * - `'visible'`: when the viewer is about to scroll into view.
 * - `'idle'`: after the page has loaded and the main thread is idle. Used in
 *   the home hero, where the model is above the fold but must not compete
 *   with the headline for bandwidth or main-thread time on first paint.
 */
export type ViewerDefer = false | 'visible' | 'idle';

function ViewerFallback({ message }: { message: string }) {
  return (
    <div
      role="note"
      className={`flex ${STAGE_SIZE} w-full flex-col items-center justify-center gap-3 rounded-block border border-hairline bg-surface p-5 text-center`}
    >
      <IconCube3dSphereOff className="icon-brand size-10 text-accent" aria-hidden />
      <p className="max-w-[44ch] text-base text-ink-muted">{message}</p>
    </div>
  );
}

/**
 * Local error boundary. Anything that goes wrong inside the 3D scene (a lost
 * context, a driver failure mid-render) is contained here and replaced by the
 * fallback, instead of bubbling up to app/error.tsx and taking the whole page
 * down with it.
 */
class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[viewer] 3D model disabled: %s', error instanceof Error ? error.message : error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function VehicleViewer({
  label,
  hint,
  fallback,
  defer = false,
  hotspots,
  hotspotLabels,
}: {
  label: string;
  hint: string;
  /** Clickable parts of the model, prepared on the server. */
  hotspots?: ViewerHotspot[];
  hotspotLabels?: HotspotLabels;
  /** Shown instead of the model when the browser cannot render WebGL. */
  fallback: string;
  defer?: ViewerDefer;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(defer === false);
  const webgl = useWebGLSupport();

  useEffect(() => {
    if (ready || defer === false || webgl === false) return;

    if (defer === 'idle') {
      let idleId: number | undefined;
      let timeoutId: number | undefined;
      const start = () => {
        // Safari has no requestIdleCallback; a short timeout after `load`
        // is the fallback.
        if (typeof window.requestIdleCallback === 'function') {
          idleId = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
        } else {
          timeoutId = setTimeout(() => setReady(true), 600) as unknown as number;
        }
      };
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start, { once: true });
      return () => {
        window.removeEventListener('load', start);
        if (idleId !== undefined) window.cancelIdleCallback(idleId);
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      };
    }

    const node = anchor.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, defer, webgl]);

  const fallbackView = <ViewerFallback message={fallback} />;

  // Never download Three.js for a browser that cannot use it.
  if (webgl === false) return fallbackView;

  if (ready && webgl) {
    return (
      <ViewerBoundary fallback={fallbackView}>
        <SolarCarModel label={label} hint={hint} hotspots={hotspots} hotspotLabels={hotspotLabels} />
      </ViewerBoundary>
    );
  }

  return <div ref={anchor}>{placeholder}</div>;
}
