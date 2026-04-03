const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:8000').replace(/\/$/, '');
const API_URL = `${API_ORIGIN}/api`;

export { API_ORIGIN, API_URL };
