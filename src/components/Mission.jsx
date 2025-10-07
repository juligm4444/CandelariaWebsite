import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Mission = () => {
  const [showParagraph, setShowParagraph] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setShowParagraph(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="mission" className="pt-32 pb-24 container text-center">
      <h2 className="text-2xl md:text-4xl font-bold mb-6">Nuestra Misión</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
        {showParagraph ? t('mission.text') : ''}
      </p>
    </section>
  );
};
