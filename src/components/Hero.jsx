import { useTranslation } from 'react-i18next';

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="pt-32 pb-24 container text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto">
        {t('hero.title')}
      </h1>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
        {t('hero.subtitle')}
      </p>
      <a href="#lines" className="general-button">{t('hero.cta')}</a>
    </section>
  );
};