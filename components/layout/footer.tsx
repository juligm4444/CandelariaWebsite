import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';
import Link from 'next/link';

import { Lockup } from '@/components/brand/lockup';
import { Container } from '@/components/ui/layout';
import { NavLink } from '@/components/ui/nav-link';
import { SOCIAL_PROFILES } from '@/content/site';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * Site footer. Carries the institutional attribution and the real external
 * links. No locale strip, no build stamp, no decorative status dots.
 */
const SOCIAL_ICONS = {
  instagram: IconBrandInstagram,
  linkedin: IconBrandLinkedin,
  github: IconBrandGithub,
} as const;

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
            <Link href="/" className="cdl-press -ml-2 self-start rounded-pill">
              <Lockup size={40} />
            </Link>
            <p className="max-w-[32ch] text-base text-ink-muted">{t.footer.tagline}</p>
            <ul className="mt-1 flex items-center gap-2">
              {SOCIAL_PROFILES.map(({ key, href, label }) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="cdl-glow inline-flex size-12 items-center justify-center rounded-pill border border-hairline text-ink-muted hover:border-accent hover:text-accent"
                    >
                      <Icon className="icon-brand" aria-hidden />
                    </a>
                  </li>
                );
              })}
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
            <NavLink
              href={item.href}
              data-light=""
              className="cdl-link inline-flex min-h-12 items-center text-base"
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
