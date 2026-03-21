import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { publicationsAPI } from '../services/api';

export const PublicationsPage = () => {
  const { t, i18n } = useTranslation();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await publicationsAPI.getAll(i18n.language);
        setPublications(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [i18n.language, t]);

  const availableTeams = useMemo(() => {
    return [...new Set(publications.map((item) => item.team_name).filter(Boolean))].sort();
  }, [publications]);

  const filteredPublications = useMemo(() => {
    const scoped =
      selectedTeam === 'all'
        ? publications
        : publications.filter((item) => item.team_name === selectedTeam);

    return [...scoped].sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
  }, [publications, selectedTeam]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block compact">
          <p className="eyebrow">{t('publications.eyebrow')}</p>
          <h1>{t('publications.title')}</h1>
          <p>{t('publications.subtitle')}</p>
        </section>

        <section className="filter-row">
          <label className="filter-label" htmlFor="publications-team-filter">
            {t('publications.filterByTeam')}
          </label>
          <select
            id="publications-team-filter"
            className="filter-select"
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
          >
            <option value="all">{t('publications.allTeams')}</option>
            {availableTeams.map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </section>

        {loading && <p className="state-msg">{t('common.loading')}</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && filteredPublications.length === 0 && (
          <article className="panel-card">
            <h2>{t('publications.emptyTitle')}</h2>
            <p>{t('publications.emptyBody')}</p>
          </article>
        )}

        <section className="panel-grid">
          {filteredPublications.map((publication) => (
            <article className="panel-card" key={publication.id}>
              <div className="card-meta">
                <span>{new Date(publication.publication_date).toLocaleDateString(i18n.language)}</span>
                {publication.team_name && <span>{publication.team_name}</span>}
              </div>
              <h2>{publication.title}</h2>
              <p>{publication.content?.slice(0, 260) || ''}</p>
              {publication.author_name && (
                <p className="byline">
                  {t('publications.by')} {publication.author_name}
                </p>
              )}
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};
