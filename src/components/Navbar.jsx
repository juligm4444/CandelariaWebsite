import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLogo from '../assets/images/MainLogo.png';

export const Navbar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="w-full bg-gray-100 border-b border-black px-8 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo - stays on left */}
        <div className="flex items-center">
          <img 
            src={MainLogo} 
            alt="Candelaria Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        
        {/* All other elements aligned to the right */}
        <div className="flex items-center space-x-8">
          {/* Navigation Links */}
          <Link to="/" className="text-black text-base font-medium hover:text-gray-600 transition-colors">
            {t('navbar.home')}
          </Link>
          <Link to="/team" className="text-black text-base font-medium hover:text-gray-600 transition-colors">
            {t('navbar.teams')}
          </Link>
          <a href="#publications" className="text-black text-base font-medium hover:text-gray-600 transition-colors">
            {t('navbar.publications')}
          </a>
          <a href="#about" className="text-black text-base font-medium hover:text-gray-600 transition-colors">
            {t('navbar.about')}
          </a>
          
          {/* Controls */}
          <button 
            onClick={toggleLanguage}
            className="border border-black px-2 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {i18n.language === 'en' ? 'EN' : 'ES'}
          </button>
          
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <svg width="18" height="17" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 19L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="black"/>
            </svg>
          </button>
          
          <button className="border border-black px-3 py-1 rounded-lg text-black text-sm font-medium hover:bg-gray-200 transition-colors">
            {t('navbar.login')}
          </button>
        </div>
      </div>
    </nav>
  );
};
