import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated (only after auth check is complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            {/* Header */}
            <div className="login-header">
              <h1>{t('login.title')}</h1>
              <p>{t('login.subtitle')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error">
                <p>
                  {typeof error === 'string'
                    ? error
                    : 'Login failed. Please check your credentials.'}
                </p>
              </div>
            )}

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">{t('login.email')}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('login.emailPlaceholder')}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('login.password')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('login.passwordPlaceholder')}
                  className="form-input"
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>{t('login.rememberMe')}</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <button type="submit" disabled={loading} className="login-button">
                {loading ? t('login.signingIn') : t('login.signIn')}
              </button>
            </form>

            {/* Footer */}
            <div className="login-footer">
              <p>
                {t('login.noAccount')}{' '}
                <Link to="/register" className="register-link">
                  {t('login.registerLink')}
                </Link>
              </p>
              <Link to="/" className="back-home-link">
                ← {t('login.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
