import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { CAREER_OPTIONS, getLocalizedCareerLabel } from '../lib/memberOptions';
import { API_URL } from '../lib/config';

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await axios.get(`${API_URL}/teams/`);
        setTeams(response.data);
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };

    loadTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
    if (!formData.email || !formData.email.includes('@')) {
      return;
    }

    setCheckingEmail(true);
    const status = await checkEmailAvailability(formData.email);
    setEmailStatus(status);
    setCheckingEmail(false);

    if (status?.can_edit_role === false) {
      const fixedRole = status.whitelist_role === 'leaders' ? 'Team Leader' : 'Co-Leader';
      setFormData((prev) => ({ ...prev, role: fixedRole }));
    }

    // Auto-fill team and career for team leaders from whitelist
    if (status?.is_team_leader_whitelist) {
      setFormData((prev) => ({ 
        ...prev, 
        team_id: status.whitelist_team_id ? String(status.whitelist_team_id) : '',
        career_key: 'design', // Default career for team leaders
        role: 'Team Leader'
      }));
    }

    if (status.is_taken) {
      setErrors((prev) => ({ ...prev, email: 'This email is already registered.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    const isWhitelistedInternal = !!emailStatus?.is_whitelisted;
    const isTeamLeaderFromWhitelist = !!emailStatus?.is_team_leader_whitelist;

    if (isWhitelistedInternal && !isTeamLeaderFromWhitelist) {
      if (!formData.team_id) {
        newErrors.team_id = 'Team is required';
      }

      if (!formData.career_key) {
        newErrors.career_key = 'Career is required';
      }

      if (!formData.role.trim()) {
        newErrors.role = 'Role is required';
      }

      if (!profileImage) {
        newErrors.image = 'Profile picture is required';
      }
    }

    if (emailStatus && emailStatus.is_taken) {
      newErrors.email = 'This email is already registered';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append('full_name', formData.full_name);
    payload.append('email', formData.email);
    payload.append('password', formData.password);
    const isWhitelistedInternal = !!emailStatus?.is_whitelisted;
    if (isWhitelistedInternal) {
      payload.append('team_id', String(parseInt(formData.team_id, 10)));
      payload.append('career_key', formData.career_key);
      payload.append('role', formData.role);
      payload.append('language', i18n.language === 'es' ? 'es' : 'en');
      if (profileImage) {
        payload.append('image', profileImage);
      }
    }

    const result = await register(payload);

    if (result.success) {
      navigate('/');
    } else {
      setErrors({ general: result.error });
      setLoading(false);
    }
  };

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
                {checkingEmail && <p className="field-hint">Checking email...</p>}
                {emailStatus && emailStatus.can_register && (
                  <p className="field-hint">Email is available</p>
                )}
                {errors.email && <p className="login-inline-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('register.password')} *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.password && <p className="login-inline-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">{t('register.confirmPassword')} *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.confirmPassword && (
                  <p className="login-inline-error">{errors.confirmPassword}</p>
                )}
              </div>

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

              {emailStatus?.is_whitelisted ? (
                <>
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
                    {errors.career_key && <p className="login-inline-error">{errors.career_key}</p>}
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
                      <p className="field-hint">Role is fixed by whitelist for this email.</p>
                    )}
                    {errors.role && <p className="login-inline-error">{errors.role}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-image">
                      Profile picture {!emailStatus?.is_team_leader_whitelist ? '*' : '(optional for team leaders)'}
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!emailStatus?.is_team_leader_whitelist}
                      className="form-input"
                    />
                    {emailStatus?.is_team_leader_whitelist && (
                      <p className="field-hint">
                        As a team leader from the whitelist, a profile picture is optional.
                      </p>
                    )}
                    {imagePreview && (
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
                <p className="field-hint">
                  This email is not in the internal whitelist. Your account will be created as an
                  external supporter.
                </p>
              )}

              <button
                type="submit"
                disabled={loading || (emailStatus && emailStatus.is_taken)}
                className="login-button"
              >
                {loading ? t('register.signingUp') : t('register.signUp')}
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
