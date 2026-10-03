import type { Metadata } from 'next';
import Link from 'next/link';

import { PublicationCard } from '@/components/content/publication-card';
import { Container, Section } from '@/components/ui/layout';
import { EmptyState } from '@/components/ui/surface';
import { areas, type AreaKey } from '@/content/areas';
import { listPublications, publicationYears } from '@/lib/db/publications';
import { plural } from '@/lib/i18n/dictionary';
import { getContent } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Publicaciones',
  description:
    'Avances técnicos, decisiones de diseño y resultados de validación publicados por las áreas de Candelaria Solar Car.',
};

const AREA_KEYS = new Set(areas.map((area) => area.key as string));

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Builds a filter URL without losing the other active filters. */
function filterHref(
  current: { area?: string; year?: string },
  patch: { area?: string | null; year?: string | null; page?: string | null },
) {
  const params = new URLSearchParams();
  const area = patch.area === null ? undefined : (patch.area ?? current.area);
  const year = patch.year === null ? undefined : (patch.year ?? current.year);
  if (area) params.set('area', area);
  if (year) params.set('year', year);
  if (patch.page) params.set('page', patch.page);
  const query = params.toString();
  return query ? `/publications?${query}` : '/publications';
}

export default async function PublicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { locale, t } = await getContent();
  const params = await searchParams;

  // Every filter value is validated against a known set before it reaches SQL.
  const rawArea = readParam(params, 'area');
  const areaKey = rawArea && AREA_KEYS.has(rawArea) ? (rawArea as AreaKey) : null;

  const rawYear = readParam(params, 'year');
  const parsedYear = rawYear ? Number.parseInt(rawYear, 10) : Number.NaN;
  const year = Number.isInteger(parsedYear) && parsedYear > 1990 && parsedYear < 2100 ? parsedYear : null;

  const rawPage = readParam(params, 'page');
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [result, years] = await Promise.all([
    listPublications(locale, { areaKey, year, page, perPage: 9 }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      pages: 1,
    })),
    publicationYears().catch(() => [] as number[]),
  ]);

  const current = { area: areaKey ?? undefined, year: year ? String(year) : undefined };
  const filtered = Boolean(areaKey || year);

  return (
    <>
      <Section space="tight" className="overflow-hidden">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col items-start gap-4 py-5">
          <h1 className="text-balance-tight text-[2.5rem] md:text-[3.5rem]">
            {t.publications.hero.title}
          </h1>
          <p className="max-w-[56ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]">
            {t.publications.hero.lead}
          </p>
        </Container>
      </Section>

      <Section space="tight">
        <Container className="flex flex-col gap-7">
          {/* Filters as links, so they work with JavaScript disabled and each
              combination has a shareable URL. */}
          <div className="flex flex-col gap-3 border-y border-hairline py-4">
            <FilterRow label={t.publications.filters.area}>
              <FilterChip href={filterHref(current, { area: null })} active={!areaKey}>
                {t.publications.filters.allAreas}
              </FilterChip>
              {areas.map((area) => (
                <FilterChip
                  key={area.key}
                  href={filterHref(current, { area: area.key })}
                  active={areaKey === area.key}
                  accent={area.accent}
                >
                  {area.name[locale]}
                </FilterChip>
              ))}
            </FilterRow>

            {years.length > 0 ? (
              <FilterRow label={t.publications.filters.year}>
                <FilterChip href={filterHref(current, { year: null })} active={!year}>
                  {t.publications.filters.allYears}
                </FilterChip>
                {years.map((value) => (
                  <FilterChip
                    key={value}
                    href={filterHref(current, { year: String(value) })}
                    active={year === value}
                  >
                    {value}
                  </FilterChip>
                ))}
              </FilterRow>
            ) : null}
          </div>

          <p className="text-base text-ink-faint">
            {plural(t.publications.filters.resultCount, result.total)}
          </p>

          {result.items.length === 0 ? (
            <EmptyState
              title={filtered ? t.publications.emptyFilteredTitle : t.publications.emptyTitle}
              body={filtered ? t.publications.emptyFilteredBody : t.publications.emptyBody}
              action={
                filtered ? (
                  <Link href="/publications" className="text-base font-medium text-accent">
                    {t.publications.filters.clear}
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {result.items.map((publication, index) => (
                <li key={publication.id}>
                  <PublicationCard
                    publication={publication}
                    locale={locale}
                    t={t}
                    priority={index < 3}
                  />
                </li>
              ))}
            </ul>
          )}

          {result.pages > 1 ? (
            <nav
              aria-label={t.publications.pagination.page}
              className="flex items-center justify-between gap-3 border-t border-hairline pt-4"
            >
              {result.page > 1 ? (
                <Link
                  href={filterHref(current, { page: String(result.page - 1) })}
                  className="text-base font-medium text-accent"
                >
                  {t.publications.pagination.previous}
                </Link>
              ) : (
                <span className="text-base text-ink-faint">{t.publications.pagination.previous}</span>
              )}

              <span className="text-base text-ink-muted">
                {t.publications.pagination.page
                  .replace('{{page}}', String(result.page))
                  .replace('{{total}}', String(result.pages))}
              </span>

              {result.page < result.pages ? (
                <Link
                  href={filterHref(current, { page: String(result.page + 1) })}
                  className="text-base font-medium text-accent"
                >
                  {t.publications.pagination.next}
                </Link>
              ) : (
                <span className="text-base text-ink-faint">{t.publications.pagination.next}</span>
              )}
            </nav>
          ) : null}
        </Container>
      </Section>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-20 text-base font-medium uppercase text-accent">{label}</span>
      <ul className="flex flex-wrap gap-1">{children}</ul>
    </div>
  );
}

function FilterChip({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active: boolean;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'inline-flex min-h-10 items-center rounded-pill border px-3 text-base transition-colors duration-200 ease-brand',
          active
            ? 'border-transparent bg-dorado-100 text-morado-300'
            : 'border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink',
        )}
        style={!active && accent ? { borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` } : undefined}
      >
        {children}
      </Link>
    </li>
  );
}
