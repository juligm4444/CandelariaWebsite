import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'en');

  useEffect(() => {
    setLang(i18n.language || 'en');
  }, [i18n.language]);

  const toggle = () => {
    const next = lang === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    setLang(next);
  };

  return (
    <button onClick={toggle} className="lang-button" aria-label="Change language">
      {LANGS.find((l) => l.code === lang)?.label}
    </button>
  );
};
