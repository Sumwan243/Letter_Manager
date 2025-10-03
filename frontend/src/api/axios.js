import axios from 'axios';

const api = axios.create({
  // Use env-based base URL for production, fallback to same-origin for dev
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach Bearer token from localStorage and log requests (dev only)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only log in development to avoid leaking tokens
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: { ...config.headers, Authorization: token ? 'Bearer [REDACTED]' : undefined },
        data: config.data
      });
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        response: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export default api;
