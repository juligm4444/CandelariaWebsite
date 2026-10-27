import { IconArrowRight } from '@tabler/icons-react';
import type { Metadata } from 'next';

import { BrandIdentity } from '@/components/about/brand-identity';
import { Timeline } from '@/components/about/timeline';
import { Reveal } from '@/components/motion/reveal';
import { ValuesBand } from '@/components/motion/values-band';
import { ButtonLink } from '@/components/ui/button';
import { Container, Eyebrow, Section, SectionHeader } from '@/components/ui/layout';
import { areas } from '@/content/areas';
import { timelineMedia } from '@/content/media';
import { siteStats } from '@/lib/db/stats';
import { getContent } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Nosotros',
  description:
    'Qué es Candelaria Solar Car, cómo empezó en 2022 en la Universidad de los Andes y a dónde va.',
  path: '/about',
});

const FOUNDED = 2022;

/**
 * Horizon mark for the hero: the sun on the rim of an arc. Drawn inline, so it
 * costs no request, scales without blur and stays a brand shape (the manual's
 * "ciclo" attribute) rather than a stock illustration.
 */
function Horizon() {
  return (
    <svg
      viewBox="0 0 480 240"
      aria-hidden
      className="ml-auto h-auto w-full max-w-[30rem]"
      fill="none"
    >
      <defs>
        <linearGradient id="horizon-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-dorado-200)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-dorado-300)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 240 C 120 120, 300 90, 480 150 L 480 240 Z" fill="url(#horizon-fill)" />
      <path d="M0 240 C 120 120, 300 90, 480 150" stroke="var(--color-dorado-100)" strokeWidth="2" />
      {/* Route dashes under the horizon, running toward the sun. */}
      <path
        d="M0 240 C 120 150, 300 120, 480 175"
        stroke="var(--color-lavanda-300)"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeDasharray="4 14"
        className="cdl-flow"
      />
      <circle cx="386" cy="118" r="10" fill="var(--color-dorado-100)" />
      <circle cx="386" cy="118" r="28" stroke="var(--color-dorado-100)" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="386" cy="118" r="28" stroke="var(--color-dorado-100)" strokeWidth="2" className="cdl-sun-pulse" />
    </svg>
  );
}

export default async function AboutPage() {
  const { locale, t } = await getContent();
  const stats = await siteStats();
  const years = Math.max(1, new Date().getFullYear() - FOUNDED);
  const format = (value: number | undefined) =>
    value === undefined
      ? t.about.impact.unavailable
      : new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO').format(value);

  const figures = [
    { label: t.about.impact.areas, value: format(areas.length) },
    { label: t.about.impact.years, value: format(years), note: t.about.impact.yearsNote },
    { label: t.about.impact.members, value: format(stats?.members) },
    { label: t.about.impact.careers, value: format(stats?.careers) },
    { label: t.about.impact.publications, value: format(stats?.publications) },
  ];

  return (
    <>
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative grid items-end gap-7 py-5 lg:grid-cols-[7fr_5fr]">
          <div className="flex flex-col items-start gap-4">
            <h1 className="max-w-[14ch] text-balance-tight text-[2.5rem] md:text-[4rem]">
              {t.about.hero.title}
            </h1>
            <p className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
              {t.about.hero.lead}
            </p>
          </div>
          <div className="w-full lg:justify-self-end">
            <Horizon />
          </div>
        </Container>
      </Section>

      {/* What the group is, with its mission and vision, in one ruled frame. */}
      <Section labelledBy="origen" space="tight">
        <Container className="flex flex-col gap-3">
          <div className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-4">
            <article
              data-light=""
              className="cdl-light flex flex-col gap-3 bg-surface p-4 [--cdl-light-alpha:0.08] md:p-5 xl:col-span-2"
            >
              <h2 id="origen" className="font-titulo text-2xl font-bold md:text-[2rem]">
                {t.about.origin.title}
              </h2>
              {t.about.origin.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[65ch] text-base text-ink-muted text-pretty">
                  {paragraph}
                </p>
              ))}
            </article>
            {[t.about.mission, t.about.vision].map((block) => (
              <article
                key={block.label}
                data-light=""
                className="cdl-light flex flex-col gap-3 bg-surface p-4 [--cdl-light-alpha:0.1] md:p-5"
              >
                <Eyebrow>{block.label}</Eyebrow>
                <h3 className="font-titulo text-2xl font-bold">{block.title}</h3>
                <p className="text-base text-ink-muted">{block.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <BrandIdentity copy={t.about.identity} locale={locale} />

      {/* Journey: dated milestones on a line that fills as you read. */}
      <Section surface="raised" labelledBy="recorrido" className="overflow-hidden">
        <Container className="flex flex-col gap-7 md:gap-9">
          <div className="flex flex-col items-start gap-3">
            <SectionHeader
              id="recorrido"
              eyebrow={t.about.timeline.eyebrow}
              title={t.about.timeline.title}
              lead={t.about.timeline.lead}
            />
            <p className="rounded-pill border border-dashed border-hairline-strong px-3 py-1 text-base text-ink-muted">
              {t.about.timeline.provisional}
            </p>
          </div>
          <Timeline
            entries={t.about.timeline.items.map((item, index) => ({
              ...item,
              upcoming: 'upcoming' in item ? Boolean(item.upcoming) : false,
              media: timelineMedia[index] ?? { src: null, alt: { es: '', en: '' } },
            }))}
            locale={locale}
            imagePending={t.about.timeline.imagePending}
            nextLabel={t.about.timeline.next}
          />
        </Container>
      </Section>

      {/* Culture code on paper: the principles read as a document. */}
      <Section surface="paper" labelledBy="valores">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="valores"
            eyebrow={t.about.values.eyebrow}
            title={t.about.values.title}
            lead={t.about.values.lead}
          />
          <ol className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline md:grid-cols-2">
            {t.about.values.items.map((value, index, all) => (
              <li
                key={value.title}
                data-light=""
                className={cn(
                  'cdl-light flex flex-col gap-2 bg-surface p-4 [--cdl-light-alpha:0.12] [--cdl-light-rgb:166_52_218] md:p-5',
                  index === all.length - 1 && all.length % 2 === 1 && 'md:col-span-2',
                )}
              >
                <span className="text-base font-medium text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-titulo text-2xl font-bold">{value.title}</h3>
                <p className="max-w-[60ch] text-base text-ink-muted">{value.body}</p>
                <p className="mt-auto pt-2 text-base text-ink-faint">{value.tags}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Figures counted from the database: a ruled row, no gradients, no
          oversized hero numbers. */}
      <Section labelledBy="cifras" space="tight">
        <Container className="flex flex-col gap-5">
          <SectionHeader id="cifras" title={t.about.impact.title} lead={t.about.impact.lead} />
          <dl className="grid gap-px overflow-hidden rounded-block border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
            {figures.map((figure, index) => (
              // dt must precede dd inside a dl group; flex-col-reverse puts the
              // figure on top visually without breaking that order.
              <Reveal
                key={figure.label}
                delay={index * 0.04}
                className="flex flex-col-reverse justify-end gap-1 bg-canvas p-4"
              >
                <dt className="flex flex-col gap-1 text-base text-ink">
                  {figure.label}
                  {figure.note ? <span className="text-ink-faint">{figure.note}</span> : null}
                </dt>
                <dd className="font-titulo text-[2.5rem] font-bold text-accent tabular-nums">
                  {figure.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      <Section surface="raised" space="tight">
        <ValuesBand items={t.about.valuesBand.items} label={t.about.valuesBand.label} />
      </Section>

      <Section labelledBy="apoyar" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-70" />
        <Container width="narrow" className="relative flex flex-col items-center gap-5 text-center">
          <h2 id="apoyar" className="max-w-[20ch] text-balance-tight text-[2rem] md:text-[3rem]">
            {t.about.support.title}
          </h2>
          <p className="max-w-[58ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.5]">
            {t.about.support.body}
          </p>
          <ButtonLink href="/support" variant="accent" size="lg">
            {t.about.support.cta}
            <IconArrowRight className="icon-brand size-5" aria-hidden />
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
