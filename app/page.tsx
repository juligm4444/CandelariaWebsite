import { IconArrowRight, IconBuildingCommunity, IconCar, IconSchool } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { AreaBanner } from '@/components/content/area-banner';
import { PublicationCard } from '@/components/content/publication-card';
import { HeroScrub, type HeroSpec } from '@/components/home/hero-scrub';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Eyebrow, Hairline, Section, SectionHeader } from '@/components/ui/layout';
import { EmptyState } from '@/components/ui/surface';
import { TextLink } from '@/components/ui/text-link';
import { areaByKey, type AreaKey } from '@/content/areas';
import { isPublished, vehicleSpecs } from '@/content/vehicle-specs';
import { latestPublications, type Publication } from '@/lib/db/publications';
import { getContent } from '@/lib/i18n/server';
import { SOCIAL_IMAGE } from '@/lib/seo';

export const dynamic = 'force-dynamic';

/** Title and description come from the root layout; only the URL is the page's own. */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Candelaria Solar Car',
    title: 'Candelaria Solar Car · Vehículo solar de la Universidad de los Andes',
    description:
      'Semillero de investigación interdisciplinario de la Universidad de los Andes que diseña, construye y valida un vehículo solar de competencia.',
    url: '/',
    locale: 'es_CO',
    images: [SOCIAL_IMAGE],
  },
};

const PILLAR_ICONS = [IconCar, IconSchool, IconBuildingCommunity];

/**
 * The three headline figures the hero counts up to, from the spec sheet.
 * Only corroborated areas qualify (PUBLISHED_AREAS); a figure from any other
 * area is skipped.
 */
const HERO_SPECS: { area: AreaKey; key: string }[] = [
  { area: 'celdas', key: 'arrayArea' },
  { area: 'baterias', key: 'energy' },
  { area: 'baterias', key: 'motorPower' },
];

export default async function HomePage() {
  const { locale, t } = await getContent();

  // The site must render before the database exists. A failure here degrades
  // to the empty state instead of a 500 on the landing page.
  const updates: Publication[] = await latestPublications(locale, 3).catch(() => []);

  const heroSpecs: HeroSpec[] = [];
  let provisional = false;
  for (const { area, key } of HERO_SPECS) {
    if (!isPublished(area)) continue;
    const block = vehicleSpecs.find((b) => b.area === area);
    const row = block?.rows.find((r) => r.key === key);
    if (!block || !row || !('value' in row)) continue;
    provisional ||= block.provisional;
    heroSpecs.push({
      label: t.vehicle.specs.labels[key] ?? key,
      value: row.value,
      unit: row.unit ?? '',
      fractionDigits: row.fractionDigits ?? 0,
    });
  }

  return (
    <>
      <HeroScrub copy={t.home.hero} specs={heroSpecs} provisional={provisional} locale={locale} />

      {/* What the project is. Three compartments of one ruled block, each lit
          from under the pointer. */}
      <Section surface="raised" labelledBy="pilares">
        <Container className="flex flex-col gap-7">
          <SectionHeader id="pilares" title={t.home.pillars.title} lead={t.home.pillars.lead} />
          <ul className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline lg:grid-cols-3">
            {t.home.pillars.items.map((item, index) => {
              const Icon = PILLAR_ICONS[index] ?? IconCar;
              return (
                <li
                  key={item.title}
                  data-light=""
                  className="cdl-light group flex flex-col gap-4 bg-surface p-4 [--cdl-light-alpha:0.1] md:grid md:grid-cols-[3.5rem_minmax(0,1fr)] md:gap-x-5 md:gap-y-2 md:p-5 lg:flex"
                >
                  <span className="cdl-glow inline-flex size-14 items-center justify-center rounded-card border border-hairline-strong text-accent group-hover:border-accent md:row-span-2">
                    <Icon className="icon-brand size-6" aria-hidden />
                  </span>
                  <h3 className="font-titulo text-2xl font-bold">{item.title}</h3>
                  <p className="text-base text-ink-muted">{item.body}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* The three areas that set the physics: one photographic banner each,
          identical in size, each a single link to the area on the Team page. */}
      <Section labelledBy="laboratorios">
        <Container className="flex flex-col gap-7">
          <SectionHeader id="laboratorios" title={t.home.labs.title} lead={t.home.labs.lead} />
          <ul className="grid gap-5 lg:grid-cols-3">
            {t.home.labs.items.map((item, index) => {
              const area = areaByKey.get(item.area);
              if (!area) return null;
              return (
                <li key={item.area}>
                  <Reveal className="h-full" delay={index * 0.06}>
                    <AreaBanner
                      area={area}
                      locale={locale}
                      href={`/team?area=${item.area}`}
                      body={item.body}
                      cta={t.home.labs.cta}
                      index={index}
                    />
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Latest publications. */}
      <Section labelledBy="bitacora">
        <Container className="flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              id="bitacora"
              eyebrow={t.home.updates.eyebrow}
              title={t.home.updates.title}
              lead={t.home.updates.lead}
            />
            <TextLink href="/publications">{t.home.updates.cta}</TextLink>
          </div>

          {updates.length === 0 ? (
            <EmptyState title={t.home.updates.emptyTitle} body={t.home.updates.emptyBody} />
          ) : (
            <ul className="grid gap-5 md:grid-cols-3">
              {updates.map((publication, index) => (
                <li key={publication.id}>
                  <Reveal className="h-full" delay={index * 0.06}>
                    <PublicationCard
                      publication={publication}
                      locale={locale}
                      t={t}
                      priority={index === 0}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* Support. One centred call to action, two journeys. */}
      <Section surface="raised" labelledBy="apoyo" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-80" />
        <Container width="narrow" className="relative flex flex-col items-center gap-5 text-center">
          <h2 id="apoyo" className="max-w-[20ch] text-balance-tight text-[2rem] md:text-[3rem]">
            {t.home.support.title}
          </h2>
          <p className="max-w-[58ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.5]">
            {t.home.support.body}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/support#membresias" variant="accent" size="lg" magnetic>
              {t.home.support.cta}
              <IconArrowRight className="icon-brand size-5" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/support#patrocinio-bloque" variant="secondary" size="lg">
              {t.home.support.secondary}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Institutional credit. */}
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
