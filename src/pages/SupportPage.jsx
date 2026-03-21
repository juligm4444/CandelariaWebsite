import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const SupportPage = () => {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block compact">
          <p className="eyebrow">{t('support.eyebrow')}</p>
          <h1>{t('support.title')}</h1>
          <p>{t('support.subtitle')}</p>
        </section>

        <section className="panel-grid">
          <article className="panel-card">
            <h2>{t('support.membershipTitle')}</h2>
            <p>{t('support.membershipBody')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('support.donationTitle')}</h2>
            <p>{t('support.donationBody')}</p>
            <button className="primary-button">{t('support.cta')}</button>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};
