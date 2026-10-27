'use client';

import { useEffect } from 'react';

/**
 * Reports one read of a publication. Once per tab session per slug; the
 * server applies its own per-visitor window on top.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `cdl:read:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Storage blocked: the server-side window still deduplicates.
    }
    const body = new Blob([JSON.stringify({ slug })], { type: 'application/json' });
    if (!navigator.sendBeacon?.('/api/publications/view', body)) {
      void fetch('/api/publications/view', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  }, [slug]);
  return null;
}
