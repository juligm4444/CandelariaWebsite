import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' }
];

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const stored = localStorage.getItem('lang');
    if (stored && stored !== lang) {
      i18n.changeLanguage(stored);
      setLang(stored);
    }
  }, []);

  const toggle = () => {
    const next = lang === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    setLang(next);
  };

  return (
    <button onClick={toggle} className="px-3 py-1 text-sm rounded-full border border-border">
      {LANGS.find(l => l.code === lang)?.label}
    </button>
  );
};