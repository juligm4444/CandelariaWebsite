import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Button geometry comes from the brand manual (§7): 16px text, weight 500,
 * 12px radius, 16/24 padding, no shadow. `primary` inverts against whichever
 * surface family it sits on; `accent` is gold on deep purple, which holds
 * 10.83:1 on both families.
 */
type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-200 ease-brand ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--cdl-btn-bg)] text-[var(--cdl-btn-fg)] hover:bg-[var(--cdl-btn-bg-hover)]',
  accent: 'bg-dorado-100 text-morado-300 hover:bg-dorado-200',
  secondary:
    'border border-hairline-strong bg-transparent text-ink hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-ink-muted hover:text-ink',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-4 py-2 text-base',
  lg: 'min-h-14 px-6 py-3 text-base',
};

type SharedProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: SharedProps & ComponentProps<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

/** For links that leave the site. Always carries rel protections. */
export function ButtonExternal({
  variant = 'secondary',
  size = 'md',
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
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}
