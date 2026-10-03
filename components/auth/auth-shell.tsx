import type { ReactNode } from 'react';

import { Isotipo } from '@/components/brand/lockup';
import { Container, Section } from '@/components/ui/layout';
import { Panel } from '@/components/ui/surface';

/**
 * Shared frame for the four authentication screens. Narrow column with the
 * mark above it, so the forms read as one family and never as a different site.
 */
export function AuthShell({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Section space="tight" className="overflow-hidden">
      <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
      <Container width="reading" className="relative flex flex-col items-start gap-5">
        <Isotipo size={64} alt="" className="-ml-4" />
        <header className="flex flex-col gap-2">
          <h1 className="text-balance-tight text-[2rem] md:text-[3rem]">{title}</h1>
          <p className="max-w-[48ch] text-base text-ink-muted">{lead}</p>
        </header>
        <Panel className="w-full">{children}</Panel>
        {footer ? <div className="text-base text-ink-muted">{footer}</div> : null}
      </Container>
    </Section>
  );
}
