import axios from 'axios';
import { API_URL } from '../lib/config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicRequest = { requiresAuth: false };

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  const headers = { ...(nextConfig.headers || {}) };

  if (nextConfig.requiresAuth === false) {
    delete headers.Authorization;
  } else {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete headers.Authorization;
    }
  }

  if (typeof FormData !== 'undefined' && nextConfig.data instanceof FormData) {
    delete headers['Content-Type'];
  }

  nextConfig.headers = headers;
  return nextConfig;
});

let _isRefreshing = false;
let _refreshQueue = [];

const _drainQueue = (error, token) => {
  _refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  _refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
        return api(original);
      });
    }

    original._retried = true;
    _isRefreshing = true;

    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

    if (!refreshToken) {
      _isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
      const newAccess = data.access;
      localStorage.setItem('access_token', newAccess);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      _drainQueue(null, newAccess);
      _isRefreshing = false;
      original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newAccess}` };
      return api(original);
    } catch (refreshError) {
      _drainQueue(refreshError, null);
      _isRefreshing = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// Teams API
export const teamsAPI = {
  getAll: (lang = 'en') => api.get(`/teams/?lang=${lang}`, publicRequest),
  getById: (id, lang = 'en') => api.get(`/teams/${id}/?lang=${lang}`, publicRequest),
  getMembers: (id, lang = 'en') => api.get(`/teams/${id}/members/?lang=${lang}`, publicRequest),
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
    return api.get('/members/', { params, requiresAuth: false });
  },
  getById: (id, lang = 'en') => api.get(`/members/${id}/?lang=${lang}`, publicRequest),
  getSocialLinks: (id) => api.get(`/members/${id}/social-links/`, publicRequest),
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
    return api.get('/publications/', { params, requiresAuth: false });
  },
  getBySlug: (slug, lang = 'en') => api.get(`/publications/${slug}/?lang=${lang}`, publicRequest),
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
    return api.get('/social-links/', { params, requiresAuth: false });
  },
  getById: (id) => api.get(`/social-links/${id}/`, publicRequest),
  create: (data) => api.post('/social-links/', data),
  update: (id, data) => api.put(`/social-links/${id}/`, data),
  delete: (id) => api.delete(`/social-links/${id}/`),
};

// Payments API
export const paymentsAPI = {
  getConfig: () => api.get('/payments/config/', publicRequest),
  createCheckoutSession: (data) => api.post('/payments/checkout-session/', data),
  createPayment: (data) => api.post('/payments/create-payment/', data),
};

export default api;
