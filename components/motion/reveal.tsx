import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Scroll reveal.
 *
 * Driven entirely by CSS (`animation-timeline: view()`), for one reason that
 * matters more than the effect: the content is visible by default. A
 * JavaScript reveal that starts at `opacity: 0` and waits for an observer
 * leaves the page blank whenever the script fails, is blocked, or never runs,
 * and that is a content failure, not a missing animation.
 *
 * Browsers without scroll-driven animations simply show the content. Under
 * `prefers-reduced-motion` so does everything else. Being a Server Component,
 * it also ships no JavaScript at all.
 *
 * The motion is motivated: it establishes reading order inside a section, so
 * the eye lands on the first cell before the ones beside it.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Seconds of offset, applied as a range shift so items stagger. */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('cdl-reveal', className)}
      style={delay ? ({ '--cdl-reveal-delay': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
