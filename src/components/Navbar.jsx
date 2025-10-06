import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

const links = [
  { k: 'home', href: '#home' },
  { k: 'lines', href: '#lines' },
  { k: 'publications', href: '#publications' },
  { k: 'projects', href: '#projects' },
  { k: 'team', href: '#team' },
  { k: 'contact', href: '#contact' }
];

export const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all ${scrolled ? 'bg-background/80 backdrop-blur border-b border-border' : ''}`}>
      <div className="container flex items-center justify-between py-4">
        <a href="#home" className="text-lg font-semibold tracking-wide">{t('navbar.name')}</a>
        <div className="hidden md:flex gap-6 items-center">
          {links.map(l => (
            <a key={l.k} href={l.href} className="text-sm hover:text-primary transition">
              {t(`navbar.${l.k}`)}
            </a>
          ))}
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <button
          onClick={() => setOpen(o => !o)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6">
          {links.map(l => (
            <a
              key={l.k}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-border pb-2"
            >
              {t(`navbar.${l.k}`)}
            </a>
          ))}
          <div className="flex gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};