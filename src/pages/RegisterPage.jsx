import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { CAREER_OPTIONS, getLocalizedCareerLabel } from '../lib/memberOptions';
import { API_URL } from '../lib/config';
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register, isAuthenticated, checkEmailAvailability } = useAuth();

  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    team_id: '',
    career_key: '',
    role: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await axios.get(`${API_URL}/teams/`);
        setTeams(response.data);
      } catch {
        // Teams failed to load — fields will be hidden for non-whitelisted users anyway
      }
    };
    loadTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file || null);
    if (!file) {
      setImagePreview('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result?.toString() || '');
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes('@')) return;

    setCheckingEmail(true);
    const status = await checkEmailAvailability(formData.email);
    setEmailStatus(status);
    setCheckingEmail(false);

    if (status?.can_edit_role === false) {
      const fixedRole = status.whitelist_role === 'leaders' ? 'Team Leader' : 'Co-Leader';
      setFormData((prev) => ({ ...prev, role: fixedRole }));
    }

    if (status?.is_team_leader_whitelist) {
      setFormData((prev) => ({
        ...prev,
        team_id: status.whitelist_team_id ? String(status.whitelist_team_id) : '',
        career_key: 'design',
        role: 'Team Leader',
      }));
    }

    if (status?.is_taken) {
      setErrors((prev) => ({ ...prev, email: t('register.emailTaken', 'This email is already registered.') }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('register.emailRequired', 'Email is required');
    } else if (!formData.email.includes('@')) {
      newErrors.email = t('register.emailInvalid', 'Invalid email format');
    }

    if (!formData.password) {
      newErrors.password = t('register.passwordRequired', 'Password is required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.passwordLength', 'Password must be at least 8 characters');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordMatch', 'Passwords do not match');
    }

    if (!formData.full_name) {
      newErrors.full_name = t('register.nameRequired', 'Full name is required');
    }

    const isWhitelistedInternal = !!emailStatus?.is_whitelisted;
    const isTeamLeaderFromWhitelist = !!emailStatus?.is_team_leader_whitelist;

    if (isWhitelistedInternal && !isTeamLeaderFromWhitelist) {
      if (!formData.team_id) newErrors.team_id = t('register.teamRequired', 'Team is required');
      if (!formData.career_key) newErrors.career_key = t('register.careerRequired', 'Career is required');
      if (!formData.role.trim()) newErrors.role = t('register.roleRequired', 'Role is required');
      if (!profileImage) newErrors.image = t('register.imageRequired', 'Profile picture is required');
    }

    if (emailStatus?.is_taken) {
      newErrors.email = t('register.emailTaken', 'This email is already registered');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = new FormData();
    payload.append('full_name', formData.full_name);
    payload.append('email', formData.email);
    payload.append('password', formData.password);

    if (emailStatus?.is_whitelisted) {
      payload.append('team_id', String(parseInt(formData.team_id, 10)));
      payload.append('career_key', formData.career_key);
      payload.append('role', formData.role);
      payload.append('language', i18n.language === 'es' ? 'es' : 'en');
      if (profileImage) payload.append('image', profileImage);
    }

    const result = await register(payload);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ general: result.error });
      setLoading(false);
    }
  };

  const isWhitelisted = !!emailStatus?.is_whitelisted;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>{t('register.title')}</h1>
              <p>{t('register.subtitle')}</p>
            </div>

            {errors.general && (
              <div className="login-error">
                <p>
                  {typeof errors.general === 'object'
                    ? JSON.stringify(errors.general)
                    : errors.general}
                </p>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              {/* Full name */}
              <div className="form-group">
                <label htmlFor="full_name">{t('register.name')} *</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.full_name && <p className="login-inline-error">{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">{t('register.email')} *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className="form-input"
                />
                <div className="email-status">
                  {checkingEmail && (
                    <span className="email-status-checking">
                      <Loader size={13} className="spin-icon" />
                      {t('register.checkingEmail', 'Checking...')}
                    </span>
                  )}
                  {!checkingEmail && emailStatus && emailStatus.can_register && !emailStatus.is_taken && (
                    <span className="email-status-ok">
                      <CheckCircle size={13} />
                      {t('register.emailAvailable', 'Available')}
                    </span>
                  )}
                </div>
                {errors.email && <p className="login-inline-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">{t('register.password')} *</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                {errors.password && <p className="login-inline-error">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('register.confirmPassword')} *</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="login-inline-error">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Internal member fields (whitelisted only) */}
              {isWhitelisted ? (
                <>
                  <div className="register-internal-badge">
                    <CheckCircle size={14} />
                    {t('register.internalMember', 'Internal member — complete your profile below')}
                  </div>

                  <div className="form-group">
                    <label htmlFor="team_id">
                      {t('register.team')} *
                      {emailStatus?.is_team_leader_whitelist && (
                        <span className="field-hint" style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                          (auto-filled from whitelist)
                        </span>
                      )}
                    </label>
                    <select
                      id="team_id"
                      name="team_id"
                      required
                      value={formData.team_id}
                      onChange={handleChange}
                      className="form-input"
                      disabled={emailStatus?.is_team_leader_whitelist}
                    >
                      <option value="">{t('register.selectTeam')}</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {i18n.language === 'es' ? team.name_es : team.name_en}
                        </option>
                      ))}
                    </select>
                    {errors.team_id && <p className="login-inline-error">{errors.team_id}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="career_key">
                      {t('register.career')} *
                      {emailStatus?.is_team_leader_whitelist && (
                        <span className="field-hint" style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                          (auto-filled)
                        </span>
                      )}
                    </label>
                    <select
                      id="career_key"
                      name="career_key"
                      required
                      value={formData.career_key}
                      onChange={handleChange}
                      className="form-input"
                      disabled={emailStatus?.is_team_leader_whitelist}
                    >
                      <option value="">{t('register.selectCareer')}</option>
                      {CAREER_OPTIONS.map((career) => (
                        <option key={career.key} value={career.key}>
                          {getLocalizedCareerLabel(career, i18n.language)}
                        </option>
                      ))}
                    </select>
                    {errors.career_key && (
                      <p className="login-inline-error">{errors.career_key}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">
                      {t('register.role')} *
                      {emailStatus?.is_team_leader_whitelist && (
                        <span className="field-hint" style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                          (auto-filled from whitelist)
                        </span>
                      )}
                    </label>
                    <input
                      id="role"
                      name="role"
                      type="text"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="form-input"
                      disabled={emailStatus?.can_edit_role === false || emailStatus?.is_team_leader_whitelist}
                    />
                    {emailStatus?.can_edit_role === false && (
                      <p className="field-hint">
                        {t('register.roleFixed', 'Role assigned by whitelist')}
                      </p>
                    )}
                    {errors.role && <p className="login-inline-error">{errors.role}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-image">
                      {t('register.profilePicture', 'Profile picture')}{' '}
                      {!emailStatus?.is_team_leader_whitelist ? '*' : t('register.profilePictureOptional', '(optional)')}
                    </label>
                    <div className="register-file-input-wrapper">
                      <label
                        htmlFor="profile-image"
                        className={`register-file-input-label${profileImage ? ' has-file' : ''}`}
                      >
                        <span>{profileImage ? profileImage.name : t('register.tapToChoosePhoto', 'Tap to choose a photo')}</span>
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!emailStatus?.is_team_leader_whitelist}
                        className="register-file-input-hidden"
                      />
                    </div>
                    {emailStatus?.is_team_leader_whitelist && (
                      <p className="field-hint">
                        {t('register.profilePictureHint', 'As a team leader, a profile picture is optional.')}
                      </p>
                    )}                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="register-image-preview"
                      />
                    )}
                    {errors.image && <p className="login-inline-error">{errors.image}</p>}
                  </div>
                </>
              ) : (
                emailStatus && !emailStatus.is_taken && (
                  <p className="register-external-note">
                    {t(
                      'register.externalNote',
                      'Your account will be created as an external supporter. Internal members must use their whitelisted email.'
                    )}
                  </p>
                )
              )}

              <button
                type="submit"
                disabled={loading || (emailStatus?.is_taken ?? false)}
                className="login-button"
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" />
                    {t('register.signingUp')}
                  </span>
                ) : (
                  t('register.signUp')
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                {t('register.hasAccount')}{' '}
                <Link to="/login" className="register-link">
                  {t('register.loginLink')}
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

export default RegisterPage;
