import {
  IconAlertTriangle,
  IconCheck,
  IconMinus,
  IconWaveSine,
} from '@tabler/icons-react';
import type { Metadata } from 'next';

import { Reveal } from '@/components/motion/reveal';
import { Container, Eyebrow, Section, SectionHeader } from '@/components/ui/layout';
import { Panel, Pill } from '@/components/ui/surface';
import { TextLink } from '@/components/ui/text-link';
import type { ViewerHotspot } from '@/components/vehicle/types';
import { VehicleViewer } from '@/components/vehicle/vehicle-viewer';
import { areaByKey } from '@/content/areas';
import type { ValidationState } from '@/content/es';
import {
  formatNumber,
  formatSpec,
  isPublished,
  PUBLISHED_PARTS,
  regulationRows,
  specValue,
  subsystemStatus,
  vehicleHotspots,
  vehicleSpecs,
} from '@/content/vehicle-specs';
import { getContent } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Vehículo',
  description:
    'Arquitectura del vehículo solar de Candelaria: modelo 3D con sus partes, especificaciones por área y estado de validación de cada subsistema.',
  path: '/vehicle',
});

const STATE_ICON: Record<ValidationState, typeof IconCheck> = {
  validated: IconCheck,
  simulated: IconWaveSine,
  pending: IconMinus,
};

// Only what the areas have corroborated reaches the page (see PUBLISHED_AREAS).
const specBlocks = vehicleSpecs.filter((block) => isPublished(block.area));
const regulation = regulationRows.filter((row) => isPublished(row.area));
const anyProvisional = specBlocks.some((block) => block.provisional);

/** Grid columns for a row of `count` equal cards from md up. */
const COLUMNS: Record<number, string> = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

/** Label tones, so the icon colour also clears contrast on the paper band. */
const STATE_COLOR: Record<ValidationState, string> = {
  validated: 'var(--cdl-label-baterias)',
  simulated: 'var(--cdl-label-celdas)',
  pending: 'var(--cdl-text-faint)',
};

export default async function VehiclePage() {
  const { locale, t } = await getContent();
  const subsystems = t.vehicle.subsystems.items.filter((item) => isPublished(item.area));

  // Clickable parts of the 3D model: copy and figures resolved here, so the
  // client receives plain strings and never the dictionaries.
  const hotspots: ViewerHotspot[] = vehicleHotspots.flatMap((spot) => {
    const area = areaByKey.get(spot.area);
    if (!area || !PUBLISHED_PARTS.includes(spot.key)) return [];
    const block = vehicleSpecs.find((b) => b.area === spot.area);
    const rows = (block?.rows ?? [])
      .filter((row) => !spot.specKeys || spot.specKeys.includes(row.key))
      .map((row) => ({ label: t.vehicle.specs.labels[row.key] ?? row.key, value: formatSpec(row, locale) }));
    const status = subsystemStatus[spot.area];
    const copy = t.vehicle.hotspots.items[spot.key];
    return [
      {
        key: spot.key,
        position: spot.position,
        normal: spot.normal,
        materials: spot.materials,
        name: copy.name,
        body: copy.body,
        areaName: area.name[locale],
        areaLabel: area.label,
        areaAccent: area.accent,
        areaRgb: area.rgb,
        state: status ? { label: t.vehicle.status.legend[status.state], color: STATE_COLOR[status.state] } : null,
        rows,
        provisional: Boolean(block?.provisional && rows.length > 0),
        href: `/team?area=${spot.area}`,
      },
    ];
  });

  return (
    <>
      {/* Hero: the model is the subject, so it takes the larger half. */}
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col gap-7 lg:gap-9">
          <div className="flex max-w-[70ch] flex-col items-start gap-4">
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
            <VehicleViewer
              label={t.vehicle.hero.viewerLabel}
              hint={t.vehicle.hero.viewerHint}
              fallback={t.vehicle.hero.viewerFallback}
              hotspots={hotspots}
              hotspotLabels={{
                title: t.vehicle.hotspots.title,
                hint: t.vehicle.hotspots.hint,
                close: t.vehicle.hotspots.close,
                teamLink: t.vehicle.hotspots.teamLink,
                provisional: t.vehicle.hotspots.provisional,
                noSpecs: t.vehicle.hotspots.noSpecs,
              }}
            />
            <p className="text-base text-ink-faint">{t.vehicle.hero.viewerDisclaimer}</p>
          </div>
        </Container>
      </Section>

      {/* Specification sheet: one column per owning area, label and value on
          one hairline-divided row. The provisional flag is shown, not hidden,
          until every block carries the area's real figures. */}
      <Section surface="raised" labelledBy="especificaciones">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="especificaciones"
            eyebrow={t.vehicle.specs.eyebrow}
            title={t.vehicle.specs.title}
            lead={t.vehicle.specs.lead}
          />

          {anyProvisional ? (
            <div className="flex flex-col items-start gap-2">
              <Pill tone="outline">
                <IconAlertTriangle className="icon-brand size-5 text-accent" aria-hidden />
                {t.vehicle.specs.provisional}
              </Pill>
              <p className="max-w-[70ch] text-base text-ink-faint">
                {t.vehicle.specs.provisionalNote}
              </p>
            </div>
          ) : null}

          <div className={cn('grid gap-5', COLUMNS[Math.min(specBlocks.length, 3)])}>
            {specBlocks.map((block, index) => {
              const area = areaByKey.get(block.area);
              return (
                <Reveal key={block.area} delay={index * 0.06}>
                  <Panel accent={area?.accent} className="flex h-full flex-col gap-3">
                    {area ? (
                      <span className="text-base font-medium uppercase" style={{ color: area.label }}>
                        {area.name[locale]}
                      </span>
                    ) : null}
                    <h3 className="font-titulo text-2xl font-bold">
                      {t.vehicle.specs.groupTitles[block.area]}
                    </h3>
                    <dl className="flex flex-col">
                      {block.rows.map((row) => (
                        <div
                          key={row.key}
                          className="flex items-baseline justify-between gap-3 py-2 not-last:border-b not-last:border-hairline"
                        >
                          <dt className="text-base text-ink-muted">
                            {t.vehicle.specs.labels[row.key] ?? row.key}
                          </dt>
                          <dd className="text-right text-base font-medium text-ink tabular-nums">
                            {formatSpec(row, locale)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Panel>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Subsystems: one card per published area, side by side. */}
      <Section labelledBy="subsistemas">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="subsistemas"
            title={t.vehicle.subsystems.title}
            lead={t.vehicle.subsystems.lead}
          />

          <ul className={cn('grid gap-3', COLUMNS[Math.min(subsystems.length, 3)])}>
            {subsystems.map((item, index) => {
              const area = areaByKey.get(item.area);
              const status = subsystemStatus[item.area];
              const Icon = status ? STATE_ICON[status.state] : null;
              return (
                <li key={item.title}>
                  <Reveal className="h-full" delay={index * 0.05}>
                    <article
                      data-light=""
                      className="cdl-light cdl-light-edge flex h-full flex-col gap-4 rounded-card border border-hairline bg-surface p-4 md:p-5"
                      style={{ '--cdl-light-rgb': area?.rgb, '--cdl-light-alpha': '0.12' } as React.CSSProperties}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-titulo text-[2rem] font-bold leading-none text-ink-faint tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {area ? (
                          <span
                            className="rounded-pill border px-2 py-0.5 text-base font-medium uppercase"
                            style={{ color: area.label, borderColor: area.accent }}
                          >
                            {area.name[locale]}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-titulo text-2xl font-bold leading-tight text-balance-tight md:text-[2rem]">
                        {item.title}
                      </h3>

                      <dl className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <dt className="text-base font-medium uppercase text-accent">
                            {t.vehicle.subsystems.objectiveLabel}
                          </dt>
                          <dd className="text-base text-ink-muted">{item.objective}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                          <dt className="text-base font-medium uppercase text-accent">
                            {t.vehicle.subsystems.challengeLabel}
                          </dt>
                          <dd className="text-base text-ink-muted">{item.challenge}</dd>
                        </div>
                      </dl>

                      <div className="mt-auto flex flex-col gap-3 border-t border-hairline pt-3">
                        {status && Icon ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-3 text-base">
                              <span className="inline-flex items-center gap-2 text-ink">
                                <Icon
                                  className="icon-brand size-5"
                                  style={{ color: STATE_COLOR[status.state] }}
                                  aria-hidden
                                />
                                {t.vehicle.status.legend[status.state]}
                              </span>
                              <span className="text-ink-faint tabular-nums">
                                {t.vehicle.subsystems.progressLabel} {status.progress}%*
                              </span>
                            </div>
                            <div
                              role="meter"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={status.progress}
                              aria-label={`${t.vehicle.subsystems.progressLabel}: ${item.title}`}
                              className="h-1 w-full overflow-hidden rounded-pill bg-hairline"
                            >
                              <span
                                className="block h-full rounded-pill"
                                style={{
                                  width: `${status.progress}%`,
                                  backgroundColor: area?.accent,
                                }}
                              />
                            </div>
                          </div>
                        ) : null}
                        <TextLink href={`/team?area=${item.area}`}>{t.vehicle.subsystems.teamLink}</TextLink>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <p className="max-w-[70ch] text-base text-ink-faint">* {t.vehicle.subsystems.progressNote}</p>
        </Container>
      </Section>

      {/* Regulation matrix. A real table on a paper band: each constraint, the
          reference limit, the current figure from the spec sheet above and
          the margin computed between them. Below md each row becomes a card
          whose cells carry their column name (`data-label`), instead of a
          table that has to be scrolled sideways on a phone. */}
      <Section surface="paper" labelledBy="reglamento">
        <Container className="flex flex-col gap-7">
          <SectionHeader
            id="reglamento"
            eyebrow={t.vehicle.regulation.eyebrow}
            title={t.vehicle.regulation.title}
            lead={t.vehicle.regulation.lead}
          />

          <div className="rounded-block border border-hairline bg-surface md:overflow-x-auto">
            <table className="w-full border-collapse text-left text-base max-md:block md:min-w-[45rem]">
              <thead className="max-md:sr-only">
                <tr className="border-b border-hairline-strong">
                  {(
                    ['requirement', 'limit', 'current', 'margin', 'state', 'area'] as const
                  ).map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 font-medium uppercase text-accent"
                    >
                      {t.vehicle.regulation.columns[column]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="max-md:block">
                {regulation.map((row) => {
                  const area = areaByKey.get(row.area);
                  const none = t.vehicle.regulation.notApplicable;
                  const columns = t.vehicle.regulation.columns;
                  let limit = none;
                  let current = none;
                  let margin = none;
                  let stateLabel: string;
                  let StateIcon: typeof IconCheck;
                  let stateColor: string;

                  if (row.kind === 'max') {
                    const value = specValue(row.spec.area, row.spec.key);
                    limit = `≤ ${formatNumber(row.limit, locale, row.fractionDigits)} ${row.unit}`;
                    if (value !== null) {
                      const ok = value <= row.limit;
                      current = `${formatNumber(value, locale, row.fractionDigits)} ${row.unit}`;
                      margin = `${formatNumber(row.limit - value, locale, row.fractionDigits)} ${row.unit}`;
                      stateLabel = ok ? t.vehicle.regulation.complies : t.vehicle.regulation.exceeds;
                      StateIcon = ok ? IconCheck : IconAlertTriangle;
                      stateColor = ok ? 'var(--cdl-label-baterias)' : 'var(--cdl-label-comite)';
                    } else {
                      stateLabel = t.vehicle.status.legend.pending;
                      StateIcon = IconMinus;
                      stateColor = 'var(--cdl-text-faint)';
                    }
                  } else {
                    stateLabel = t.vehicle.status.legend[row.state];
                    StateIcon = STATE_ICON[row.state];
                    stateColor = STATE_COLOR[row.state];
                  }

                  return (
                    <tr
                      key={row.key}
                      className="border-b border-hairline transition-colors duration-200 last:border-b-0 hover:bg-[rgb(166_52_218/0.06)] max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3 max-md:p-4"
                    >
                      <th scope="row" className="px-4 py-3 font-titulo text-ink max-md:col-span-2 max-md:p-0 max-md:text-2xl max-md:font-bold md:font-medium md:font-texto">
                        {t.vehicle.regulation.rows[row.key] ?? row.key}
                      </th>
                      <td data-label={columns.limit} className="px-4 py-3 text-ink-muted tabular-nums max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]">{limit}</td>
                      <td data-label={columns.current} className="px-4 py-3 text-ink tabular-nums max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]">{current}</td>
                      <td data-label={columns.margin} className="px-4 py-3 text-ink-muted tabular-nums max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]">{margin}</td>
                      <td data-label={columns.state} className="px-4 py-3 max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]">
                        <span className="inline-flex items-center gap-2 text-ink">
                          <StateIcon className="icon-brand size-5 shrink-0" style={{ color: stateColor }} aria-hidden />
                          {stateLabel}
                        </span>
                      </td>
                      <td data-label={columns.area} className="px-4 py-3 font-medium max-md:flex max-md:flex-col max-md:gap-1 max-md:p-0 max-md:before:text-ink-faint max-md:before:content-[attr(data-label)]" style={{ color: area?.label }}>
                        {area?.name[locale]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="max-w-[80ch] text-base text-ink-faint">{t.vehicle.regulation.note}</p>
        </Container>
      </Section>
    </>
  );
}
