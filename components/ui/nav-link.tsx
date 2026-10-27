'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Navigation link, the one every menu on the site uses (desktop bar, mobile
 * sheet, footer). It owns two states so no menu re-implements them:
 *
 * - Current page: `aria-current="page"`, which `.cdl-nav-item` turns into
 *   gold text that glows. Never an underline.
 * - Pending: from the click until the next page commits, the label pulses
 *   the same light (`useLinkStatus`). Most pages are rendered per request,
 *   so without this a slow response looked like a click that did nothing
 *   and people clicked again.
 *
 * A section counts as current for its own sub-pages too (/publications/x
 * keeps "Bitácora" lit). `exact` turns that off, for "/".
 */
export function isCurrentPath(pathname: string, href: string, exact = false): boolean {
  if (exact || href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  exact,
  className,
  adornment,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href' | 'children'> & {
  href: string;
  exact?: boolean;
  /** Decoration positioned against the whole link (e.g. a hover pill), outside the label. */
  adornment?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = isCurrentPath(pathname, href, exact);

  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn('cdl-nav-item', className)}
      {...props}
    >
      {adornment}
      <NavLabel>{children}</NavLabel>
    </Link>
  );
}

function NavLabel({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return <span className={cn('relative', pending && 'cdl-pending')}>{children}</span>;
}
