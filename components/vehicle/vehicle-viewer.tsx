'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/surface';

/**
 * The Three.js bundle is the heaviest thing on the site, so it is loaded only
 * on this page and only in the browser. The placeholder holds the exact
 * aspect ratio of the canvas, which keeps the layout from shifting when the
 * model arrives.
 */
const SolarCarModel = dynamic(() => import('./solar-car-model'), {
  ssr: false,
  loading: () => <Skeleton className="aspect-[16/10] w-full rounded-block" />,
});

export function VehicleViewer({ label, hint }: { label: string; hint: string }) {
  return <SolarCarModel label={label} hint={hint} />;
}
