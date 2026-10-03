import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { PostHogProvider } from '@/components/analytics/posthog-provider';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getCurrentUser } from '@/lib/auth/session';
import { getContent } from '@/lib/i18n/server';

import './globals.css';

/**
 * Body typeface.
 *
 * The brand manual pairs Sansation (self-hosted, see globals.css) with
 * Helvetica Now. Helvetica Now is a licensed face we cannot ship, and the
 * manual's own instruction is to fall back rather than substitute a face with
 * a different silhouette. The Figma library mounts those styles on Inter, so
 * Inter is the documented stand-in and sits in front of the manual's fallback
 * stack. Light (300) is the default weight, exactly as the manual specifies.
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'https://candelaria.website'),
  title: {
    default: 'Candelaria Solar Car',
    template: '%s | Candelaria Solar Car',
  },
  description:
    'Semillero de investigación interdisciplinario de la Universidad de los Andes que diseña, construye y valida un vehículo solar de competencia.',
  applicationName: 'Candelaria Solar Car',
  authors: [{ name: 'Candelaria Solar Car' }],
  openGraph: {
    type: 'website',
    siteName: 'Candelaria Solar Car',
    title: 'Candelaria Solar Car',
    description:
      'Semillero interdisciplinario de la Universidad de los Andes. Diseñamos, construimos y validamos un vehículo solar de competencia.',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [{ url: '/brand/isotipo-institucional.webp', type: 'image/webp' }],
  },
  robots: { index: true, follow: true },
};

/** Single locked theme. The browser chrome matches the canvas, never inverts. */
export const viewport: Viewport = {
  themeColor: '#1E0A29',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, t } = await getContent();

  // Session failures must not take the whole site down: the public pages do
  // not need an account, so a database outage degrades to a signed-out shell.
  const user = await getCurrentUser().catch(() => null);

  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-dorado-100 focus:px-4 focus:py-3 focus:text-base focus:font-medium focus:text-morado-300"
        >
          {t.common.skipToContent}
        </a>
        {/* Next reads the nonce from the Content-Security-Policy header that
            proxy.ts puts on the request, and stamps it onto its own
            scripts. Nothing else is needed here. */}
        <PostHogProvider>
          <Navbar
            locale={locale}
            t={t}
            user={user ? { name: user.name, isInternal: user.isInternal } : null}
          />
          <main id="contenido">{children}</main>
          <Footer t={t} />
        </PostHogProvider>
      </body>
    </html>
  );
}
