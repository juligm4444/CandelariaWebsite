import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const Footer = () => {
  const { t } = useTranslation();
  const [selectedFooterLink, setSelectedFooterLink] = useState('');

  const footerLinks = [
    { label: t('footer.links.uniandes'), href: 'https://www.uniandes.edu.co/' },
    { label: t('footer.links.instagram'), href: 'https://www.instagram.com/candelaria_solarcar/' },
    {
      label: t('footer.links.linkedin'),
      href: 'https://www.linkedin.com/company/candelaria-auto-solar/',
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand-block">
          <h3 className="footer-brand-mark">{t('site.brand')}</h3>
          <p>{t('footer.rights')}</p>
        </div>

        <div className="footer-link-row">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`footer-link${selectedFooterLink === link.label ? ' is-selected' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSelectedFooterLink(link.label)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
