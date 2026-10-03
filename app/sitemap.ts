import type { MetadataRoute } from 'next';

import { listPublications } from '@/lib/db/publications';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_URL ?? 'https://candelaria.website').replace(/\/+$/, '');
  const now = new Date();

  const staticRoutes = [
    '',
    '/vehicle',
    '/team',
    '/publications',
    '/about',
    '/support',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.7,
  }));

  // A sitemap must never take the site down, so a database outage yields the
  // static routes rather than a 500.
  const published = await listPublications('es', { perPage: 48 }).catch(() => ({ items: [] }));

  const publicationRoutes = published.items.map((publication) => ({
    url: `${base}/publications/${publication.slug}`,
    lastModified: new Date(publication.publishedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...publicationRoutes];
}
