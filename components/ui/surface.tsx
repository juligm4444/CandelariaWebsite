import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Panel. 1px hairline, 24px radius for blocks and 16px for small cards, 32px
 * padding, no shadow (brand manual §7). Depth comes from the background step,
 * never from an elevation effect.
 */
export function Panel({
  children,
  className,
  size = 'block',
  tone = 'surface',
  accent,
}: {
  children: ReactNode;
  className?: string;
  size?: 'block' | 'card';
  tone?: 'surface' | 'raised' | 'transparent';
  /** Area colour. Paints a 2px bar along the top edge and nothing else. */
  accent?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-hairline',
        size === 'block' ? 'rounded-block p-4 md:p-[2rem]' : 'rounded-card p-4',
        tone === 'surface' && 'bg-surface',
        tone === 'raised' && 'bg-surface-raised',
        tone === 'transparent' && 'bg-transparent',
        className,
      )}
    >
      {accent ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: accent }}
        />
      ) : null}
      {children}
    </div>
  );
}

/** Small rounded label. 12px radius, per the manual's pill rule. */
export function Pill({
  children,
  className,
  tone = 'neutral',
  style,
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent' | 'outline';
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill px-2 py-1 text-base font-medium leading-tight',
        tone === 'neutral' && 'bg-surface-raised text-ink',
        tone === 'accent' && 'bg-dorado-100 text-morado-300',
        tone === 'outline' && 'border border-hairline-strong text-ink-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Empty state. Composed, not apologetic: it says what is missing and who fills
 * it, because every list on this site is populated by an area lead.
 */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-block border border-dashed border-hairline-strong p-4 md:p-[2rem]',
        className,
      )}
    >
      <h3 className="text-2xl">{title}</h3>
      <p className="max-w-[55ch] text-base text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

/** Skeleton that matches the shape of what is loading, not a spinner. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-card bg-hairline', className)}
    />
  );
}
