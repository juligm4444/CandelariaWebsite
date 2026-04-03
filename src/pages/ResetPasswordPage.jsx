import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();

  const uid = useMemo(() => searchParams.get('uid') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!uid || !token) {
      setError(t('resetPasswordPage.invalidLink'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('resetPasswordPage.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('resetPasswordPage.passwordMismatch'));
      return;
    }

    setLoading(true);
    const result = await resetPassword(uid, token, newPassword);
    setLoading(false);

    if (result.success) {
      setMessage(result.message || t('resetPasswordPage.successMessage'));
      setTimeout(() => navigate('/login'), 1800);
    } else {
      setError(result.error || t('resetPasswordPage.errorMessage'));
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>{t('resetPasswordPage.title')}</h1>
              <p>{t('resetPasswordPage.subtitle')}</p>
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
                <label htmlFor="new-password">{t('resetPasswordPage.newPassword')}</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">{t('resetPasswordPage.confirmPassword')}</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="login-button">
                {loading ? t('resetPasswordPage.updating') : t('resetPasswordPage.updateButton')}
              </button>
            </form>

            <div className="login-footer">
              <Link to="/login" className="back-home-link">
                {t('resetPasswordPage.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
