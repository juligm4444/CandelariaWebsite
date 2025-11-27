import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, isTeamLeader } = useAuth();
  const [publications, setPublications] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title_en: '',
    title_es: '',
    description_en: '',
    description_es: '',
    publication_url: '',
    team_id: user?.team_id || '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user's publications
      const pubResponse = await axios.get(
        `http://localhost:8000/api/publications/?team=${user.team_id}`
      );
      setPublications(pubResponse.data);

      // Load team members if user is team leader
      if (isTeamLeader) {
        const membersResponse = await axios.get(
          `http://localhost:8000/api/members/?team=${user.team_id}`
        );
        setTeamMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmitPublication = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const response = await axios.post('http://localhost:8000/api/publications/', {
        ...formData,
        team_id: user.team_id,
      });

      setSuccessMessage('Publication created successfully!');
      setShowPublicationForm(false);
      setFormData({
        title_en: '',
        title_es: '',
        description_en: '',
        description_es: '',
        publication_url: '',
        team_id: user.team_id,
      });
      loadData(); // Reload publications

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to create publication');
    }
  };

  const handleDeletePublication = async (pubId) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/publications/${pubId}/`);
      setSuccessMessage('Publication deleted successfully!');
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete publication:', error);
      alert('Failed to delete publication. You may not have permission.');
    }
  };

  const handleToggleMemberStatus = async (memberId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/members/${memberId}/`, {
        is_active: !currentStatus,
      });
      setSuccessMessage('Member status updated!');
      loadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update member:', error);
      alert('Failed to update member status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome', 'Welcome')}, {user?.name_en}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isTeamLeader && (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Team Leader
              </span>
            )}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-green-800 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Publications Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.publications', 'Team Publications')}
            </h2>
            <button
              onClick={() => setShowPublicationForm(!showPublicationForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showPublicationForm ? 'Cancel' : '+ New Publication'}
            </button>
          </div>

          {/* Publication Form */}
          {showPublicationForm && (
            <form
              onSubmit={handleSubmitPublication}
              className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              {formError && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm text-red-800 dark:text-red-400">{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    name="title_en"
                    required
                    value={formData.title_en}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title (Spanish) *
                  </label>
                  <input
                    type="text"
                    name="title_es"
                    required
                    value={formData.title_es}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (English) *
                  </label>
                  <textarea
                    name="description_en"
                    required
                    rows="3"
                    value={formData.description_en}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (Spanish) *
                  </label>
                  <textarea
                    name="description_es"
                    required
                    rows="3"
                    value={formData.description_es}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publication URL *
                  </label>
                  <input
                    type="url"
                    name="publication_url"
                    required
                    value={formData.publication_url}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Publication
                </button>
              </div>
            </form>
          )}

          {/* Publications List */}
          <div className="space-y-4">
            {publications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No publications yet.</p>
            ) : (
              publications.map((pub) => (
                <div key={pub.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pub.title_en}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pub.description_en}
                      </p>
                      <a
                        href={pub.publication_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 text-sm mt-2 inline-block"
                      >
                        View Publication →
                      </a>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Author: {pub.author_name || 'Unknown'}
                      </p>
                    </div>
                    {(isTeamLeader || pub.author_id === user?.id) && (
                      <button
                        onClick={() => handleDeletePublication(pub.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Members Section (Team Leaders Only) */}
        {isTeamLeader && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Team Members Management
            </h2>

            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No team members found.</p>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="border dark:border-gray-700 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.name_en}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.role} • {member.career}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          member.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {member.id !== user.id && (
                      <button
                        onClick={() => handleToggleMemberStatus(member.id, member.is_active)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
