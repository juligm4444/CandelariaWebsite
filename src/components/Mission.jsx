import { useTranslation } from 'react-i18next';

export const Mission = () => {
  const { t } = useTranslation();

  return (
    <div className="mission-container">
      <h2 className="mission-title">{t('mission.title')}</h2>
      <p className="mission-description">
        {t('mission.description')}
      </p>
      
      <div className="mission-grid">
        <div className="mission-card">
          <div className="mission-card-icon">⚡</div>
          <h3 className="mission-card-title">{t('mission.innovation.title')}</h3>
          <p className="mission-card-text">
            {t('mission.innovation.text')}
          </p>
        </div>
        
        <div className="mission-card">
          <div className="mission-card-icon">🌱</div>
          <h3 className="mission-card-title">{t('mission.sustainability.title')}</h3>
          <p className="mission-card-text">
            {t('mission.sustainability.text')}
          </p>
        </div>
        
        <div className="mission-card">
          <div className="mission-card-icon">🎓</div>
          <h3 className="mission-card-title">{t('mission.education.title')}</h3>
          <p className="mission-card-text">
            {t('mission.education.text')}
          </p>
        </div>
      </div>
    </div>
  );
};
