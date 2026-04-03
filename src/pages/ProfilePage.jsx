import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CAREER_OPTIONS, getLocalizedCareerLabel } from '../lib/memberOptions';
import { API_URL } from '../lib/config';
import { resolveMediaUrl } from '../lib/media';

export const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isInternal } = useAuth();

  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    team_id: '',
    career_key: '',
    role: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const socialPlatforms = [
    { value: 'behance', label: 'Behance' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'github', label: 'GitHub' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'x', label: 'X (Twitter)' },
  ];

  const language = i18n.language === 'es' ? 'es' : 'en';

  const inferredCareerKey = useMemo(() => {
    if (!user) return '';
    if (user.career_key) return user.career_key;

    const currentCareer =
      (language === 'es' ? user.career_es : user.career_en) || user.career || '';
    const match = CAREER_OPTIONS.find(
      (item) =>
        item.en.toLowerCase() === currentCareer.toLowerCase() ||
        item.es.toLowerCase() === currentCareer.toLowerCase()
    );
    return match?.key || '';
  }, [language, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadTeams = async () => {
      try {
        const response = await axios.get(`${API_URL}/teams/`);
        setTeams(response.data);
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };

    loadTeams();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      full_name: user.name || '',
      team_id: user.team_id ? String(user.team_id) : '',
      career_key: inferredCareerKey,
      role: language === 'es' ? user.role_es || user.role || '' : user.role_en || user.role || '',
    });

    if (user.image) {
      const imageUrl = resolveMediaUrl(user.image);
      setImagePreview(imageUrl);
    }

    if (Array.isArray(user.social_links)) {
      setSocialLinks(user.social_links);
    }
  }, [inferredCareerKey, language, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      setMessage({
        type: 'error',
        text: t('profile.socialLinkError') || 'Please select a platform and enter a URL',
      });
      return;
    }

    if (socialLinks.some((link) => link.platform === newSocialLink.platform)) {
      setMessage({
        type: 'error',
        text: t('profile.socialLinkExists') || 'You already have a link for this platform',
      });
      return;
    }

    setSocialLinks((prev) => [...prev, { ...newSocialLink, id: `temp-${Date.now()}` }]);
    setNewSocialLink({ platform: '', url: '' });
    setMessage({ type: '', text: '' });
  };

  const handleRemoveSocialLink = (linkId) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');

      if (!isInternal) {
        // External users only update name via UserProfile endpoint
        const response = await fetch(`${API_URL}/auth/me/update/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: formData.full_name }),
        });
        if (response.ok) {
          setMessage({
            type: 'success',
            text: t('profile.updateSuccess') || 'Profile updated successfully!',
          });
          setTimeout(() => window.location.reload(), 1200);
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: error.error || t('profile.updateError') || 'Failed to update profile' });
        }
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('team', formData.team_id);
      formDataToSend.append('career_key', formData.career_key);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('language', language);

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      formDataToSend.append('social_links', JSON.stringify(socialLinks));

      const response = await fetch(`${API_URL}/members/${user.id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: t('profile.updateSuccess') || 'Profile updated successfully!',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || t('profile.updateError') || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: t('profile.updateError') || 'An error occurred while updating profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h1>{t('profile.title') || 'My Profile'}</h1>
            <p>{t('profile.subtitle') || 'Manage your profile information'}</p>
          </div>

          {message.text && <div className={`profile-message ${message.type}`}>{message.text}</div>}

          <form className="profile-form" onSubmit={handleSubmit}>
            {isInternal && (
            <div className="profile-image-section">
              <div className="profile-image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt={user.name} />
                ) : (
                  <div className="profile-image-placeholder">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="profile-image-upload">
                <label htmlFor="image-upload" className="image-upload-button">
                  {t('profile.changePhoto') || 'Change Photo'}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                <p className="image-upload-hint">
                  {t('profile.photoHint') || 'JPG, PNG or GIF (max 5MB)'}
                </p>
              </div>
            </div>
            )}

            {!isInternal && (
            <div className="profile-image-section">
              <div className="profile-image-preview">
                <div className="profile-image-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="profile-external-badge">
                <span>{t('profile.externalSupporter') || 'External Supporter'}</span>
              </div>
            </div>
            )}

            <div className="form-single-column">
              <div className="form-group">
                <label htmlFor="full_name">{t('profile.name') || 'Full Name'}</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('profile.email') || 'Email'}</label>
                <input type="email" value={user.email} disabled className="form-input disabled" />
                <span className="field-hint">
                  {t('profile.emailHint') || 'Email cannot be changed'}
                </span>
              </div>

              {isInternal && (
              <>
              <div className="form-group">
                <label htmlFor="team_id">{t('profile.team') || 'Team'}</label>
                <select
                  id="team_id"
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">{t('profile.selectTeam') || 'Select a team'}</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {language === 'es' ? team.name_es : team.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="career_key">{t('profile.career') || 'Career'}</label>
                <select
                  id="career_key"
                  name="career_key"
                  value={formData.career_key}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">{t('profile.selectCareer') || 'Select a career'}</option>
                  {CAREER_OPTIONS.map((career) => (
                    <option key={career.key} value={career.key}>
                      {getLocalizedCareerLabel(career, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="role">{t('profile.role') || 'Role'}</label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="profile-section">
                <h2>{t('profile.socialLinks') || 'Social Media Links'}</h2>

                <div className="social-links-list">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="social-link-item">
                      <div className="social-link-info">
                        <span className="social-link-platform">{link.platform}</span>
                        <span className="social-link-url">{link.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(link.id)}
                        className="social-link-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="social-link-add-form">
                  <div className="form-group">
                    <label htmlFor="platform">{t('profile.platform') || 'Platform'}</label>
                    <select
                      id="platform"
                      value={newSocialLink.platform}
                      onChange={(e) =>
                        setNewSocialLink((prev) => ({ ...prev, platform: e.target.value }))
                      }
                      className="form-input"
                    >
                      <option value="">{t('profile.selectPlatform') || 'Select a platform'}</option>
                      {socialPlatforms.map((platform) => (
                        <option
                          key={platform.value}
                          value={platform.value}
                          disabled={socialLinks.some((link) => link.platform === platform.value)}
                        >
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="url">{t('profile.url') || 'URL'}</label>
                    <input
                      id="url"
                      type="url"
                      placeholder="https://..."
                      value={newSocialLink.url}
                      onChange={(e) =>
                        setNewSocialLink((prev) => ({ ...prev, url: e.target.value }))
                      }
                      className="form-input"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="social-link-add-button"
                  >
                    {t('profile.addSocialLink') || '+ Add Link'}
                  </button>
                </div>
              </div>
              </>)}
            </div>

            <div className="profile-actions">
              <button type="submit" disabled={loading} className="profile-save-button">
                {loading ? t('profile.saving') || 'Saving...' : t('profile.save') || 'Save Changes'}
              </button>
              <button type="button" onClick={handleLogout} className="profile-logout-button">
                {t('profile.logout') || 'Logout'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
