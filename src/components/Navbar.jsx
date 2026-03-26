import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import MainLogo from '../assets/images/MainLogo.png';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { to: '/vehicle', label: t('site.nav.vehicle') },
    { to: '/team', label: t('site.nav.team') },
    { to: '/publications', label: t('site.nav.publications') },
    { to: '/about', label: t('site.nav.about') },
    { to: '/support', label: t('site.nav.support') },
  ];

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header">
      <nav className="site-nav">
        <div className="site-nav-left">
          <Link to="/" className="brand-link" onClick={closeMenu}>
            <img src={MainLogo} alt="Candelaria" className="brand-logo" />
            <span>{t('site.brand')}</span>
          </Link>
        </div>

        <div className={`site-links ${isOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="site-actions">
          <LanguageToggle />
          {isAuthenticated && user ? (
            <Link to="/profile" className="profile-avatar-link" onClick={closeMenu}>
              {user.image_url ? (
                <img 
                  src={user.image_url} 
                  alt={user.name} 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className="nav-login-button">
              {t('site.nav.login')}
            </Link>
          )}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? t('site.nav.closeMenu') : t('site.nav.openMenu')}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <button
          className="site-nav-overlay"
          type="button"
          onClick={closeMenu}
          aria-label={t('site.nav.closeMenu')}
        />
      )}
    </header>
  );
};
