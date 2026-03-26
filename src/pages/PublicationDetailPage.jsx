import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { publicationsAPI } from '../services/api';
import { resolveMediaUrl } from '../lib/media';

export const PublicationDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPublication = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await publicationsAPI.getById(id, i18n.language);
        setPublication(response.data || null);
      } catch {
        setPublication(null);
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [i18n.language, id, t]);

  const publicationDate = publication?.publication_date
    ? new Date(publication.publication_date).toLocaleDateString(i18n.language)
    : '';

  return (
    <div className="app-shell">
      <Navbar />
      <main className="publications-main">
        <section className="publications-hero section-shell publication-detail-hero">
          <h1>
            {t('publications.detailTitleA')}{' '}
            <span className="team-title-glow">{t('publications.detailTitleB')}</span>
          </h1>
          <p className="page-intro">{t('publications.detailSubtitle')}</p>
        </section>

        {loading && <p className="state-msg section-shell">{t('common.loading')}</p>}
        {error && <p className="state-msg error section-shell">{error}</p>}

        {!loading && !error && publication && (
          <section className="section-shell publication-detail-shell">
            <article className="publication-detail-card">
              {publication.image_url ? (
                <div className="publication-detail-image-wrap">
                  <img
                    src={resolveMediaUrl(publication.image_url)}
                    alt={publication.title}
                    className="publication-detail-image"
                  />
                </div>
              ) : null}

              <div className="publication-detail-content">
                <div className="publication-row-meta">
                  {publicationDate && <span>{publicationDate}</span>}
                  {publication.team_name && <span>{publication.team_name}</span>}
                </div>

                <h2>{publication.title}</h2>

                {publication.author_name && (
                  <small>
                    {t('publications.by')} {publication.author_name}
                  </small>
                )}

                <div className="publication-detail-body">
                  {publication.content
                    ?.split('\n')
                    .filter((paragraph) => paragraph.trim().length > 0)
                    .map((paragraph, index) => (
                      <p key={`${paragraph.slice(0, 30)}-${index}`}>{paragraph}</p>
                    ))}
                </div>

                <div className="publication-detail-actions">
                  <Link to="/publications" className="publication-read-link">
                    {t('publications.backToList')}
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};
