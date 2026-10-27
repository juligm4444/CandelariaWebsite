import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Button geometry comes from the brand manual (§7): 16px text, weight 500,
 * 12px radius, 16/24 padding, no shadow. `primary` inverts against whichever
 * surface family it sits on; `accent` is gold on deep purple, which holds
 * 10.83:1 on both families.
 *
 * Interaction is light, never shadow (see "Interaction light" in
 * globals.css): a halo follows the pointer, the gold button gets a sheen,
 * the outline button's border lights up near the pointer, and every press
 * scales down and drops a ripple of light at the press point. The light
 * colour is set per variant through `--cdl-light-rgb`.
 */
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'cdl-press cdl-light inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--cdl-btn-bg)] text-[var(--cdl-btn-fg)] hover:bg-[var(--cdl-btn-bg-hover)] [--cdl-light-alpha:0.3]',
  accent:
    'cdl-sheen bg-dorado-100 text-morado-300 [--cdl-light-rgb:255_255_255] [--cdl-light-alpha:0.38] [--cdl-light-size:180px]',
  secondary:
    'cdl-light-edge border border-hairline-strong bg-transparent text-ink hover:border-hairline hover:text-accent [--cdl-light-alpha:0.12]',
  ghost: 'bg-transparent text-ink-muted hover:text-ink [--cdl-light-alpha:0.12]',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-4 py-2 text-base',
  lg: 'min-h-14 px-6 py-3 text-base',
};

type SharedProps = {
  variant?: Variant;
  size?: Size;
  /** Leans toward the pointer. Reserve for one or two primary calls to action per view. */
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
};

function interaction(magnetic: boolean | undefined) {
  return {
    'data-light': '',
    'data-ripple': '',
    ...(magnetic ? { 'data-magnetic': '' } : {}),
  };
}

export function Button({
  variant = 'primary',
  size = 'md',
  magnetic,
  className,
  children,
  ...props
}: SharedProps & ComponentProps<'button'>) {
  return (
    <button
      {...interaction(magnetic)}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  magnetic,
  className,
  children,
  ...props
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...interaction(magnetic)}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

/** For links that leave the site. Always carries rel protections. */
export function ButtonExternal({
  variant = 'secondary',
  size = 'md',
  magnetic,
  className,
  children,
  href,
  ...props
}: SharedProps & ComponentProps<'a'>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...interaction(magnetic)}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}
