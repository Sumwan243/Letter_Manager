import api from './axios';

// User registration
export const register = (userData) => api.post('/auth/register', userData);

// User login
export const login = (credentials) => api.post('/auth/login', credentials);

// User logout
export const logout = () => api.post('/auth/logout');

// Get current authenticated user
export const getCurrentUser = () => api.get('/auth/user');

// Refresh authentication token
export const refreshToken = () => api.post('/auth/refresh');

// Check if user is authenticated
export const checkAuth = () => api.get('/auth/check');

// Update user profile
export const updateProfile = (userData) => api.put('/auth/profile', userData);

// Change password
export const changePassword = (passwordData) => api.put('/auth/password', passwordData);

// Forgot password
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// Reset password
export const resetPassword = (resetData) => api.post('/auth/reset-password', resetData);






