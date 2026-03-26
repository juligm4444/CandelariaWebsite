import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    career_en: '',
    career_es: '',
    role_en: '',
    role_es: '',
    charge_en: '',
    charge_es: '',
  });
  
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const socialPlatforms = [
    { value: 'behance', label: 'Behance', icon: 'behance.svg' },
    { value: 'portfolio', label: 'Portfolio', icon: 'portfolio.svg' },
    { value: 'github', label: 'GitHub', icon: 'github.svg' },
    { value: 'instagram', label: 'Instagram', icon: 'instagram.svg' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin.svg' },
    { value: 'x', label: 'X (Twitter)', icon: 'x.svg' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        career_en: user.career_en || user.career || '',
        career_es: user.career_es || user.career || '',
        role_en: user.role_en || user.role || '',
        role_es: user.role_es || user.role || '',
        charge_en: user.charge_en || user.charge || '',
        charge_es: user.charge_es || user.charge || '',
      });
      
      if (user.image_url) {
        const imageUrl = user.image_url.startsWith('http') 
          ? user.image_url 
          : `http://localhost:8000${user.image_url}`;
        setImagePreview(imageUrl);
      }
      
      if (user.social_links && Array.isArray(user.social_links)) {
        setSocialLinks(user.social_links);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocialLink = () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      setMessage({ type: 'error', text: t('profile.socialLinkError') || 'Please select a platform and enter a URL' });
      return;
    }

    if (socialLinks.some(link => link.platform === newSocialLink.platform)) {
      setMessage({ type: 'error', text: t('profile.socialLinkExists') || 'You already have a link for this platform' });
      return;
    }

    setSocialLinks([...socialLinks, { ...newSocialLink, id: `temp-${Date.now()}` }]);
    setNewSocialLink({ platform: '', url: '' });
    setMessage({ type: '', text: '' });
  };

  const handleRemoveSocialLink = (linkId) => {
    setSocialLinks(socialLinks.filter(link => link.id !== linkId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      formDataToSend.append('social_links', JSON.stringify(socialLinks));

      const response = await fetch(`http://localhost:8000/api/members/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: t('profile.updateSuccess') || 'Profile updated successfully!' });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || t('profile.updateError') || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('profile.updateError') || 'An error occurred while updating profile' });
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

          {message.text && (
            <div className={`profile-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form className="profile-form" onSubmit={handleSubmit}>
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

            <div className="profile-section">
              <h2>{t('profile.personalInfo') || 'Personal Information'}</h2>
              
              <div className="form-single-column">
                <div className="form-group">
                  <label htmlFor="name">{t('profile.name') || 'Full Name'}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>{t('profile.email') || 'Email'}</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="form-input disabled"
                  />
                  <span className="field-hint">{t('profile.emailHint') || 'Email cannot be changed'}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>{t('profile.careerInfo') || 'Career Information'}</h2>
              
              <div className="form-single-column">
                <div className="form-group">
                  <label htmlFor="career_en">{t('profile.careerEn') || 'Career (English)'}</label>
                  <input
                    id="career_en"
                    name="career_en"
                    type="text"
                    value={formData.career_en}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="career_es">{t('profile.careerEs') || 'Career (Spanish)'}</label>
                  <input
                    id="career_es"
                    name="career_es"
                    type="text"
                    value={formData.career_es}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>{t('profile.roleInfo') || 'Role Information'}</h2>
              
              <div className="form-single-column">
                <div className="form-group">
                  <label htmlFor="role_en">{t('profile.roleEn') || 'Role (English)'}</label>
                  <input
                    id="role_en"
                    name="role_en"
                    type="text"
                    value={formData.role_en}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role_es">{t('profile.roleEs') || 'Role (Spanish)'}</label>
                  <input
                    id="role_es"
                    name="role_es"
                    type="text"
                    value={formData.role_es}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>{t('profile.chargeInfo') || 'Responsibilities'}</h2>
              
              <div className="form-single-column">
                <div className="form-group">
                  <label htmlFor="charge_en">{t('profile.chargeEn') || 'Charge (English)'}</label>
                  <input
                    id="charge_en"
                    name="charge_en"
                    type="text"
                    value={formData.charge_en}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="charge_es">{t('profile.chargeEs') || 'Charge (Spanish)'}</label>
                  <input
                    id="charge_es"
                    name="charge_es"
                    type="text"
                    value={formData.charge_es}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>{t('profile.socialLinks') || 'Social Media Links'}</h2>
              
              <div className="social-links-list">
                {socialLinks.map((link) => {
                  const platform = socialPlatforms.find(p => p.value === link.platform);
                  return (
                    <div key={link.id} className="social-link-item">
                      <div className="social-link-icon">
                        <img src={`/src/assets/icons/${platform?.icon}`} alt={platform?.label} />
                      </div>
                      <div className="social-link-info">
                        <span className="social-link-platform">{platform?.label}</span>
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
                  );
                })}
              </div>

              <div className="social-link-add-form">
                <div className="form-group">
                  <label htmlFor="platform">{t('profile.platform') || 'Platform'}</label>
                  <select
                    id="platform"
                    value={newSocialLink.platform}
                    onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                    className="form-input"
                  >
                    <option value="">{t('profile.selectPlatform') || 'Select a platform'}</option>
                    {socialPlatforms.map(platform => (
                      <option 
                        key={platform.value} 
                        value={platform.value}
                        disabled={socialLinks.some(link => link.platform === platform.value)}
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
                    onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
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

            <div className="profile-actions">
              <button
                type="submit"
                disabled={loading}
                className="profile-save-button"
              >
                {loading ? (t('profile.saving') || 'Saving...') : (t('profile.save') || 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="profile-logout-button"
              >
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
