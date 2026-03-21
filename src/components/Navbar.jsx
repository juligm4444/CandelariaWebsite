import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLogo from '../assets/images/MainLogo.png';
import { LanguageToggle } from './LanguageToggle';

export const Navbar = () => {
  const { t } = useTranslation();

  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link to="/" className="brand-link">
          <img src={MainLogo} alt="Candelaria" className="brand-logo" />
          <span>{t('site.brand')}</span>
        </Link>

        <div className="site-links">
          <Link to="/">{t('site.nav.home')}</Link>
          <Link to="/vehicle">{t('site.nav.vehicle')}</Link>
          <Link to="/team">{t('site.nav.team')}</Link>
          <Link to="/publications">{t('site.nav.publications')}</Link>
          <Link to="/about">{t('site.nav.about')}</Link>
          <Link to="/support">{t('site.nav.support')}</Link>
        </div>

        <div className="site-actions">
          <LanguageToggle />
          <Link to="/login" className="ghost-button">
            {t('site.nav.login')}
          </Link>
        </div>
      </nav>
    </header>
  );
};
