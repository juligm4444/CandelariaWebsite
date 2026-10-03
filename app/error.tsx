'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/layout';

/**
 * Route-level error boundary.
 *
 * The visitor sees a fixed message. `error.message` is never rendered: in
 * production Next replaces it with a digest, and in development it can carry a
 * connection string or a provider error that must not reach the page.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[boundary] %s', error.digest ?? 'unhandled error');
  }, [error]);

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-start gap-4">
        <h1 className="text-balance-tight text-[2rem] md:text-[3rem]">
          Algo falló de nuestro lado
        </h1>
        <p className="max-w-[48ch] text-base text-ink-muted">
          El error quedó registrado. Vuelve a cargar la página o inténtalo en un momento.
        </p>
        {error.digest ? (
          <p className="text-base text-ink-faint">Referencia: {error.digest}</p>
        ) : null}
        <Button variant="accent" size="lg" onClick={reset}>
          Recargar
        </Button>
      </Container>
    </Section>
  );
}
