import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block compact">
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h1>{t('about.title')}</h1>
          <p>{t('about.subtitle')}</p>
        </section>

        <section className="panel-grid">
          <article className="panel-card">
            <h2>{t('about.missionTitle')}</h2>
            <p>{t('about.missionBody')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('about.visionTitle')}</h2>
            <p>{t('about.visionBody')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('about.valuesTitle')}</h2>
            <p>{t('about.valuesBody')}</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};
