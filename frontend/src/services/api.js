import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Certificates
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

// Templates
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

// Specializations
export const specializationsApi = {
  getAll: (params = {}) => api.get('/specializations/', { params }),
  getOne: (id) => api.get(`/specializations/${id}/`),
  create: (data) => api.post('/specializations/', data),
  update: (id, data) => api.put(`/specializations/${id}/`, data),
  delete: (id) => api.delete(`/specializations/${id}/`),
};

// Public verification (no auth needed)
export const verifyApi = {
  verify: (code) => api.get(`/verify/${code}/`),
};

export default api;