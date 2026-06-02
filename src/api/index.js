import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Admin
export const adminCheck = () => api.get('/api/admin/check');
export const adminSetup = (password) => api.post('/api/admin/setup', { password });
export const adminLogin = (password) => api.post('/api/admin/login', { password });
export const getStats = () => api.get('/api/admin/stats');
export const changePassword = (current_password, new_password) =>
  api.post('/api/admin/change-password', { current_password, new_password });
export const getParticipants = () => api.get('/api/admin/participants');
export const createParticipant = (data) => api.post('/api/admin/participants', data);
export const updateParticipant = (id, data) => api.put(`/api/admin/participants/${id}`, data);
export const deleteParticipant = (id) => api.delete(`/api/admin/participants/${id}`);
export const getSettings = () => api.get('/api/admin/settings');
export const updateSettings = (data) => api.put('/api/admin/settings', data);
export const getActivity = () => api.get('/api/admin/activity');
export const getTransactions = () => api.get('/api/admin/transactions');

// Participant
export const getParticipantData = (token) => api.get(`/api/participant/${token}`);

// Boost
export const initiateBoost = (token, boost_type) =>
  api.post('/api/boost/initiate', { token, boost_type });
export const verifyBoost = (reference) => api.post('/api/boost/verify', { reference });
