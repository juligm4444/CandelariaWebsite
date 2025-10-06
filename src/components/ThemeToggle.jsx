import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.documentElement.classList.add('light');
      setIsLight(true);
    }
  }, []);
  const toggleTheme = () => {
    const next = isLight ? 'dark' : 'light';
    document.documentElement.classList.toggle('light', next === 'light');
    localStorage.setItem('theme', next);
    setIsLight(next === 'light');
  };
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn('p-2 rounded-full hover:bg-primary/10 transition-colors')}
    >
      {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
};