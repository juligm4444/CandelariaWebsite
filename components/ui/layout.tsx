import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Horizontal rhythm. The side margin is 6.25% of the viewport with a 24px
 * floor, exactly as the manual's 120px-on-1920 grid resolves (§7).
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
        width === 'default' && 'max-w-[1400px]',
        width === 'narrow' && 'max-w-[1040px]',
        width === 'reading' && 'max-w-[760px]',
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
 */
export function Section({
  children,
  className,
  id,
  as: Tag = 'section',
  surface = 'canvas',
  space = 'default',
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  surface?: 'canvas' | 'raised' | 'paper';
  space?: 'default' | 'tight' | 'loose';
  labelledBy?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'relative',
        surface === 'canvas' && 'bg-canvas text-ink',
        surface === 'raised' && 'bg-surface text-ink',
        surface === 'paper' && 'on-paper',
        space === 'tight' && 'py-9 md:py-15',
        space === 'default' && 'py-15 md:py-[7.5rem]',
        space === 'loose' && 'py-[7.5rem] md:py-[10rem]',
        className,
      )}
    >
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
          level === 2 ? 'text-[2rem] md:text-[3rem]' : 'text-2xl md:text-[2rem]',
        )}
      >
        {title}
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
