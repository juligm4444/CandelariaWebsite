import type { Metadata } from 'next';
import Link from 'next/link';

import { PublicationCard } from '@/components/content/publication-card';
import { Reveal } from '@/components/motion/reveal';
import { FeaturedRotator, type FeaturedItem } from '@/components/publications/featured-rotator';
import { LogExplorer, type LogArea, type LogState } from '@/components/publications/log-explorer';
import { Container, Section } from '@/components/ui/layout';
import { EmptyState } from '@/components/ui/surface';
import { areaByKey, areas, type AreaKey } from '@/content/areas';
import {
  featuredPublications,
  listPublications,
  publicationFacets,
  type Publication,
  type PublicationFacets,
} from '@/lib/db/publications';
import { plural } from '@/lib/i18n/dictionary';
import { getContent } from '@/lib/i18n/server';
import { mediaUrl } from '@/lib/media';
import { formatDate } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Bitácora',
  description:
    'Avances técnicos, decisiones de diseño y resultados de validación publicados por las áreas de Candelaria Solar Car.',
  path: '/publications',
});

const AREA_KEYS = new Set(areas.map((area) => area.key as string));

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Pagination link that keeps every active filter. */
function pageHref(state: LogState, page: number) {
  const params = new URLSearchParams();
  if (state.area) params.set('area', state.area);
  if (state.year) params.set('year', String(state.year));
  if (state.order === 'oldest') params.set('order', 'oldest');
  if (state.q) params.set('q', state.q);
  if (page > 1) params.set('page', String(page));
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

  // Search text is bounded here and travels to SQL only as a bound parameter.
  const q = (readParam(params, 'q') ?? '').trim().slice(0, 120);

  // Newest first is the default and never appears in the URL.
  const order = readParam(params, 'order') === 'oldest' ? 'oldest' : 'newest';

  const rawPage = readParam(params, 'page');
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [result, facets, featured] = await Promise.all([
    listPublications(locale, { areaKey, year, order, search: q || null, page, perPage: 9 }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      pages: 1,
    })),
    publicationFacets({ areaKey, year, search: q || null }).catch(
      (): PublicationFacets => ({ byArea: {}, byYear: [] }),
    ),
    featuredPublications(locale).catch(() => ({ latest: null, mostRead: null })),
  ]);

  const toFeatured = (key: string, tab: string, publication: Publication, meta: string | null): FeaturedItem => {
    const area = areaByKey.get(publication.areaKey);
    return {
      key,
      tab,
      href: `/publications/${publication.slug}`,
      title: publication.title,
      abstract: publication.abstract,
      date: formatDate(publication.publishedAt, locale),
      meta,
      areaName: area?.name[locale] ?? '',
      areaLabel: area?.label ?? 'var(--cdl-accent)',
      areaRgb: area?.rgb ?? '255 185 56',
      cover: mediaUrl(publication.coverPath),
    };
  };
  const featuredItems: FeaturedItem[] = [];
  if (featured.latest) {
    featuredItems.push(toFeatured('latest', t.publications.featured.latest, featured.latest, null));
  }
  if (featured.mostRead) {
    featuredItems.push(
      toFeatured(
        'most-read',
        t.publications.featured.mostRead,
        featured.mostRead.publication,
        plural(t.publications.featured.reads, featured.mostRead.views),
      ),
    );
  }

  const state: LogState = { area: areaKey, year, order, q };
  const filtered = Boolean(areaKey || year || q);

  const logAreas: LogArea[] = areas.map((area) => ({
    key: area.key,
    name: area.name[locale],
    accent: area.accent,
    rgb: area.rgb,
    count: facets.byArea[area.key] ?? 0,
  }));
  const allCount = Object.values(facets.byArea).reduce((sum, n) => sum + (n ?? 0), 0);

  // "12 publicaciones · Celdas · 2026 · «fibra»", built from what is active.
  const summaryParts = [plural(t.publications.filters.resultCount, result.total)];
  if (areaKey) summaryParts.push(areas.find((a) => a.key === areaKey)?.name[locale] ?? '');
  if (year) summaryParts.push(String(year));
  if (q) summaryParts.push(t.publications.filters.searchFor.replace('{{q}}', q));

  return (
    <>
      {/* Page header: the claim, then the featured entries (newest,
          alternating with the most read) as part of the header itself, above
          the filters, so the log opens on its best entry. */}
      <Section space="tight" className="overflow-hidden pb-5 md:pb-7">
        <div aria-hidden className="halo-brand pointer-events-none absolute inset-0 opacity-60" />
        <Container className="relative flex flex-col gap-5 md:gap-7">
          <div className="flex flex-col items-start gap-3">
            <h1 data-intro="" className="text-balance-tight text-[2.5rem] md:text-[3.5rem]">
              {t.publications.hero.title}
            </h1>
            <p
              data-intro=""
              style={{ '--i': 1 } as React.CSSProperties}
              className="max-w-[56ch] text-base text-ink-muted md:text-[1.5rem] md:leading-[1.45]"
            >
              {t.publications.hero.lead}
            </p>
          </div>
          {featuredItems.length > 0 ? (
            <div data-intro="" style={{ '--i': 2 } as React.CSSProperties}>
              <FeaturedRotator
                items={featuredItems}
                labels={{
                  region: t.publications.featured.region,
                  read: t.publications.featured.read,
                  pause: t.publications.featured.pause,
                  play: t.publications.featured.play,
                }}
              />
            </div>
          ) : null}
        </Container>
      </Section>

      <Section space="tight" className="pt-0 md:pt-0">
        <Container>
          <LogExplorer
            state={state}
            areas={logAreas}
            total={allCount}
            years={facets.byYear}
            labels={{
              searchLabel: t.publications.filters.searchLabel,
              searchPlaceholder: t.publications.filters.searchPlaceholder,
              searchShortcut: t.publications.filters.searchShortcut,
              clearSearch: t.publications.filters.clearSearch,
              area: t.publications.filters.area,
              allAreas: t.publications.filters.allAreas,
              year: t.publications.filters.year,
              allYears: t.publications.filters.allYears,
              order: t.publications.filters.order,
              newest: t.publications.filters.newest,
              oldest: t.publications.filters.oldest,
              clear: t.publications.filters.clear,
              summary: summaryParts.join(' · '),
              updating: t.publications.filters.updating,
            }}
          >
            {result.items.length === 0 ? (
              <EmptyState
                title={filtered ? t.publications.emptyFilteredTitle : t.publications.emptyTitle}
                body={filtered ? t.publications.emptyFilteredBody : t.publications.emptyBody}
              />
            ) : (
              <ul className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((publication, index) => (
                  <li key={publication.id}>
                    <Reveal className="h-full" delay={Math.min(index, 5) * 0.05}>
                      <PublicationCard
                        publication={publication}
                        locale={locale}
                        t={t}
                        priority={index < 3}
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}

            {result.pages > 1 ? (
              <nav
                aria-label={t.publications.pagination.label}
                className="mt-7 flex items-center justify-between gap-3 border-t border-hairline pt-4"
              >
                {result.page > 1 ? (
                  <Link
                    href={pageHref(state, result.page - 1)}
                    data-light=""
                    className="cdl-link inline-flex min-h-12 items-center text-base font-medium text-accent"
                  >
                    {t.publications.pagination.previous}
                  </Link>
                ) : (
                  <span className="text-base text-ink-faint">{t.publications.pagination.previous}</span>
                )}

                <span className="text-base text-ink-muted tabular-nums">
                  {t.publications.pagination.page
                    .replace('{{page}}', String(result.page))
                    .replace('{{total}}', String(result.pages))}
                </span>

                {result.page < result.pages ? (
                  <Link
                    href={pageHref(state, result.page + 1)}
                    data-light=""
                    className="cdl-link inline-flex min-h-12 items-center text-base font-medium text-accent"
                  >
                    {t.publications.pagination.next}
                  </Link>
                ) : (
                  <span className="text-base text-ink-faint">{t.publications.pagination.next}</span>
                )}
              </nav>
            ) : null}
          </LogExplorer>
        </Container>
      </Section>
    </>
  );
}
