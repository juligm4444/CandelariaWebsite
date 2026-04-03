import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { publicationsAPI } from '../services/api';
import { resolveMediaUrl } from '../lib/media';

export const PublicationsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortMode, setSortMode] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 3;

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

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        publications
          .map((item) => String(new Date(item.publication_date).getFullYear()))
          .filter((year) => year && year !== 'NaN')
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [publications]);

  const filteredPublications = useMemo(() => {
    let scoped =
      selectedTeam === 'all'
        ? publications
        : publications.filter((item) => item.team_name === selectedTeam);

    if (selectedYear !== 'all') {
      scoped = scoped.filter(
        (item) => String(new Date(item.publication_date).getFullYear()) === selectedYear
      );
    }

    const sorted = [...scoped].sort(
      (a, b) => new Date(b.publication_date) - new Date(a.publication_date)
    );
    if (sortMode === 'popular') {
      return sorted.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
    }

    return sorted;
  }, [publications, selectedTeam, selectedYear, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredPublications.length / perPage));
  const pagedPublications = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredPublications.slice(start, start + perPage);
  }, [currentPage, filteredPublications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeam, selectedYear, sortMode]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="publications-main">
        <section className="publications-hero section-shell">
          <h1>
            {t('publications.titleA')}{' '}
            <span className="team-title-glow">{t('publications.titleB')}</span>
          </h1>
          <p className="page-intro">{t('publications.subtitle')}</p>
        </section>

        <section className="publications-filters section-shell">
          <div className="publications-filter-head">
            <span>{t('publications.filtersTitle')}</span>
          </div>

          <div className="publications-select-row">
            <select
              className="publications-select"
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

            <select
              className="publications-select"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              <option value="all">{t('publications.allYears')}</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              className="publications-select"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="recent">{t('publications.sortRecent')}</option>
              <option value="popular">{t('publications.sortPopular')}</option>
            </select>
          </div>
        </section>

        {loading && <p className="state-msg">{t('common.loading')}</p>}
        {error && <p className="state-msg error">{error}</p>}

        {!loading && !error && filteredPublications.length === 0 && (
          <section className="section-shell">
            <article className="panel-card">
              <h2>{t('publications.emptyTitle')}</h2>
              <p>{t('publications.emptyBody')}</p>
            </article>
          </section>
        )}

        <section className="publications-list section-shell">
          {pagedPublications.map((publication) => (
            <article
              className="publication-row-card"
              key={publication.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/publications/${publication.slug}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/publications/${publication.slug}`);
                }
              }}
            >
              <div className="publication-row-image">
                {publication.image ? (
                  <img src={resolveMediaUrl(publication.image)} alt={publication.name} />
                ) : (
                  <div className="publication-image-fallback">SOLAR</div>
                )}
              </div>

              <div className="publication-row-body">
                <div className="publication-row-meta">
                  <span>
                    {new Date(publication.publication_date).toLocaleDateString(i18n.language)}
                  </span>
                  {publication.team_name && <span>{publication.team_name}</span>}
                </div>

                <h2>{publication.name}</h2>
                <p>{publication.abstract?.slice(0, 260) || ''}</p>

                {publication.author_name && (
                  <small>
                    {t('publications.by')} {publication.author_name}
                  </small>
                )}

                <Link to={`/publications/${publication.slug}`} className="publication-read-link">
                  {t('publications.readPost')}
                </Link>
              </div>
            </article>
          ))}
        </section>

        {!loading && !error && filteredPublications.length > 0 && (
          <section className="publications-pagination section-shell">
            <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              {t('publications.prev')}
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('publications.next')}
            </button>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};
