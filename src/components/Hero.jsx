import { useTranslation } from 'react-i18next';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="hero-container">
      {/* Simple vertical layout - centered, no margins */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        
        {/* Quote - left aligned */}
        <div style={{ textAlign: 'left', fontSize: '1.5rem' }}>
          {t('hero.quote', 'Defy the limits of the')} <span style={{ fontWeight: 'bold' }}>{t('hero.quoteEmphasize', 'sun')}</span>
        </div>

        {/* Title - centered */}
        <h1 style={{ 
          fontSize: 'clamp(4rem, 12vw, 10rem)', 
          fontWeight: 900,
          textAlign: 'center',
          margin: '20px 0'
        }}>
          {t('hero.title', 'CANDELARIA')}
        </h1>

        {/* Description - right aligned */}
        <div style={{ textAlign: 'right', fontSize: '1.5rem' }}>
          {t('hero.description', 'A student-led solar vehicle project focused on a')} <span style={{ fontWeight: 'bold' }}>{t('hero.descriptionEmphasize', 'sustainable future')}</span>.
        </div>

      </div>

      {/* Blue bar */}
      <div style={{ 
        position: 'absolute',
        bottom: '30%',
        left: '0',
        width: '100%',
        height: '20px',
        backgroundColor: '#3b82f6'
      }}></div>

      {/* Meet Us button - bottom left */}
      <div className="absolute" style={{ bottom: '4rem', left: '2rem' }}>
        <button className="bg-white border-2 border-black px-6 py-3 rounded-lg font-medium text-black hover:bg-gray-100 transition-colors">
          {t('hero.meetUsButton', 'Meet Us')}
        </button>
      </div>

      {/* Scroll Down indicator - bottom center */}
      <div className="absolute" style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="text-center">
          <p className="text-black text-lg mb-2">{t('hero.scrollDown', 'Scroll Down')}</p>
          <div className="flex justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-bounce">
              <path d="M12 16L16 12H8L12 16Z" fill="black"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};