import { Skeleton } from '@/components/ui/surface';
import { Container, Section } from '@/components/ui/layout';

/**
 * Route-level fallback. Almost every page here is rendered per request, and
 * without this file a click on a menu waited for the whole server response
 * before anything moved, which read as a click that did nothing. With it,
 * navigation commits at once: the header and footer stay, a line of gold
 * light runs under the header and the page's shape fills in.
 *
 * No copy, so it needs no dictionary and can be prefetched as a static
 * shell. `aria-busy` tells assistive technology the region is loading.
 */
export default function Loading() {
  return (
    <div aria-busy="true">
      <div aria-hidden className="cdl-scan fixed inset-x-0 top-[4.5rem] z-30 h-0.5" />
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col gap-4">
          <Skeleton className="h-14 w-full max-w-[28rem] md:h-16" />
          <Skeleton className="h-6 w-full max-w-[40rem]" />
          <Skeleton className="h-6 w-full max-w-[32rem]" />
          <Skeleton className="mt-5 h-[40vh] min-h-64 w-full rounded-block" />
        </Container>
      </Section>
    </div>
  );
}
