import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { membersAPI, publicationsAPI } from '../services/api';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [memberCount, setMemberCount] = useState(0);
  const [latestPublication, setLatestPublication] = useState(null);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const [membersRes, publicationsRes] = await Promise.all([
          membersAPI.getAll(i18n.language),
          publicationsAPI.getAll(i18n.language),
        ]);

        const members = Array.isArray(membersRes.data) ? membersRes.data : [];
        const publications = Array.isArray(publicationsRes.data) ? publicationsRes.data : [];

        setMemberCount(members.length);
        setLatestPublication(
          [...publications].sort(
            (a, b) => new Date(b.publication_date) - new Date(a.publication_date)
          )[0] || null
        );
      } catch {
        setMemberCount(0);
        setLatestPublication(null);
      }
    };

    loadHighlights();
  }, [i18n.language]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>

          <div className="hero-actions">
            <Link to="/vehicle" className="primary-button">
              {t('home.primaryAction')}
            </Link>
            <Link to="/team" className="ghost-button large">
              {t('home.secondaryAction')}
            </Link>
          </div>
        </section>

        <section className="kpi-grid">
          <article className="glass-card">
            <h3>{t('home.kpis.members')}</h3>
            <p>{memberCount}</p>
          </article>
          <article className="glass-card">
            <h3>{t('home.kpis.availability')}</h3>
            <p>{t('home.kpis.availabilityValue')}</p>
          </article>
          <article className="glass-card">
            <h3>{t('home.kpis.mode')}</h3>
            <p>{t('home.kpis.modeValue')}</p>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel-card">
            <h2>{t('home.sections.updates')}</h2>
            {latestPublication ? (
              <>
                <h3>{latestPublication.title}</h3>
                <p>{latestPublication.content}</p>
              </>
            ) : (
              <p>{t('home.noPublication')}</p>
            )}
          </article>
          <article className="panel-card">
            <h2>{t('home.sections.mission')}</h2>
            <p>{t('home.sections.missionBody')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('home.sections.routing')}</h2>
            <p>{t('home.sections.routingBody')}</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};
