import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const VehiclePage = () => {
  const { t } = useTranslation();

  const hotspots = useMemo(() => t('vehicle.viewer.hotspots', { returnObjects: true }) || [], [t]);

  const specs = useMemo(() => t('vehicle.viewer.specs.items', { returnObjects: true }) || [], [t]);

  const bentoCards = useMemo(() => t('vehicle.bento.cards', { returnObjects: true }) || [], [t]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="vehicle-main">
        <section className="vehicle-hero section-shell">
          <h1>
            {t('vehicle.hero.titleA')}{' '}
            <span className="team-title-glow">{t('vehicle.hero.titleB')}</span>
          </h1>
        </section>

        <section className="vehicle-viewer">
          <div className="vehicle-atmosphere" aria-hidden="true">
            <div className="vehicle-atmosphere-a" />
            <div className="vehicle-atmosphere-b" />
          </div>

          <div className="vehicle-stage">
            <img
              className="vehicle-image"
              src={t('vehicle.viewer.image')}
              alt={t('vehicle.viewer.imageAlt')}
            />

            {hotspots.map((spot, index) => (
              <div
                key={`${spot.title}-${index}`}
                className={`vehicle-hotspot vehicle-hotspot-${spot.position}`}
              >
                <button className="vehicle-hotspot-button" aria-label={spot.title}>
                  {spot.icon}
                </button>
                <div className="vehicle-hotspot-tooltip">
                  <p>{spot.title}</p>
                  <span>{spot.body}</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="vehicle-panel vehicle-panel-left">
            <article className="vehicle-card vehicle-card-primary">
              <h3>{t('vehicle.viewer.telemetry.title')}</h3>

              <div className="vehicle-telemetry-block">
                <p>{t('vehicle.viewer.telemetry.cruiseLabel')}</p>
                <div className="vehicle-telemetry-value">
                  <strong>{t('vehicle.viewer.telemetry.cruiseValue')}</strong>
                  <span>{t('vehicle.viewer.telemetry.cruiseUnit')}</span>
                </div>
              </div>

              <div className="vehicle-telemetry-block">
                <p>{t('vehicle.viewer.telemetry.solarLabel')}</p>
                <div className="vehicle-solar-bar">
                  <div style={{ width: `${t('vehicle.viewer.telemetry.solarPercent')}%` }} />
                </div>
                <div className="vehicle-telemetry-meta">
                  <span>{t('vehicle.viewer.telemetry.solarPercent')}%</span>
                  <span>{t('vehicle.viewer.telemetry.solarInput')}</span>
                </div>
              </div>
            </article>

            <article className="vehicle-card vehicle-card-secondary">
              <h3>{t('vehicle.viewer.system.title')}</h3>
              <div className="vehicle-system-grid">
                <div>
                  <p>{t('vehicle.viewer.system.motorTempLabel')}</p>
                  <span>{t('vehicle.viewer.system.motorTempValue')}</span>
                </div>
                <div>
                  <p>{t('vehicle.viewer.system.tirePressureLabel')}</p>
                  <span>{t('vehicle.viewer.system.tirePressureValue')}</span>
                </div>
              </div>
            </article>
          </aside>

          <aside className="vehicle-panel vehicle-panel-right">
            <article className="vehicle-card">
              <h3>{t('vehicle.viewer.specs.title')}</h3>
              <ul className="vehicle-specs-list">
                {specs.map((item, index) => (
                  <li key={`${item.label}-${index}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article className="vehicle-live-pill">
              <span>{t('vehicle.viewer.liveTag')}</span>
              <p>{t('vehicle.viewer.liveStatus')}</p>
            </article>
          </aside>

        </section>

        <section className="vehicle-bento section-shell">
          <div className="vehicle-bento-grid">
            <article className="vehicle-bento-card vehicle-bento-card-wide">
              <h3>{bentoCards[0]?.title}</h3>
              <p>{bentoCards[0]?.body}</p>
            </article>

            <article className="vehicle-bento-card vehicle-bento-card-metric">
              <h3>{bentoCards[1]?.title}</h3>
              <p>{bentoCards[1]?.body}</p>
              <strong>{bentoCards[1]?.metric}</strong>
            </article>

            <article className="vehicle-bento-card">
              <h3>{bentoCards[2]?.title}</h3>
              <p>{bentoCards[2]?.body}</p>
            </article>

            <article className="vehicle-bento-card vehicle-bento-card-wide vehicle-bento-card-split">
              <div>
                <h3>{bentoCards[3]?.title}</h3>
                <p>{bentoCards[3]?.body}</p>
              </div>
              <div className="vehicle-bento-icon" aria-hidden="true">
                {t('vehicle.bento.compositeIcon')}
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
