import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

// Auto-attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Complaint APIs ─────────────────────────────────────────────────────────

export const submitComplaint = (data)       => api.post('/complaints/', data);
export const getComplaints   = (params)     => api.get('/complaints/', { params });
export const getComplaint    = (id)         => api.get(`/complaints/${id}`);
export const withdrawComplaint = (id)       => api.delete(`/complaints/${id}`);

// ── Admin APIs ─────────────────────────────────────────────────────────────

export const getDashboard     = ()               => api.get('/admin/dashboard');
export const updateStatus     = (id, status)     => api.put(`/admin/complaints/${id}/status`, { status });
export const assignComplaint  = (id, department) => api.put(`/admin/complaints/${id}/assign`, { department });
export const respondComplaint = (id, response)   => api.post(`/admin/complaints/${id}/response`, { response });

// ── Analytics APIs ─────────────────────────────────────────────────────────

export const getCategories    = () => api.get('/analytics/categories');
export const getSentiment     = () => api.get('/analytics/sentiment');
export const getPriority      = () => api.get('/analytics/priority');
export const getTrends        = () => api.get('/analytics/trends');
export const getResolution    = () => api.get('/analytics/resolution');
export const getDepartments   = () => api.get('/analytics/departments');

// ── NLP Debug ─────────────────────────────────────────────────────────────

export const analyzeText = (text, title = '') => api.post('/nlp/analyze', { text, title });

export default api;
