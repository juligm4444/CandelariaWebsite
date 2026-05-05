import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import DonateIcon from '../assets/icons/donate.svg';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const AboutPage = () => {
  const { t } = useTranslation();

  const valueItems = useMemo(() => t('about.values.items', { returnObjects: true }) || [], [t]);

  const historyItems = useMemo(() => t('about.history.items', { returnObjects: true }) || [], [t]);

  const descriptionParagraphs = useMemo(
    () => t('about.description.paragraphs', { returnObjects: true }) || [],
    [t]
  );

  const missionRef = useScrollReveal();
  const valuesRef = useScrollReveal();
  const historyRef = useScrollReveal();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="about-main">
        <section className="about-hero section-shell">
          <div className="about-hero-grid">
            <div>
              <h1>
                {t('about.hero.titleA')}{' '}
                <span className="team-title-glow">{t('about.hero.titleB')}</span>
              </h1>
              <p className="page-intro">{t('about.hero.subtitle')}</p>
            </div>
            <div className="about-hero-image-wrap">
              <img
                src={t('about.hero.image')}
                alt={t('about.hero.imageAlt')}
                className="about-hero-image"
              />
            </div>
          </div>
        </section>

        <section className="about-description section-shell">
          <div className="about-history-head">
            <h2>
              {t('about.description.titleA')} <span>{t('about.description.titleB')}</span>
            </h2>
          </div>
          <article className="about-description-card">
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
            ))}
          </article>
        </section>

        <section className="about-mission-strip reveal-up" ref={missionRef}>
          <div className="section-shell about-mission-grid">
            <article>
              <h2>{t('about.mission.title')}</h2>
              <p>{t('about.mission.body')}</p>
            </article>

            <article className="about-vision-card">
              <h2>{t('about.vision.title')}</h2>
              <p>{t('about.vision.body')}</p>
            </article>
          </div>
        </section>

        <section className="about-values-strip reveal-up" ref={valuesRef}>
          <div className="section-shell about-values-shell">
            <div className="about-values-head">
              <h2>
                {t('about.values.titleA')} <span>{t('about.values.titleB')}</span>
              </h2>
            </div>

            <div className="about-values-grid">
              {valueItems.map((item, index) => (
                <article key={`${item.title}-${index}`}>
                  {item.image && <img src={item.image} alt="" />}
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-history section-shell reveal-up" ref={historyRef}>
          <div className="about-history-head">
            <h2>
              {t('about.history.titleA')} <span>{t('about.history.titleB')}</span>
            </h2>
            <p>{t('about.history.subtitle')}</p>
          </div>

          <div className="about-history-line">
            {historyItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={index % 2 ? 'is-right' : 'is-left'}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell appreciation-section">
          <div className="appreciation-card">
            <div className="appreciation-image-wrap">
              <img src={t('vehicle.viewer.image')} alt={t('about.support.imageAlt')} />
            </div>
            <div className="appreciation-overlay" />
            <div className="appreciation-content">
              <h2>
                {t('about.support.title')} <span>{t('about.support.highlight')}</span>
              </h2>
              <p>{t('about.support.body')}</p>
              <Link to="/support" className="landing-support-button">
                <img src={DonateIcon} alt="" className="donate-icon" aria-hidden="true" />
                {t('about.support.cta')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
