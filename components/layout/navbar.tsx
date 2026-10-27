'use client';

import { IconChevronDown, IconMenu2, IconX } from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { Lockup } from '@/components/brand/lockup';
import { LocaleSwitch } from '@/components/layout/locale-switch';
import { NavLink, isCurrentPath } from '@/components/ui/nav-link';
import { signOut } from '@/lib/auth/client';
import type { Dictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

export type NavUser = {
  name: string;
  isInternal: boolean;
} | null;

/**
 * Site header. Single line at desktop, 72px tall, which stays inside the 80px
 * cap and keeps the hero in the first viewport. The mobile panel is a full
 * sheet because five sections plus an account menu do not fit a dropdown.
 */
export function Navbar({
  locale,
  t,
  user,
}: {
  locale: Locale;
  t: Dictionary;
  user: NavUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // Which desktop link the pointer is over: one highlight slides between them.
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = usePrefersReducedMotion();
  const accountRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const accountId = useId();

  const links = [
    { href: '/vehicle', label: t.nav.vehicle },
    { href: '/team', label: t.nav.team },
    { href: '/publications', label: t.nav.publications },
    { href: '/about', label: t.nav.about },
  ];

  // Close both overlays whenever the route changes. Adjusting state during
  // render is the documented pattern for deriving from a changed prop: doing
  // it in an effect would paint the old open menu for a frame first.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (pathname !== renderedPath) {
    setRenderedPath(pathname);
    setMenuOpen(false);
    setAccountOpen(false);
  }

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  const handleSignOut = async () => {
    await signOut();
    setAccountOpen(false);
    router.push('/');
    router.refresh();
  };

  const isCurrent = (href: string) => isCurrentPath(pathname, href);

  return (
    <>
    <header className="cdl-header sticky top-0 z-40 border-b border-hairline bg-canvas/88 backdrop-blur-md">
      {/* The full bar needs 1280px: four links, the language switch, the
          call to action and the account. Below that (tablets included) the
          menu button opens the full-height sheet. */}
      <nav
        aria-label={t.nav.primary}
        className="gutter mx-auto flex h-[4.5rem] w-full max-w-[120rem] items-center justify-between gap-4"
      >
        <Link href="/" className="-ml-2 shrink-0 rounded-pill" aria-label={t.nav.home}>
          <Lockup size={36} priority />
        </Link>

        <ul className="hidden items-center gap-1 xl:flex" onPointerLeave={() => setHovered(null)}>
          {links.map((link) => (
            <li key={link.href} onPointerEnter={() => setHovered(link.href)}>
              <NavLink
                href={link.href}
                onFocus={() => setHovered(link.href)}
                onBlur={() => setHovered(null)}
                data-ripple=""
                className="cdl-press relative isolate inline-flex min-h-12 items-center rounded-pill px-4 text-base"
                adornment={
                  // One highlight for the whole nav, sliding between links.
                  hovered === link.href ? (
                    <motion.span
                      layoutId="nav-hover"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-pill border border-hairline"
                      style={{
                        background:
                          'radial-gradient(120% 140% at 50% 0%, rgb(255 185 56 / 0.16), rgb(62 16 87 / 0.55) 70%)',
                      }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.42, bounce: 0.12 }}
                    />
                  ) : null
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} label={t.common.languageSwitch} className="hidden sm:inline-flex" />

          <Link
            href="/support"
            aria-current={isCurrent('/support') ? 'page' : undefined}
            data-light=""
            data-ripple=""
            data-magnetic=""
            className="cdl-press cdl-light cdl-sheen hidden min-h-12 items-center rounded-pill bg-dorado-100 px-4 text-base font-medium text-morado-300 [--cdl-light-alpha:0.38] [--cdl-light-rgb:255_255_255] [--cdl-light-size:180px] md:inline-flex"
          >
            {t.nav.supportCta}
          </Link>

          {user ? (
            <div ref={accountRef} className="relative hidden xl:block">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-controls={accountId}
                onClick={() => setAccountOpen((open) => !open)}
                data-light=""
                data-ripple=""
                className="cdl-press cdl-light cdl-light-edge inline-flex min-h-12 items-center gap-2 rounded-pill border border-hairline px-3 text-base [--cdl-light-alpha:0.12]"
              >
                <span className="max-w-32 truncate">{user.name}</span>
                <IconChevronDown
                  className={cn('icon-brand size-5 transition-transform duration-200', accountOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>

              {accountOpen ? (
                <div
                  id={accountId}
                  className="absolute right-0 top-14 w-60 overflow-hidden rounded-card border border-hairline bg-surface"
                >
                  <AccountLinks t={t} isInternal={user.isInternal} onSignOut={handleSignOut} />
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              data-light=""
              data-ripple=""
              className="cdl-press cdl-light cdl-light-edge hidden min-h-12 items-center rounded-pill border border-hairline-strong px-4 text-base font-medium text-ink hover:border-hairline hover:text-accent [--cdl-light-alpha:0.12] xl:inline-flex"
            >
              {t.nav.login}
            </Link>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
            data-ripple=""
            className="cdl-press inline-flex size-12 items-center justify-center rounded-pill border border-hairline hover:border-accent xl:hidden"
          >
            {menuOpen ? (
              <IconX className="icon-brand" aria-hidden />
            ) : (
              <IconMenu2 className="icon-brand" aria-hidden />
            )}
          </button>
        </div>
      </nav>
    </header>

      {/* The sheet lives outside <header> on purpose: the header's
          backdrop-filter makes it the containing block of fixed children, so
          inside it the sheet collapsed to the header's own height. */}
      {menuOpen ? (
        <div
          id={panelId}
          data-open=""
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto overscroll-contain border-t border-hairline bg-canvas transition-[opacity,translate] duration-300 ease-out-ui starting:-translate-y-2 starting:opacity-0 xl:hidden"
        >
          <div className="gutter flex flex-col gap-5 py-5">
            <ul className="flex flex-col">
              {links.map((link, index) => (
                <li
                  key={link.href}
                  data-stagger=""
                  style={{ '--i': index } as React.CSSProperties}
                  className="border-b border-hairline"
                >
                  <NavLink
                    href={link.href}
                    data-ripple=""
                    className="cdl-press flex min-h-14 items-center font-titulo text-2xl font-bold [--cdl-nav-color:var(--cdl-text)]"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <Link
              href="/support"
              data-ripple=""
              className="cdl-press inline-flex min-h-14 items-center justify-center rounded-pill bg-dorado-100 px-6 text-base font-medium text-morado-300 [--cdl-light-rgb:255_255_255]"
            >
              {t.nav.supportCta}
            </Link>

            {user ? (
              <div className="overflow-hidden rounded-card border border-hairline">
                <AccountLinks t={t} isInternal={user.isInternal} onSignOut={handleSignOut} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  data-ripple=""
                  className="cdl-press inline-flex min-h-14 items-center justify-center rounded-pill bg-[var(--cdl-btn-bg)] px-6 text-base font-medium text-[var(--cdl-btn-fg)]"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  data-ripple=""
                  className="cdl-press inline-flex min-h-14 items-center justify-center rounded-pill border border-hairline-strong px-6 text-base font-medium text-ink"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            <LocaleSwitch locale={locale} label={t.common.languageSwitch} className="self-start sm:hidden" />
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccountLinks({
  t,
  isInternal,
  onSignOut,
}: {
  t: Dictionary;
  isInternal: boolean;
  onSignOut: () => void;
}) {
  const items = [
    { href: '/profile', label: t.nav.profile },
    { href: '/purchases', label: t.nav.purchases },
    ...(isInternal ? [{ href: '/dashboard', label: t.nav.dashboard }] : []),
  ];

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-light=""
          data-ripple=""
          className="cdl-light flex min-h-12 items-center border-b border-hairline px-4 text-base text-ink-muted transition-colors duration-200 hover:text-ink [--cdl-light-alpha:0.14]"
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onSignOut}
        data-light=""
        data-ripple=""
        className="cdl-light flex min-h-12 items-center px-4 text-left text-base text-ink-muted transition-colors duration-200 hover:text-ink [--cdl-light-alpha:0.14]"
      >
        {t.nav.logout}
      </button>
    </div>
  );
}
