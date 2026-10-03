import { IconArrowRight } from '@tabler/icons-react';
import type { Metadata } from 'next';
import Image from 'next/image';

import { Isotipo } from '@/components/brand/lockup';
import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Eyebrow, Section, SectionHeader } from '@/components/ui/layout';
import { Panel } from '@/components/ui/surface';
import { getContent } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Qué es Candelaria Solar Car, cómo empezó en 2022 en la Universidad de los Andes y a dónde va.',
};

export default async function AboutPage() {
  const { t } = await getContent();

  return (
    <>
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative grid items-center gap-7 py-5 lg:grid-cols-[7fr_4fr]">
          <div className="flex flex-col items-start gap-4">
            <h1 className="max-w-[14ch] text-balance-tight text-[2.5rem] md:text-[4rem]">
              {t.about.hero.title}
            </h1>
            <p className="max-w-[52ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
              {t.about.hero.lead}
            </p>
          </div>
          <Isotipo size={200} alt="" className="justify-self-center opacity-90 lg:justify-self-end" />
        </Container>
      </Section>

      {/* Origin: a reading column, which is a different family from every
          other section on the site. */}
      <Section surface="paper" labelledBy="origen" space="tight">
        <Container width="reading" className="flex flex-col gap-4">
          <h2 id="origen" className="text-balance-tight text-[2rem] md:text-[3rem]">
            {t.about.origin.title}
          </h2>
          {t.about.origin.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-relaxed text-ink md:text-[1.5rem] md:leading-[1.6]"
            >
              {paragraph}
            </p>
          ))}
        </Container>
      </Section>

      {/* Mission and vision: two panels, one image band between them. */}
      <Section surface="raised" space="tight">
        <Container className="grid gap-3 md:grid-cols-2">
          <Reveal>
            <Panel className="flex h-full flex-col gap-2">
              <Eyebrow>{t.about.mission.label}</Eyebrow>
              <h2 className="font-titulo text-2xl font-bold md:text-[2rem]">
                {t.about.mission.title}
              </h2>
              <p className="text-base text-ink-muted">{t.about.mission.body}</p>
            </Panel>
          </Reveal>
          <Reveal delay={0.08}>
            <Panel className="flex h-full flex-col gap-2">
              <Eyebrow>{t.about.vision.label}</Eyebrow>
              <h2 className="font-titulo text-2xl font-bold md:text-[2rem]">
                {t.about.vision.title}
              </h2>
              <p className="text-base text-ink-muted">{t.about.vision.body}</p>
            </Panel>
          </Reveal>
        </Container>
      </Section>

      {/* Three chapters: a horizontal timeline on a hairline. */}
      <Section labelledBy="recorrido">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="recorrido"
            eyebrow={t.about.chapters.eyebrow}
            title={t.about.chapters.title}
          />
          <ol className="grid gap-5 md:grid-cols-3 md:gap-0">
            {t.about.chapters.items.map((chapter, index) => (
              <li
                key={chapter.title}
                className="relative flex flex-col gap-2 border-t-2 border-hairline pt-4 md:pr-5"
              >
                <span
                  aria-hidden
                  className="absolute -top-1 left-0 size-2 rounded-full bg-dorado-100"
                />
                <p className="text-base font-medium uppercase text-accent">{chapter.when}</p>
                <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{chapter.title}</h3>
                <p className="text-base text-ink-muted">{chapter.body}</p>
                <span className="sr-only">{index + 1}</span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Values: five items, so a two-column split with the first spanning
          both, rather than a grid with an empty cell. */}
      <Section surface="raised" labelledBy="valores" space="tight">
        <Container className="flex flex-col gap-7">
          <SectionHeader id="valores" title={t.about.values.title} />
          <ul className="grid gap-x-7 gap-y-5 md:grid-cols-2">
            {t.about.values.items.map((value, index) => (
              <li
                key={value.title}
                className={index === 0 ? 'md:col-span-2' : undefined}
              >
                <Reveal delay={index * 0.05}>
                  <div className="flex flex-col gap-2 border-t border-hairline pt-3">
                    <h3 className="font-titulo text-2xl font-bold">{value.title}</h3>
                    <p className="max-w-[60ch] text-base text-ink-muted">{value.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section space="tight" className="overflow-hidden">
        <Container>
          <div className="relative overflow-hidden rounded-block border border-hairline">
            <Image
              src="/img/baterias.webp"
              alt=""
              width={1600}
              height={900}
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="h-72 w-full object-cover object-center md:h-96"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-morado-300 via-morado-300/80 to-morado-300/10"
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5 md:p-9">
              <h2 className="max-w-[22ch] text-balance-tight text-[2rem] md:text-[3rem]">
                {t.about.support.title}
              </h2>
              <p className="max-w-[52ch] text-base text-ink-muted">{t.about.support.body}</p>
              <ButtonLink href="/support" variant="accent" className="self-start">
                {t.about.support.cta}
                <IconArrowRight className="icon-brand size-5" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
