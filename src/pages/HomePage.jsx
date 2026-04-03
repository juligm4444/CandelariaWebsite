import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { publicationsAPI } from '../services/api';
import DonateIcon from '../assets/icons/donate.svg';
import { resolveMediaUrl } from '../lib/media';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [publications, setPublications] = useState([]);

  const heroHighlights = useMemo(
    () => t('home.hero.highlights', { returnObjects: true }) || [],
    [t]
  );

  const tickerItems = useMemo(() => t('home.ticker.items', { returnObjects: true }) || [], [t]);

  const sponsorItems = useMemo(() => t('home.sponsors.items', { returnObjects: true }) || [], [t]);

  useEffect(() => {
    const loadPublications = async () => {
      try {
        const response = await publicationsAPI.getAll(i18n.language);
        setPublications(Array.isArray(response.data) ? response.data : []);
      } catch {
        setPublications([]);
      }
    };

    loadPublications();
  }, [i18n.language]);

  const featuredUpdates = useMemo(() => {
    const sorted = [...publications].sort(
      (a, b) => new Date(b.publication_date) - new Date(a.publication_date)
    );

    const liveItems = sorted.slice(0, 2).map((publication) => {
      const formattedDate = publication.publication_date
        ? new Intl.DateTimeFormat(i18n.language === 'es' ? 'es-CO' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(new Date(publication.publication_date))
        : '';

      return {
        slug: publication.slug,
        date: formattedDate,
        title: publication.name,
        body:
          publication.abstract && publication.abstract.length > 220
            ? `${publication.abstract.slice(0, 220)}...`
            : publication.abstract,
        image: resolveMediaUrl(publication.image),
        alt: publication.name,
      };
    });

    // Only show actual DB publications — do not pad with fallback items
    return liveItems.slice(0, 2);
  }, [i18n.language, publications]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-glow landing-hero-glow-primary" />
          <div className="landing-hero-glow landing-hero-glow-secondary" />

          <div className="landing-hero-content">
            <h1 className="landing-hero-title">{t('home.title')}</h1>

            <div className="landing-hero-copy">
              <p className="landing-kicker">{t('home.hero.kicker')}</p>
              <p className="landing-subtitle page-intro">{t('home.hero.subtitle')}</p>
            </div>

            <div className="landing-hero-actions">
              <Link to="/vehicle" className="landing-primary-button">
                {t('home.hero.primaryAction')}
              </Link>
              <Link to="/team" className="landing-secondary-button">
                {t('home.hero.secondaryAction')}
              </Link>
            </div>
          </div>
        </section>

        <section className="telemetry-strip">
          <div className="telemetry-ticker">
            <div className="telemetry-track">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <div className="telemetry-item" key={`${item.label}-${index}`}>
                  <span className="telemetry-label">{item.label}</span>
                  <span className="telemetry-value">
                    {item.value} <span>{item.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell updates-section">
          <div className="section-heading-row">
            <div>
              <span className="section-label">{t('home.updates.eyebrow')}</span>
              <h2 className="section-title">{t('home.updates.title')}</h2>
            </div>
            <div className="section-line" />
          </div>

          <div className="updates-grid">
            {featuredUpdates.map((item, index) => (
              <article className="update-card" key={`${item.title}-${index}`}>
                <div className="update-card-media">
                  {item.image ? (
                    <img src={item.image} alt={item.alt} />
                  ) : (
                    <div className="publication-image-fallback">SOLAR</div>
                  )}
                </div>

                <div className="update-card-body">
                  <span className="update-date">{item.date}</span>
                  <h3 className="update-title">{item.title}</h3>
                  <p className="update-description">{item.body}</p>
                  <div className="update-link-wrap">
                    <Link to={`/publications/${item.slug}`} className="update-link">
                      {t('home.updates.readMore')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell appreciation-section">
          <div className="appreciation-card">
            <div className="appreciation-image-wrap">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh6-sxsbxilIU4Dk6spl0Nsfq2eGd5EiHD1mxL4hefR4r81t0WrKRDo_NlhMAkQTvaJ6hqTDV3e5l0fhtmiDQW9hhovQgxkDDmAJcltKRbrtpDiiY9B2DVCEG_72dEvzUwLtQEuf8NIRtdsUXafElKHiIEx4rJh3OfbuIUbMTRVSNYlRfCT_jrGnNu1hgN4GXs3R3ZuUUrETlEStHikZrocrAKAjPolr67rAvRCdBTLMFOESPg3OHsfYUrHQGpLp0MJjt3vE7UGaY"
                alt={t('home.appreciation.imageAlt')}
              />
            </div>

            <div className="appreciation-overlay" />

            <div className="appreciation-content">
              <h2>
                {t('home.appreciation.title')} <span>{t('home.appreciation.highlight')}</span>
              </h2>
              <p>{t('home.appreciation.body')}</p>
              <Link to="/support" className="landing-support-button">
                <img src={DonateIcon} alt="" className="donate-icon" aria-hidden="true" />
                {t('home.appreciation.cta')}
              </Link>
            </div>
          </div>
        </section>

        <section className="sponsors-section">
          <div className="section-shell sponsors-shell">
            <p className="sponsors-label">{t('home.sponsors.title')}</p>
            <div className="sponsors-grid">
              {sponsorItems.map((item) => (
                <div className="sponsor-mark" key={item.name}>
                  <span className="sponsor-name">{item.name}</span>
                  <span className="sponsor-caption">{item.caption}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
