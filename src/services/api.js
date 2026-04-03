import axios from 'axios';
import { API_URL } from '../lib/config';

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
  getAll: (lang = 'en', teamId = null, includeInactive = false) => {
    const params = { lang };
    if (teamId) params.team = teamId;
    if (includeInactive) params.include_inactive = true;
    return api.get('/members/', { params });
  },
  getById: (id, lang = 'en') => api.get(`/members/${id}/?lang=${lang}`),
  getSocialLinks: (id) => api.get(`/members/${id}/social-links/`),
  create: (data) => api.post('/members/', data),
  update: (id, data) => api.patch(`/members/${id}/`, data),
  delete: (id) => api.delete(`/members/${id}/`),
  invite: (email, role = 'members', confirm = true) =>
    api.post('/members/invite/', { email, role, confirm }),
  kick: (id, confirm = true) => api.post(`/members/${id}/kick/`, { confirm }),
  transferLeadership: (id, confirm = true) =>
    api.post(`/members/${id}/transfer_leadership/`, { confirm }),
  transferColeadership: (id, confirm = true) =>
    api.post(`/members/${id}/transfer_coleadership/`, { confirm }),
  setColeader: (id, is_coleader, confirm = true) =>
    api.post(`/members/${id}/set_coleader/`, { is_coleader, confirm }),
};

// Publications API
export const publicationsAPI = {
  getAll: (lang = 'en', teamId = null) => {
    const params = { lang };
    if (teamId) params.team = teamId;
    return api.get('/publications/', { params });
  },
  getBySlug: (slug, lang = 'en') => api.get(`/publications/${slug}/?lang=${lang}`),
  create: (data) => api.post('/publications/', data),
  update: (slug, data) => api.patch(`/publications/${slug}/`, data),
  delete: (slug) => api.delete(`/publications/${slug}/`),
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

// Payments API
export const paymentsAPI = {
  getConfig: () => api.get('/payments/config/'),
  createCheckoutSession: (data) => api.post('/payments/checkout-session/', data),
  createPayment: (data) => api.post('/payments/create-payment/', data),
};

export default api;
