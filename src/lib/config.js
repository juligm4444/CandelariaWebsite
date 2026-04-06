const fallbackApiOrigin = import.meta.env.PROD ? window.location.origin : 'http://localhost:8000';
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || fallbackApiOrigin).replace(/\/$/, '');
const API_URL = `${API_ORIGIN}/api`;

export { API_ORIGIN, API_URL };
