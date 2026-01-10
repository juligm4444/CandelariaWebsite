import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { AboutSection } from '../components/AboutSection';
import { Team } from '../components/Team';
import { SupportUs } from '../components/SupportUs';
import { Register } from '../components/Register';
import { useTranslation } from 'react-i18next';

export const HomePage = () => {
  const { t } = useTranslation();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <Team />
        <SupportUs />
        <Register />
      </main>
      <footer className="bg-gray-100 border-t-2 border-black py-4 px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <p className="text-black text-lg">All rights Reserved to Candelaria</p>
          <button 
            onClick={scrollToTop}
            className="bg-white border border-black p-3 rounded-full hover:bg-gray-200 transition-colors"
            title="Back to top"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rotate-180">
              <path d="M12 16L16 12H8L12 16Z" fill="black"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};
