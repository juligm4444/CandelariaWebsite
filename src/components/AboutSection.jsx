import { useTranslation } from 'react-i18next';

export const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-screen bg-white flex items-center py-16">
      {/* Content container with solid frame */}
      <div className="w-full max-w-6xl mx-auto px-8">
        {/* Content box with solid frame and different background */}
        <div className="bg-gray-50 border-4 border-black rounded-lg p-12 flex">
          {/* Text content */}
          <div className="w-3/5 pr-8">
            <h2 className="text-3xl font-bold text-black mb-8">
              {t('about.titleMain', 'What drives Candelaria:')}
            </h2>
            <div className="space-y-6">
              <p className="text-black text-lg leading-relaxed">
                <span className="font-bold">{t('about.collaboration', 'Interdisciplinary collaboration')}</span> {t('about.collaborationText', 'to design and build a high-performance solar vehicle.')}
              </p>
              
              <p className="text-black text-lg leading-relaxed">
                <span className="font-bold">{t('about.research', 'Research and knowledge generation')}</span> {t('about.researchText', 'in solar mobility, shared through publications and education.')}
              </p>
              
              <p className="text-black text-lg leading-relaxed">
                <span className="font-bold">{t('about.excellence', 'Design excellence and real-world performance')}</span>, {t('about.excellenceText', 'validated through testing and international competitions.')}
              </p>
            </div>
          </div>
          
          {/* Image placeholder */}
          <div className="w-2/5 flex items-center justify-center">
            <div className="w-full h-80 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg">
              <div className="text-center text-gray-500">
                <p className="text-xl font-medium">{t('about.imagePlaceholder', 'Solar Vehicle Image')}</p>
                <p className="text-sm mt-2">{t('about.imageDescription', 'Our latest solar vehicle prototype')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};