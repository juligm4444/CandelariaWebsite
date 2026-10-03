'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

/**
 * Opens the Polar billing portal. The URL is minted server side for the
 * current session and used for a single top-level navigation.
 */
export function PortalButton({ label, note }: { label: string; note: string }) {
  const [pending, setPending] = useState(false);

  const open = async () => {
    setPending(true);
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      if (!response.ok) return;

      const data: unknown = await response.json().catch(() => null);
      const url =
        data && typeof data === 'object' && 'url' in data ? (data as { url: unknown }).url : null;

      if (typeof url === 'string' && url.startsWith('https://')) window.location.assign(url);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button variant="secondary" onClick={open} disabled={pending}>
        {label}
      </Button>
      <p className="text-base text-ink-faint">{note}</p>
    </div>
  );
}
