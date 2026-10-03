import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';
import Link from 'next/link';

import { Lockup } from '@/components/brand/lockup';
import { Container } from '@/components/ui/layout';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * Site footer. Carries the institutional attribution and the real external
 * links. No locale strip, no build stamp, no decorative status dots.
 */
const SOCIAL = [
  { href: 'https://www.instagram.com/candelariasolarcar/', label: 'Instagram', Icon: IconBrandInstagram },
  {
    href: 'https://www.linkedin.com/company/candelaria-solar-car/',
    label: 'LinkedIn',
    Icon: IconBrandLinkedin,
  },
  { href: 'https://github.com/candelaria-solar-car', label: 'GitHub', Icon: IconBrandGithub },
];

export function Footer({ t }: { t: Dictionary }) {
  const year = new Date().getFullYear();

  const site = [
    { href: '/vehicle', label: t.nav.vehicle },
    { href: '/team', label: t.nav.team },
    { href: '/publications', label: t.nav.publications },
    { href: '/about', label: t.nav.about },
  ];

  const community = [
    { href: '/support', label: t.nav.support },
    { href: '/contact', label: t.footer.contact },
    { href: '/login', label: t.nav.login },
  ];

  const legal = [
    { href: '/privacy', label: t.footer.privacy },
    { href: '/terms', label: t.footer.terms },
  ];

  return (
    <footer className="border-t border-hairline bg-canvas text-ink">
      <Container className="flex flex-col gap-9 py-9 md:py-15">
        <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="-ml-2 self-start rounded-pill">
              <Lockup size={40} />
            </Link>
            <p className="max-w-[32ch] text-base text-ink-muted">{t.footer.tagline}</p>
            <ul className="mt-1 flex items-center gap-2">
              {SOCIAL.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-12 items-center justify-center rounded-pill border border-hairline text-ink-muted transition-colors duration-200 ease-brand hover:border-accent hover:text-accent"
                  >
                    <Icon className="icon-brand" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title={t.footer.sectionSite} items={site} />
          <FooterColumn title={t.footer.sectionCommunity} items={community} />
          <FooterColumn title={t.footer.sectionLegal} items={legal} />
        </div>

        <div className="flex flex-col gap-2 border-t border-hairline pt-5 md:flex-row md:items-baseline md:justify-between">
          <p className="text-base text-ink-muted">
            © {year} {t.footer.rights}
          </p>
          <p className="text-base text-ink-faint">
            {t.footer.institution}. {t.footer.builtBy}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2">
      <h2 className="font-texto text-base font-medium uppercase text-accent">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-10 items-center text-base text-ink-muted transition-colors duration-200 ease-brand hover:text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
