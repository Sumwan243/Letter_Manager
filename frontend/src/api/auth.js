import api from './axios';

// Auth endpoints (backend prefixes these under /api/auth for login/register)
export const register = (userData) => api.post('/api/auth/register', userData);
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const logout = () => api.post('/api/logout');
export const getCurrentUser = () => api.get('/api/user');

// Profile management (matches backend routes)
export const updateProfile = (userData) => api.post('/api/profile', userData);

// Password/auth utilities (to be implemented on backend)
export const changePassword = (passwordData) => api.put('/api/password', passwordData);
export const forgotPassword = (email) => api.post('/api/forgot-password', { email });
export const resetPassword = (resetData) => api.post('/api/reset-password', resetData);






