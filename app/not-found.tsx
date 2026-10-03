import { Isotipo } from '@/components/brand/lockup';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/layout';
import { getContent } from '@/lib/i18n/server';

export default async function NotFound() {
  const { t } = await getContent();

  return (
    <Section className="overflow-hidden">
      <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
      <Container width="narrow" className="relative flex flex-col items-start gap-5">
        <Isotipo size={96} alt="" className="-ml-6 opacity-80" />
        <h1 className="text-balance-tight text-[2.5rem] md:text-[3.5rem]">{t.notFound.title}</h1>
        <p className="max-w-[48ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
          {t.notFound.lead}
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/" variant="accent" size="lg">
            {t.notFound.cta}
          </ButtonLink>
          <ButtonLink href="/publications" variant="secondary" size="lg">
            {t.notFound.secondary}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
