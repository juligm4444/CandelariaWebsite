import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div>
        <h3>{t('site.brand')}</h3>
        <p>{t('footer.tagline')}</p>
      </div>
      <p>{t('footer.rights')}</p>
    </footer>
  );
};
