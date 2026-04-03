import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setMessage(result.message || t('forgotPasswordPage.sentMessage'));
    } else {
      setError(result.error || t('forgotPasswordPage.sendError'));
    }

    setLoading(false);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>{t('forgotPasswordPage.title')}</h1>
              <p>{t('forgotPasswordPage.subtitle')}</p>
            </div>

            {message && (
              <div className="profile-message success" style={{ marginBottom: '1rem' }}>
                {message}
              </div>
            )}

            {error && (
              <div className="login-error">
                <p>{error}</p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="login-button">
                {loading ? t('forgotPasswordPage.sending') : t('forgotPasswordPage.sendButton')}
              </button>
            </form>

            <div className="login-footer">
              <Link to="/login" className="back-home-link">
                {t('forgotPasswordPage.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
