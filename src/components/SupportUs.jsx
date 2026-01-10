import { useTranslation } from 'react-i18next';

export const SupportUs = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto flex gap-12">
        {/* Left side - Image placeholder */}
        <div className="flex-1">
          <div className="image-placeholder h-96 w-full">
            <div className="image-placeholder-text">{t('supportUs.imagePlaceholder', 'Support Image')}</div>
          </div>
        </div>
        
        {/* Right side - Support text and button */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-black text-lg leading-relaxed mb-8">
            {t('supportUs.description', 'At the moment, Candelaria project has only being sponsored by the Universidad de los Andes and the effort of its members. But if you are interested in sponsor or support the project to participate in upcoming solar vehicle competitions, clicking the following button, you will be redirected to a payment gateway where you can voluntarily give a monetary support to the project:')}
          </p>
          
          <button className="bg-white border border-black px-8 py-3 rounded font-medium text-black hover:bg-gray-100 transition-colors self-start">
            {t('supportUs.button', 'Support Us')}
          </button>
        </div>
      </div>
    </div>
  );
};