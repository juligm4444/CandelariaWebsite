import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { publicationsAPI } from '../services/api';
import { resolveMediaUrl } from '../lib/media';

export const PublicationDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPublication = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await publicationsAPI.getBySlug(slug, i18n.language);
        setPublication(response.data || null);
      } catch {
        setPublication(null);
        setError(t('common.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [i18n.language, slug, t]);

  const publicationDate = publication?.publication_date
    ? new Date(publication.publication_date).toLocaleDateString(i18n.language)
    : '';

  return (
    <div className="app-shell">
      <Navbar />
      <main className="publications-main">
        {loading && <p className="state-msg section-shell">{t('common.loading')}</p>}
        {error && <p className="state-msg error section-shell">{error}</p>}

        {!loading && !error && publication && (
          <section className="section-shell publication-detail-shell">
            <article className="publication-detail-card">
              <div className="publication-detail-header">
                {publication.image ? (
                  <div className="publication-detail-image-wrap">
                    <img
                      src={resolveMediaUrl(publication.image)}
                      alt={publication.name}
                      className="publication-detail-image"
                    />
                  </div>
                ) : null}

                <div className="publication-detail-content">
                  <div className="publication-row-meta">
                    {publicationDate && <span>{publicationDate}</span>}
                    {publication.team_name && <span>{publication.team_name}</span>}
                  </div>

                  <h2>{publication.name}</h2>

                  {publication.author_name && (
                    <small>
                      {t('publications.by')} {publication.author_name}
                    </small>
                  )}
                </div>
              </div>

              <div className="publication-detail-content">
                <div className="publication-detail-body">
                  {publication.abstract
                    ?.split('\n')
                    .filter((paragraph) => paragraph.trim().length > 0)
                    .map((paragraph, index) => (
                      <p key={`${paragraph.slice(0, 30)}-${index}`}>{paragraph}</p>
                    ))}
                </div>

                {publication.file && (
                  <div className="publication-file-section">
                    <iframe
                      src={resolveMediaUrl(publication.file)}
                      title={`${publication.name} PDF Preview`}
                      className="publication-pdf-preview"
                    />
                    <a
                      href={resolveMediaUrl(publication.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="publication-read-link"
                    >
                      Download PDF
                    </a>
                  </div>
                )}

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
