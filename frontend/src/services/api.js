import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── JWT token interceptor ──────────────────────────────────────────────────
// Har bir so'rovga Authorization headerini qo'shadi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token refresh interceptor ──────────────────────────────────────────────
// 401 kelsa refresh token bilan yangi access token oladi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/token-log-in/refresh/`, {
            refresh,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original); // so'rovni qayta yuborish
        } catch {
          // Refresh ham ishlamadi — login sahifasiga yo'naltirish
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (username, password) => {
    const res = await axios.post(`${API_BASE}/token-log-in/`, { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return res;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },
  isLoggedIn: () => !!localStorage.getItem('access_token'),
};

// ── Certificates ───────────────────────────────────────────────────────────
export const certificatesApi = {
  getAll: (params = {}) => api.get('/certificates/', { params }),
  getOne: (id) => api.get(`/certificates/${id}/`),
  create: (data) => api.post('/certificates/', data),
  update: (id, data) => api.put(`/certificates/${id}/`, data),
  delete: (id) => api.delete(`/certificates/${id}/`),
  download: (id) => api.get(`/certificates/${id}/download/`, { responseType: 'blob' }),
  regenerate: (id) => api.post(`/certificates/${id}/regenerate/`),
  calculateEndDate: (startDate, durationDays) =>
    api.get('/certificates/calculate-end-date/', {
      params: { start_date: startDate, duration_days: durationDays },
    }),
};

// ── Templates ──────────────────────────────────────────────────────────────
export const templatesApi = {
  getAll: (params = {}) => api.get('/templates/', { params }),
  getOne: (id) => api.get(`/templates/${id}/`),
  create: (formData) =>
    api.post('/templates/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.patch(`/templates/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/templates/${id}/`),
};

// ── Specializations ────────────────────────────────────────────────────────
export const specializationsApi = {
  getAll: (params = {}) => api.get('/specializations/', { params }),
  getOne: (id) => api.get(`/specializations/${id}/`),
  create: (data) => api.post('/specializations/', data),
  update: (id, data) => api.put(`/specializations/${id}/`, data),
  delete: (id) => api.delete(`/specializations/${id}/`),
};

// ── Public verification (token shart emas) ─────────────────────────────────
export const verifyApi = {
  verify: (code) => axios.get(`${API_BASE}/certificates/verify/${code}/`),
};

export default api;
