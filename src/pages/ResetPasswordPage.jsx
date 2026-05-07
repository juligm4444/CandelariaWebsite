import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidLink = Boolean(uid && token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

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

            {!isValidLink && (
              <div className="login-error">
                <p>{t('resetPasswordPage.invalidLink')}</p>
              </div>
            )}

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

            {isValidLink && !message && (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="new-password">{t('resetPasswordPage.newPassword')}</label>
                  <div className="input-wrapper">
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="input-toggle"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">{t('resetPasswordPage.confirmPassword')}</label>
                  <div className="input-wrapper">
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="input-toggle"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-button">
                  {loading ? t('resetPasswordPage.updating') : t('resetPasswordPage.updateButton')}
                </button>
              </form>
            )}

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
