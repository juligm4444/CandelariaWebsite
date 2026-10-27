import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Text link with an arrow: a halo of light follows the pointer behind the
 * label, the glyphs light up (never an underline) and the arrow leans forward (see
 * `.cdl-link` in globals.css). The 48px minimum height keeps it a comfortable
 * touch target even though it reads as text.
 */
export function TextLink({
  href,
  children,
  className,
  arrow = true,
  ...props
}: Omit<ComponentProps<typeof Link>, 'children'> & {
  children: ReactNode;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      data-light=""
      className={cn(
        'cdl-link inline-flex min-h-12 items-center gap-2 self-start text-base font-medium text-accent',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {arrow ? <IconArrowRight className="icon-brand cdl-link-arrow size-5" aria-hidden /> : null}
    </Link>
  );
}
