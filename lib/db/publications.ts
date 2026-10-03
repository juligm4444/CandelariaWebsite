import 'server-only';

import type { AreaKey } from '@/content/areas';
import type { Locale } from '@/lib/i18n/config';

import { query, queryOne } from './client';

export type PublicationRow = {
  id: string;
  slug: string;
  area_key: AreaKey;
  author_id: string | null;
  author_name: string | null;
  title_es: string;
  title_en: string;
  abstract_es: string;
  abstract_en: string;
  cover_path: string | null;
  pdf_path: string | null;
  published_at: string;
};

export type Publication = {
  id: string;
  slug: string;
  areaKey: AreaKey;
  authorName: string | null;
  title: string;
  abstract: string;
  coverPath: string | null;
  pdfPath: string | null;
  publishedAt: string;
};

const SELECT = `
  select p.id, p.slug, p.area_key, p.author_id,
         u."name" as author_name,
         p.title_es, p.title_en, p.abstract_es, p.abstract_en,
         p.cover_path, p.pdf_path,
         to_char(p.published_at, 'YYYY-MM-DD') as published_at
    from publications p
    left join "user" u on u."id" = p.author_id
`;

function present(row: PublicationRow, locale: Locale): Publication {
  return {
    id: row.id,
    slug: row.slug,
    areaKey: row.area_key,
    authorName: row.author_name,
    title: locale === 'en' ? row.title_en : row.title_es,
    abstract: locale === 'en' ? row.abstract_en : row.abstract_es,
    coverPath: row.cover_path,
    pdfPath: row.pdf_path,
    publishedAt: row.published_at,
  };
}

export type PublicationFilter = {
  areaKey?: AreaKey | null;
  year?: number | null;
  page?: number;
  perPage?: number;
};

export async function listPublications(
  locale: Locale,
  filter: PublicationFilter = {},
): Promise<{ items: Publication[]; total: number; page: number; pages: number }> {
  const perPage = Math.min(Math.max(filter.perPage ?? 9, 1), 48);
  const page = Math.max(filter.page ?? 1, 1);
  const offset = (page - 1) * perPage;

  const rows = await query<PublicationRow & { total: string }>(
    `${SELECT}
       where ($1::text is null or p.area_key = $1::text)
         and ($2::int is null or date_part('year', p.published_at) = $2::int)
       order by p.published_at desc, p.id desc
       limit $3 offset $4`,
    [filter.areaKey ?? null, filter.year ?? null, perPage, offset],
  );

  const counted = await queryOne<{ total: string }>(
    `select count(*)::text as total
       from publications p
      where ($1::text is null or p.area_key = $1::text)
        and ($2::int is null or date_part('year', p.published_at) = $2::int)`,
    [filter.areaKey ?? null, filter.year ?? null],
  );

  const total = Number(counted?.total ?? 0);

  return {
    items: rows.map((row) => present(row, locale)),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPublicationBySlug(
  slug: string,
  locale: Locale,
): Promise<Publication | null> {
  const row = await queryOne<PublicationRow>(`${SELECT} where p.slug = $1`, [slug]);
  return row ? present(row, locale) : null;
}

/** Distinct years that actually have publications, for the filter control. */
export async function publicationYears(): Promise<number[]> {
  const rows = await query<{ year: string }>(
    `select distinct date_part('year', published_at)::text as year
       from publications
      order by year desc`,
  );
  return rows.map((row) => Number(row.year));
}

export async function latestPublications(locale: Locale, limit = 3): Promise<Publication[]> {
  const bounded = Math.min(Math.max(limit, 1), 12);
  const rows = await query<PublicationRow>(
    `${SELECT} order by p.published_at desc, p.id desc limit $1`,
    [bounded],
  );
  return rows.map((row) => present(row, locale));
}

export async function publicationsByAuthor(
  authorId: string,
  locale: Locale,
): Promise<Publication[]> {
  const rows = await query<PublicationRow>(
    `${SELECT} where p.author_id = $1 order by p.published_at desc, p.id desc limit 100`,
    [authorId],
  );
  return rows.map((row) => present(row, locale));
}

export async function publicationsByArea(
  areaKey: AreaKey,
  locale: Locale,
): Promise<Publication[]> {
  const rows = await query<PublicationRow>(
    `${SELECT} where p.area_key = $1 order by p.published_at desc, p.id desc limit 100`,
    [areaKey],
  );
  return rows.map((row) => present(row, locale));
}

/** Builds a unique slug without a race: the unique index is the final word. */
export async function reserveSlug(base: string): Promise<string> {
  const normalised =
    base
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'publicacion';

  const taken = await query<{ slug: string }>(
    `select slug from publications where slug = $1 or slug like $1 || '-%'`,
    [normalised],
  );

  if (taken.length === 0) return normalised;

  const used = new Set(taken.map((row) => row.slug));
  let suffix = 2;
  while (used.has(`${normalised}-${suffix}`)) suffix += 1;
  return `${normalised}-${suffix}`;
}

export async function createPublication(input: {
  slug: string;
  areaKey: AreaKey;
  authorId: string;
  titleEs: string;
  titleEn: string;
  abstractEs: string;
  abstractEn: string;
  coverPath: string | null;
  pdfPath: string | null;
}): Promise<{ id: string; slug: string }> {
  const row = await queryOne<{ id: string; slug: string }>(
    `insert into publications
       (slug, area_key, author_id, title_es, title_en, abstract_es, abstract_en, cover_path, pdf_path)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, slug`,
    [
      input.slug,
      input.areaKey,
      input.authorId,
      input.titleEs,
      input.titleEn,
      input.abstractEs,
      input.abstractEn,
      input.coverPath,
      input.pdfPath,
    ],
  );
  if (!row) throw new Error('PUBLICATION_INSERT_FAILED');
  return row;
}

/**
 * Deletes a publication, scoped to the caller's area in the same statement.
 * Authorisation is part of the WHERE clause, so a forged id from another area
 * deletes nothing instead of relying on a separate check that could drift.
 */
export async function deletePublicationScoped(
  id: string,
  areaKey: AreaKey,
): Promise<{ pdfPath: string | null; coverPath: string | null } | null> {
  return queryOne<{ pdfPath: string | null; coverPath: string | null }>(
    `delete from publications
      where id = $1 and area_key = $2
      returning pdf_path as "pdfPath", cover_path as "coverPath"`,
    [id, areaKey],
  );
}
