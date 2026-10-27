import type { Metadata } from 'next';

import { SITE_NAME, SITE_URL, SOCIAL_PROFILES, UNIVERSITY } from '@/content/site';

/**
 * Metadata for a public page, so every page gets the same complete set:
 * unique title and description, a canonical URL, and Open Graph / Twitter
 * fields that repeat them (Next merges metadata shallowly, so a page that
 * set only `title` would otherwise share the site-wide social title).
 * The social image is the one app/opengraph-image.tsx renders. It has to be
 * named here: a page that sets its own `openGraph` replaces the whole
 * object, file-generated image included.
 */
export const SOCIAL_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, semillero de investigación de la Universidad de los Andes`,
};

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  /** Path of the page, e.g. "/vehicle". Becomes the canonical URL. */
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
      locale: 'es_CO',
      images: [SOCIAL_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [SOCIAL_IMAGE.url] },
  };
}

/** The organisation and the website, on every page (root layout). */
export function siteJsonLd(description: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ResearchProject',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: 'Candelaria',
        url: SITE_URL,
        logo: `${SITE_URL}/brand/isotipo-institucional@2x.webp`,
        description,
        parentOrganization: { '@type': 'CollegeOrUniversity', name: UNIVERSITY.name, url: UNIVERSITY.url },
        sameAs: SOCIAL_PROFILES.map((profile) => profile.href),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ['es', 'en'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** One log entry, plus its breadcrumb trail. */
export function articleJsonLd(article: {
  slug: string;
  title: string;
  abstract: string;
  publishedAt: string;
  areaName: string | null;
  authorName: string | null;
  image: string | null;
  logLabel: string;
}): Record<string, unknown> {
  const url = `${SITE_URL}/publications/${article.slug}`;
  const image = article.image ? new URL(article.image, SITE_URL).toString() : undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: url,
        url,
        headline: article.title,
        description: article.abstract.slice(0, 300),
        datePublished: article.publishedAt,
        ...(image ? { image } : {}),
        ...(article.areaName ? { articleSection: article.areaName } : {}),
        author: article.authorName
          ? { '@type': 'Person', name: article.authorName }
          : { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: article.logLabel, item: `${SITE_URL}/publications` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}
