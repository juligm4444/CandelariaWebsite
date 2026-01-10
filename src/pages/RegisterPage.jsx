import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import axios from 'axios';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isAuthenticated, checkEmailAvailability } = useAuth();

  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name_en: '',
    name_es: '',
    team_id: '',
    career: '',
    role: '',
    charge: '',
    image_url: '',
  });
  const [errors, setErrors] = useState({});
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/teams/');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleEmailBlur = async () => {
    if (formData.email && formData.email.includes('@')) {
      setCheckingEmail(true);
      const status = await checkEmailAvailability(formData.email);
      setEmailStatus(status);
      setCheckingEmail(false);

      if (!status.is_allowed) {
        setErrors({ ...errors, email: 'This email is not authorized to register.' });
      } else if (status.is_taken) {
        setErrors({ ...errors, email: 'This email is already registered.' });
      }
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

    if (!formData.name_en) {
      newErrors.name_en = 'Name (English) is required';
    }

    if (!formData.name_es) {
      newErrors.name_es = 'Name (Spanish) is required';
    }

    if (!formData.team_id) {
      newErrors.team_id = 'Team is required';
    }

    if (emailStatus && !emailStatus.can_register) {
      newErrors.email = 'Email is not authorized or already taken';
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

    // Prepare data (remove confirmPassword)
    const { confirmPassword, ...registrationData } = formData;

    // Convert team_id to number
    registrationData.team_id = parseInt(registrationData.team_id);

    const result = await register(registrationData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: result.error });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('register.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('register.haveAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-[#FFB800] hover:text-[#FFA500] dark:text-[#FFB800] dark:hover:text-[#FFA500]"
              >
                {t('register.loginLink')}
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-400">
                  {typeof errors.general === 'object'
                    ? JSON.stringify(errors.general)
                    : errors.general}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Email */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.email')} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
                {checkingEmail && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Checking email...</p>
                )}
                {emailStatus && emailStatus.can_register && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    ✓ Email is available
                  </p>
                )}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.password')} *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.confirmPassword')} *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Name English */}
              <div>
                <label
                  htmlFor="name_en"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.nameEn')} *
                </label>
                <input
                  id="name_en"
                  name="name_en"
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
                {errors.name_en && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name_en}</p>
                )}
              </div>

              {/* Name Spanish */}
              <div>
                <label
                  htmlFor="name_es"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.nameEs')} *
                </label>
                <input
                  id="name_es"
                  name="name_es"
                  type="text"
                  required
                  value={formData.name_es}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
                {errors.name_es && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name_es}</p>
                )}
              </div>

              {/* Team */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="team_id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.team')} *
                </label>
                <select
                  id="team_id"
                  name="team_id"
                  required
                  value={formData.team_id}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                >
                  <option value="">{t('register.selectTeam')}</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name_en}
                    </option>
                  ))}
                </select>
                {errors.team_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.team_id}</p>
                )}
              </div>

              {/* Career */}
              <div>
                <label
                  htmlFor="career"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.career')}
                </label>
                <input
                  id="career"
                  name="career"
                  type="text"
                  value={formData.career}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.role')}
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
              </div>

              {/* Charge */}
              <div>
                <label
                  htmlFor="charge"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.charge')}
                </label>
                <input
                  id="charge"
                  name="charge"
                  type="text"
                  value={formData.charge}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
              </div>

              {/* Image URL */}
              <div>
                <label
                  htmlFor="image_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('register.imageUrl')}
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-[#FFB800] focus:border-[#FFB800] bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || (emailStatus && !emailStatus.can_register)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FFB800] hover:bg-[#FFA500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('register.creating') : t('register.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
