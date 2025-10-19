import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams API
export const teamsAPI = {
  getAll: (lang = 'en') => api.get(`/teams/?lang=${lang}`),
  getById: (id, lang = 'en') => api.get(`/teams/${id}/?lang=${lang}`),
  getMembers: (id, lang = 'en') => api.get(`/teams/${id}/members/?lang=${lang}`),
  create: (data) => api.post('/teams/', data),
  update: (id, data) => api.put(`/teams/${id}/`, data),
  delete: (id) => api.delete(`/teams/${id}/`),
};

// Members API
export const membersAPI = {
  getAll: (lang = 'en', teamId = null) => {
    const params = { lang };
    if (teamId) params.team = teamId;
    return api.get('/members/', { params });
  },
  getById: (id, lang = 'en') => api.get(`/members/${id}/?lang=${lang}`),
  getSocialLinks: (id) => api.get(`/members/${id}/social-links/`),
  create: (data) => api.post('/members/', data),
  update: (id, data) => api.put(`/members/${id}/`, data),
  delete: (id) => api.delete(`/members/${id}/`),
};

// Publications API
export const publicationsAPI = {
  getAll: (lang = 'en', teamId = null) => {
    const params = { lang };
    if (teamId) params.team = teamId;
    return api.get('/publications/', { params });
  },
  getById: (id, lang = 'en') => api.get(`/publications/${id}/?lang=${lang}`),
  create: (data) => api.post('/publications/', data),
  update: (id, data) => api.put(`/publications/${id}/`, data),
  delete: (id) => api.delete(`/publications/${id}/`),
};

// Admins API
export const adminsAPI = {
  getAll: () => api.get('/admins/'),
  getById: (id) => api.get(`/admins/${id}/`),
  create: (data) => api.post('/admins/', data),
  update: (id, data) => api.put(`/admins/${id}/`, data),
  delete: (id) => api.delete(`/admins/${id}/`),
};

// Social Media API
export const socialAPI = {
  getAll: (memberId = null) => {
    const params = memberId ? { member: memberId } : {};
    return api.get('/social-links/', { params });
  },
  getById: (id) => api.get(`/social-links/${id}/`),
  create: (data) => api.post('/social-links/', data),
  update: (id, data) => api.put(`/social-links/${id}/`, data),
  delete: (id) => api.delete(`/social-links/${id}/`),
};

export default api;
