import api from './axios';

// Sanctum CSRF cookie
export const getCsrf = () => api.get('/sanctum/csrf-cookie');

// Auth endpoints (backend prefixes these under /api/auth for login/register)
export const register = (userData) => api.post('/api/auth/register', userData);
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const logout = () => api.post('/api/logout');
export const getCurrentUser = () => api.get('/api/user');

// Optional utilities (adjust if implemented on backend)
export const updateProfile = (userData) => api.put('/api/auth/profile', userData);
export const changePassword = (passwordData) => api.put('/api/auth/password', passwordData);
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPassword = (resetData) => api.post('/api/auth/reset-password', resetData);






