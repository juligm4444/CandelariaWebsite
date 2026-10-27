'use client';

import { useSyncExternalStore } from 'react';

/**
 * `prefers-reduced-motion`, safe for server rendering.
 *
 * Motion's own hook reads the media query during the first client render,
 * so a reader with reduced motion gets different markup from the server and
 * React throws a hydration error. This hook reports `false` on the server and
 * during hydration (React uses the server snapshot there), then the real
 * preference, and it follows the setting if the reader changes it.
 */
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const snapshot = () => window.matchMedia(QUERY).matches;
const serverSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
