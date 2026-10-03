import { IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

import { Isotipo } from '@/components/brand/lockup';
import { AreaCard } from '@/components/content/area-card';
import { PublicationCard } from '@/components/content/publication-card';
import { Reveal } from '@/components/motion/reveal';
import { ValuesBand } from '@/components/motion/values-band';
import { ButtonLink } from '@/components/ui/button';
import { Container, Eyebrow, Hairline, Section, SectionHeader } from '@/components/ui/layout';
import { EmptyState, Panel } from '@/components/ui/surface';
import { areas } from '@/content/areas';
import { latestPublications, type Publication } from '@/lib/db/publications';
import { getContent } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { locale, t } = await getContent();

  // The site must render before the database exists. A failure here degrades
  // to the empty state instead of a 500 on the landing page.
  const updates: Publication[] = await latestPublications(locale, 3).catch(() => []);

  return (
    <>
      {/* 1. Hero. Asymmetric split: the message on the left, the mark on the
          right over the one permitted halo. */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="halo-brand pointer-events-none absolute inset-0 opacity-70"
        />
        <Container className="relative grid min-h-[calc(100dvh-4.5rem)] items-center gap-9 py-9 lg:grid-cols-[7fr_5fr] lg:gap-15">
          <div className="flex flex-col items-start gap-5">
            <h1 className="text-balance-tight text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem]">
              {t.home.hero.title}
            </h1>
            <p className="max-w-[46ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
              {t.home.hero.lead}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <ButtonLink href="/vehicle" variant="accent" size="lg">
                {t.home.hero.primary}
                <IconArrowRight className="icon-brand size-5" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary" size="lg">
                {t.home.hero.secondary}
              </ButtonLink>
            </div>
          </div>

          <div className="relative justify-self-center lg:justify-self-end">
            <Isotipo size={320} alt={t.home.hero.isotipoAlt} priority className="max-w-[72vw]" />
          </div>
        </Container>
      </section>

      {/* 2. What the project is. Bento with real visual variation: one image
          cell, one material cell, one typographic cell. */}
      <Section surface="raised" labelledBy="pilares">
        <Container className="flex flex-col gap-7">
          <SectionHeader id="pilares" title={t.home.pillars.title} lead={t.home.pillars.lead} />

          <div className="grid gap-3 md:grid-cols-6">
            <Reveal className="md:col-span-4">
              <article className="relative flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-block border border-hairline p-4 md:p-5">
                <Image
                  src="/img/fibra.webp"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-morado-300 via-morado-300/70 to-morado-300/10"
                />
                <div className="relative flex flex-col gap-2">
                  <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">
                    {t.home.pillars.items[0]?.title}
                  </h3>
                  <p className="max-w-[48ch] text-base text-ink-muted">
                    {t.home.pillars.items[0]?.body}
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal className="md:col-span-2" delay={0.08}>
              <Panel className="flex h-full flex-col justify-between gap-5">
                <Isotipo size={72} alt="" className="-ml-4.5 opacity-90" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-titulo text-2xl font-bold">
                    {t.home.pillars.items[1]?.title}
                  </h3>
                  <p className="text-base text-ink-muted">{t.home.pillars.items[1]?.body}</p>
                </div>
              </Panel>
            </Reveal>

            <Reveal className="md:col-span-6" delay={0.16}>
              <article className="relative flex min-h-56 items-end overflow-hidden rounded-block border border-hairline p-4 md:p-5">
                <Image
                  src="/img/luz.webp"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover object-right"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-morado-300 via-morado-300/75 to-morado-300/5"
                />
                <div className="relative flex max-w-[52ch] flex-col gap-2">
                  <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">
                    {t.home.pillars.items[2]?.title}
                  </h3>
                  <p className="text-base text-ink-muted">{t.home.pillars.items[2]?.body}</p>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 3. The seven areas. A horizontal rail, because seven items in a grid
          reads as a dump and seven rows reads as a list. */}
      <Section labelledBy="areas" space="tight">
        <Container className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              id="areas"
              eyebrow={t.home.areas.eyebrow}
              title={t.home.areas.title}
              lead={t.home.areas.lead}
            />
            <Link
              href="/team"
              className="inline-flex min-h-12 items-center gap-2 text-base font-medium text-accent"
            >
              {t.home.areas.cta}
              <IconArrowRight className="icon-brand size-5" aria-hidden />
            </Link>
          </div>
        </Container>

        <ul className="gutter gutter-scroll mx-auto mt-5 flex w-full max-w-[1400px] snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
          {areas.map((area) => (
            <li key={area.key} className="w-72 shrink-0 snap-start">
              <AreaCard area={area} locale={locale} href={`/team#${area.key}`} />
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. Method. Paper band, triptych divided by hairlines. */}
      <Section surface="paper" labelledBy="metodo">
        <Container className="flex flex-col gap-7">
          <SectionHeader id="metodo" title={t.home.method.title} lead={t.home.method.lead} />

          <ol className="grid gap-5 md:grid-cols-3 md:gap-0">
            {t.home.method.steps.map((step, index) => (
              <li
                key={step.verb}
                className="flex flex-col gap-2 border-t border-hairline pt-4 md:border-l md:border-t-0 md:pl-5 md:pr-5 md:pt-0 md:first:border-l-0 md:first:pl-0"
              >
                <h3 className="font-titulo text-[2rem] font-bold text-accent">{step.verb}</h3>
                <p className="text-base text-ink-muted">{step.body}</p>
                <span aria-hidden className="sr-only">
                  {index + 1}
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 5. Latest publications. Editorial list from the database. */}
      <Section labelledBy="bitacora">
        <Container className="flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              id="bitacora"
              eyebrow={t.home.updates.eyebrow}
              title={t.home.updates.title}
              lead={t.home.updates.lead}
            />
            <Link
              href="/publications"
              className="inline-flex min-h-12 items-center gap-2 text-base font-medium text-accent"
            >
              {t.home.updates.cta}
              <IconArrowRight className="icon-brand size-5" aria-hidden />
            </Link>
          </div>

          {updates.length === 0 ? (
            <EmptyState title={t.home.updates.emptyTitle} body={t.home.updates.emptyBody} />
          ) : (
            <ul className="grid gap-5 md:grid-cols-3">
              {updates.map((publication, index) => (
                <li key={publication.id}>
                  <PublicationCard
                    publication={publication}
                    locale={locale}
                    t={t}
                    priority={index === 0}
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* 6. Values. The single marquee on the site. */}
      <Section surface="raised" space="tight">
        <ValuesBand items={t.home.values.items} label={t.home.values.label} />
      </Section>

      {/* 7. Support. One call to action, one intent. */}
      <Section labelledBy="apoyo" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-80" />
        <Container width="narrow" className="relative flex flex-col items-start gap-5">
          <h2 id="apoyo" className="text-balance-tight text-[2rem] md:text-[3rem]">
            {t.home.support.title}
          </h2>
          <p className="max-w-[58ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.5]">
            {t.home.support.body}
          </p>
          <ButtonLink href="/support" variant="accent" size="lg">
            {t.home.support.cta}
            <IconArrowRight className="icon-brand size-5" aria-hidden />
          </ButtonLink>
        </Container>
      </Section>

      {/* 8. Institutional credit. */}
      <Section space="tight" className="border-t border-hairline">
        <Container className="flex flex-col gap-3">
          <Eyebrow>{t.home.institutional.label}</Eyebrow>
          <p className="font-titulo text-2xl font-bold md:text-[2rem]">{t.footer.institution}</p>
          <Hairline />
          <p className="text-base text-ink-faint">{t.footer.institutionNote}</p>
        </Container>
      </Section>
    </>
  );
}
