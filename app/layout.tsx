import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { PostHogProvider } from '@/components/analytics/posthog-provider';
import { InteractionLayer } from '@/components/interaction/interaction-layer';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { SiteLoader } from '@/components/motion/site-loader';
import { JsonLd } from '@/components/seo/json-ld';
import { areas } from '@/content/areas';
import { SITE_NAME, SITE_URL } from '@/content/site';
import { getCurrentUser } from '@/lib/auth/session';
import { getContent } from '@/lib/i18n/server';
import { siteJsonLd } from '@/lib/seo';

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

const DESCRIPTION =
  'Semillero de investigación interdisciplinario de la Universidad de los Andes que diseña, construye y valida un vehículo solar de competencia.';

/**
 * Site-wide metadata. No canonical here: it would be inherited by pages that
 * must not claim "/" (sign-in, 404). The home page sets its own canonical;
 * every other public page replaces title, description, canonical and social
 * fields through `pageMetadata`.
 * Icons and the social card come from the file conventions in app/
 * (favicon.ico, icon.png, apple-icon.png, opengraph-image.tsx).
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Candelaria Solar Car · Vehículo solar de la Universidad de los Andes',
    template: '%s | Candelaria Solar Car',
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Candelaria Solar Car · Vehículo solar de la Universidad de los Andes',
    description: DESCRIPTION,
    locale: 'es_CO',
  },
  twitter: { card: 'summary_large_image' },
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
    <html lang={locale} className={inter.variable} data-scroll-behavior="smooth">
      <body>
        <JsonLd data={siteJsonLd(DESCRIPTION)} />
        <SiteLoader
          name="CANDELARIA"
          subtitle="SOLAR CAR"
          caption={t.loader.caption}
          attributes={t.loader.attributes}
          values={t.about.valuesBand.items}
          areaColors={areas.map((area) => area.accent)}
          loadingLabel={t.common.loading}
        />
        <InteractionLayer />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-12 focus:items-center focus:rounded-pill focus:bg-dorado-100 focus:px-4 focus:text-base focus:font-medium focus:text-morado-300"
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
