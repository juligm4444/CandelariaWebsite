import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTranslation } from 'react-i18next';

export const VehiclePage = () => {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-wrap">
        <section className="hero-block">
          <p className="eyebrow">{t('vehicle.eyebrow')}</p>
          <h1>{t('vehicle.title')}</h1>
          <p>{t('vehicle.subtitle')}</p>
        </section>

        <section className="kpi-grid">
          <article className="glass-card">
            <h3>{t('vehicle.kpis.speed.label')}</h3>
            <p>{t('vehicle.kpis.speed.value')}</p>
          </article>
          <article className="glass-card">
            <h3>{t('vehicle.kpis.efficiency.label')}</h3>
            <p>{t('vehicle.kpis.efficiency.value')}</p>
          </article>
          <article className="glass-card">
            <h3>{t('vehicle.kpis.battery.label')}</h3>
            <p>{t('vehicle.kpis.battery.value')}</p>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel-card">
            <h2>{t('vehicle.sections.ai.title')}</h2>
            <p>{t('vehicle.sections.ai.body')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('vehicle.sections.solar.title')}</h2>
            <p>{t('vehicle.sections.solar.body')}</p>
          </article>
          <article className="panel-card">
            <h2>{t('vehicle.sections.aero.title')}</h2>
            <p>{t('vehicle.sections.aero.body')}</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};
