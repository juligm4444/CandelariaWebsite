import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { k: 'home', href: '/', isRoute: true },
  { k: 'lines', href: '#lines' },
  { k: 'publications', href: '#publications' },
  { k: 'projects', href: '#projects' },
  { k: 'teams', href: '/team', isRoute: true },
  { k: 'contact', href: '#contact' },
];

export const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isTeamLeader, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all ${
        scrolled ? 'bg-background/80 backdrop-blur border-b border-border' : ''
      }`}
      style={{ height: '5.5rem' }} // Increased height
    >
      <div className="container flex items-center justify-between py-6" /* Increased py */>
        <img src="src/assets/images/MainLogo.png" alt="Logo" className="h-50 w-50 mr-3" />

        <div className="hidden md:flex gap-6 items-center">
          {links.map((l, idx) =>
            l.isRoute ? (
              <Link key={l.k} to={l.href} className="text-sm hover:text-primary transition">
                {t(`navbar.${l.k}`)}
              </Link>
            ) : (
              <a key={l.k} href={l.href} className="text-sm hover:text-primary transition">
                {t(`navbar.${l.k}`)}
              </a>
            )
          )}
          <LanguageToggle />
          <ThemeToggle />

          {/* Authentication Buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <User size={16} />
                {user?.name_en?.split(' ')[0] || 'User'}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name_en}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    {isTeamLeader && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                        Team Leader
                      </span>
                    )}
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6">
          {links.map((l, idx) =>
            l.isRoute ? (
              <Link
                key={l.k}
                to={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border pb-2"
              >
                {t(`navbar.${l.k}`)}
              </Link>
            ) : (
              <a
                key={l.k}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border pb-2"
              >
                {t(`navbar.${l.k}`)}
              </a>
            )
          )}

          {/* Mobile Authentication */}
          {isAuthenticated ? (
            <div className="border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-3 mb-3">
                <User size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name_en}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2 mb-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate('/');
                }}
                className="block w-full text-center px-4 py-2 text-sm font-medium rounded-md text-red-600 border border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t border-border pt-4 mt-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          <div className="flex gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};
