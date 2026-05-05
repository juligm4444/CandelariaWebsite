import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.errorCode || result.error);
      setLoading(false);
    }
  };

  const getLoginErrorMessage = (errorValue) => {
    if (!errorValue) return '';
    const translated = t(`login.errors.${errorValue}`, { defaultValue: '' });
    if (translated) return translated;
    return typeof errorValue === 'string' ? errorValue : t('login.errors.login_failed');
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>{t('login.title')}</h1>
              <p>{t('login.subtitle')}</p>
            </div>

            {error && (
              <div className="login-error">
                <p>{getLoginErrorMessage(error)}</p>
              </div>
            )}

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
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('login.passwordPlaceholder')}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" />
                    {t('login.signingIn')}
                  </span>
                ) : (
                  t('login.signIn')
                )}
              </button>
            </form>

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
