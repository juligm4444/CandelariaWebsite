import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? 'https://candelaria.website';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Account surfaces and anything that can carry a token stay out of
        // the index.
        disallow: [
          '/api/',
          '/dashboard',
          '/profile',
          '/purchases',
          '/login',
          '/register',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
