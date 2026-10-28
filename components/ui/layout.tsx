import type { ReactNode } from 'react';

import { Backdrop } from '@/components/motion/backdrop';
import { KineticText } from '@/components/motion/kinetic-text';
import { cn } from '@/lib/utils';

/**
 * Horizontal rhythm. The side margin is 6.25% of the viewport with a 24px
 * floor, exactly as the manual's 120px-on-1920 grid resolves (§7), so the
 * content runs the full width of the screen between those margins instead
 * of sitting in a fixed column. The cap (120rem: the 1920 canvas, scaled
 * with the root size on larger screens, see `html` in globals.css) only
 * bites on ultra-wide screens, where it keeps lines and grids from
 * stretching across a 21:9 panel.
 */
export function Container({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode;
  className?: string;
  width?: 'default' | 'narrow' | 'reading';
}) {
  return (
    <div
      className={cn(
        'gutter mx-auto w-full',
        width === 'default' && 'max-w-[120rem]',
        width === 'narrow' && 'max-w-[65rem]',
        width === 'reading' && 'max-w-[47.5rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Vertical rhythm, in multiples of 8. `surface` selects the surface family:
 * `paper` flips the semantic variables through `.on-paper`, which is the
 * alternating light/dark band the manual asks for (§7) inside a single theme.
 *
 * Every section carries a living background for its surface (see
 * components/motion/backdrop.tsx) unless `backdrop={false}`. The section is
 * `isolate` so that layer can sit behind the content and still above the
 * section's own colour; dark sections also host the pointer halo.
 */
export function Section({
  children,
  className,
  id,
  as: Tag = 'section',
  surface = 'canvas',
  space = 'default',
  labelledBy,
  backdrop = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  surface?: 'canvas' | 'raised' | 'paper';
  space?: 'default' | 'tight' | 'loose';
  labelledBy?: string;
  /** Living background behind the content. On by default. */
  backdrop?: boolean;
}) {
  const dark = surface !== 'paper';
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      data-halo={backdrop && dark ? '' : undefined}
      className={cn(
        'relative isolate',
        surface === 'canvas' && 'bg-canvas text-ink',
        surface === 'raised' && 'bg-surface text-ink',
        surface === 'paper' && 'on-paper',
        space === 'tight' && 'py-9 md:py-15',
        space === 'default' && 'py-15 md:py-[7.5rem]',
        space === 'loose' && 'py-[7.5rem] md:py-[10rem]',
        className,
      )}
    >
      {backdrop ? <Backdrop variant={dark ? 'dark' : 'paper'} /> : null}
      {children}
    </Tag>
  );
}

/**
 * Section label. 16px, weight 500, uppercase, tracking 0 (the manual pins
 * letter-spacing at 0%, which is also what keeps this from reading as the
 * usual wide-tracked eyebrow).
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-base font-medium uppercase text-accent', className)}>{children}</p>
  );
}

/** Section heading plus optional lead, stacked. Never a left/right split. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = 'start',
  level = 2,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'start' | 'center';
  level?: 2 | 3;
  className?: string;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={cn(
          'text-balance-tight',
          level === 2 ? 'cdl-kinetic text-[2rem] md:text-[3rem]' : 'text-2xl md:text-[2rem]',
        )}
      >
        {/* Section titles rise in letter by letter; smaller headings stay plain. */}
        {level === 2 ? <KineticText text={title} /> : title}
      </Heading>
      {lead ? (
        <p
          className={cn(
            'max-w-[65ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.5]',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/** 1px divider at 14% of the text colour, per the manual. */
export function Hairline({ className }: { className?: string }) {
  return <hr className={cn('h-px w-full border-0 bg-hairline', className)} />;
}
