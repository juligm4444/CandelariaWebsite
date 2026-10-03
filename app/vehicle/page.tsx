import { IconArrowRight, IconCheck, IconMinus, IconWaveSine } from '@tabler/icons-react';
import type { Metadata } from 'next';
import Image from 'next/image';

import { Reveal } from '@/components/motion/reveal';
import { ButtonLink } from '@/components/ui/button';
import { Container, Eyebrow, Section, SectionHeader } from '@/components/ui/layout';
import { Panel, Pill } from '@/components/ui/surface';
import { VehicleViewer } from '@/components/vehicle/vehicle-viewer';
import { areaByKey } from '@/content/areas';
import type { ValidationState } from '@/content/es';
import { getContent } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Vehículo',
  description:
    'Arquitectura del vehículo solar de Candelaria: captación, almacenamiento, estructura y telemetría, con el estado de validación de cada subsistema.',
};

const STATE_ICON: Record<ValidationState, typeof IconCheck> = {
  validated: IconCheck,
  simulated: IconWaveSine,
  pending: IconMinus,
};

const STATE_COLOR: Record<ValidationState, string> = {
  validated: 'var(--color-area-baterias)',
  simulated: 'var(--color-area-celdas)',
  pending: 'var(--color-neutro-300)',
};

export default async function VehiclePage() {
  const { locale, t } = await getContent();

  return (
    <>
      {/* Hero: the model is the subject, so it takes the larger half. */}
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative grid items-center gap-7 lg:grid-cols-[5fr_7fr] lg:gap-9">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-balance-tight text-[2.5rem] md:text-[3.5rem]">
              {t.vehicle.hero.title}
            </h1>
            <p className="max-w-[46ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
              {t.vehicle.hero.lead}
            </p>
            <div className="flex flex-col gap-1 pt-2">
              <Eyebrow>{t.vehicle.hero.targetLabel}</Eyebrow>
              <p className="font-titulo text-2xl font-bold">{t.vehicle.hero.target}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <VehicleViewer label={t.vehicle.hero.viewerLabel} hint={t.vehicle.hero.viewerHint} />
            <p className="text-base text-ink-faint">{t.vehicle.hero.viewerDisclaimer}</p>
          </div>
        </Container>
      </Section>

      {/* Subsystems: a 2x2 bento where each cell carries its owning area's
          colour as a top bar and nothing else. */}
      <Section surface="raised" labelledBy="subsistemas">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="subsistemas"
            title={t.vehicle.subsystems.title}
            lead={t.vehicle.subsystems.lead}
          />

          <div className="grid gap-3 md:grid-cols-2">
            {t.vehicle.subsystems.items.map((item, index) => {
              const area = areaByKey.get(item.area);
              return (
                <Reveal key={item.title} delay={index * 0.06}>
                  <Panel accent={area?.accent} className="flex h-full flex-col gap-2">
                    {area ? (
                      <span
                        className="text-base font-medium uppercase"
                        style={{ color: area.label }}
                      >
                        {area.name[locale]}
                      </span>
                    ) : null}
                    <h3 className="font-titulo text-2xl font-bold md:text-[2rem]">{item.title}</h3>
                    <p className="text-base text-ink-muted">{item.body}</p>
                  </Panel>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Status board. Three clusters, one hairline per row inside a cluster,
          and an explicit state instead of an invented figure. */}
      <Section surface="paper" labelledBy="estado">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="estado"
            eyebrow={t.vehicle.status.eyebrow}
            title={t.vehicle.status.title}
            lead={t.vehicle.status.lead}
          />

          <ul className="flex flex-wrap gap-2">
            {(Object.keys(t.vehicle.status.legend) as ValidationState[]).map((state) => {
              const Icon = STATE_ICON[state];
              return (
                <li key={state}>
                  <Pill tone="outline">
                    <Icon
                      className="icon-brand size-5"
                      style={{ color: STATE_COLOR[state] }}
                      aria-hidden
                    />
                    {t.vehicle.status.legend[state]}
                  </Pill>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-5 md:grid-cols-3">
            {t.vehicle.status.groups.map((group) => (
              <section key={group.title} className="flex flex-col gap-3">
                <h3 className="font-titulo text-2xl font-bold">{group.title}</h3>
                <ul className="flex flex-col">
                  {group.rows.map((row) => {
                    const Icon = STATE_ICON[row.state];
                    return (
                      <li
                        key={row.label}
                        className="flex items-start justify-between gap-3 py-2 not-last:border-b not-last:border-hairline"
                      >
                        <span className="text-base text-ink">{row.label}</span>
                        <Icon
                          className="icon-brand mt-1 size-5 shrink-0"
                          style={{ color: STATE_COLOR[row.state] }}
                          aria-label={t.vehicle.status.legend[row.state]}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <p className="max-w-[70ch] text-base text-ink-faint">{t.vehicle.status.note}</p>
        </Container>
      </Section>

      {/* Constraints: full-bleed image band, different layout family again. */}
      <Section className="overflow-hidden" space="tight">
        <Container>
          <div className="relative overflow-hidden rounded-block border border-hairline">
            <Image
              src="/img/celdas.webp"
              alt=""
              width={1600}
              height={900}
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="h-72 w-full object-cover object-left-top md:h-96"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-morado-300 via-morado-300/80 to-morado-300/10"
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5 md:p-9">
              <h2 className="max-w-[20ch] text-balance-tight text-[2rem] md:text-[3rem]">
                {t.vehicle.constraints.title}
              </h2>
              <p className="max-w-[52ch] text-base text-ink-muted">{t.vehicle.constraints.body}</p>
              <ButtonLink href="/team" variant="accent" className="self-start">
                {t.vehicle.constraints.cta}
                <IconArrowRight className="icon-brand size-5" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
