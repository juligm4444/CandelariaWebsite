'use client';

import { IconChevronDown, IconMenu2, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { Lockup } from '@/components/brand/lockup';
import { LocaleSwitch } from '@/components/layout/locale-switch';
import { signOut } from '@/lib/auth/client';
import type { Dictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

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
  const accountRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const accountId = useId();

  const links = [
    { href: '/vehicle', label: t.nav.vehicle },
    { href: '/team', label: t.nav.team },
    { href: '/publications', label: t.nav.publications },
    { href: '/about', label: t.nav.about },
    { href: '/support', label: t.nav.support },
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

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/88 backdrop-blur-md">
      <nav
        aria-label={t.nav.primary}
        className="gutter mx-auto flex h-[4.5rem] w-full max-w-[1400px] items-center justify-between gap-4"
      >
        <Link href="/" className="-ml-2 shrink-0 rounded-pill" aria-label={t.nav.home}>
          <Lockup size={36} priority />
        </Link>

        <ul className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className={cn(
                  'text-base transition-colors duration-200 ease-brand hover:text-ink',
                  isCurrent(link.href) ? 'text-accent' : 'text-ink-muted',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} label={t.common.languageSwitch} className="hidden sm:inline-flex" />

          {user ? (
            <div ref={accountRef} className="relative hidden lg:block">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-controls={accountId}
                onClick={() => setAccountOpen((open) => !open)}
                className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-hairline px-3 text-base transition-colors duration-200 ease-brand hover:border-accent"
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
              className="hidden min-h-12 items-center rounded-pill bg-[var(--cdl-btn-bg)] px-4 text-base font-medium text-[var(--cdl-btn-fg)] transition-colors duration-200 ease-brand hover:bg-[var(--cdl-btn-bg-hover)] lg:inline-flex"
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
            className="inline-flex size-12 items-center justify-center rounded-pill border border-hairline transition-colors duration-200 ease-brand hover:border-accent lg:hidden"
          >
            {menuOpen ? (
              <IconX className="icon-brand" aria-hidden />
            ) : (
              <IconMenu2 className="icon-brand" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id={panelId}
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto border-t border-hairline bg-canvas lg:hidden"
        >
          <div className="gutter flex flex-col gap-5 py-5">
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href} className="border-b border-hairline">
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-14 items-center font-titulo text-2xl font-bold',
                      isCurrent(link.href) ? 'text-accent' : 'text-ink',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {user ? (
              <div className="overflow-hidden rounded-card border border-hairline">
                <AccountLinks t={t} isInternal={user.isInternal} onSignOut={handleSignOut} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="inline-flex min-h-14 items-center justify-center rounded-pill bg-[var(--cdl-btn-bg)] px-6 text-base font-medium text-[var(--cdl-btn-fg)]"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-14 items-center justify-center rounded-pill border border-hairline-strong px-6 text-base font-medium text-ink"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            <LocaleSwitch locale={locale} label={t.common.languageSwitch} className="self-start sm:hidden" />
          </div>
        </div>
      ) : null}
    </header>
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
          className="flex min-h-12 items-center border-b border-hairline px-4 text-base text-ink-muted transition-colors duration-200 ease-brand hover:bg-surface-raised hover:text-ink"
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onSignOut}
        className="flex min-h-12 items-center px-4 text-left text-base text-ink-muted transition-colors duration-200 ease-brand hover:bg-surface-raised hover:text-ink"
      >
        {t.nav.logout}
      </button>
    </div>
  );
}
