// frontend/src/services/api.js
import axios from 'axios';

// Determine API base URL based on environment
const API_BASE_URL = (() => {
  // Explicitly set via environment variable (for Docker builds)
  if (process.env.REACT_APP_API_URL) {
    // If it's a full URL, use as-is
    if (process.env.REACT_APP_API_URL.includes('://')) {
      return process.env.REACT_APP_API_URL;
    }
    // Otherwise assume it's a path and prepend origin
    return window.location.origin + process.env.REACT_APP_API_URL;
  }
  
  // Smart detection: if frontend is on port 3001 (Docker host binding)
  // then backend should be on 5001 (Docker host binding)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Replace port with 5001 (backend port)
    return `http://${window.location.hostname}:5001/api`;
  }
  
  // Fallback: use relative path
  return '/api';
})();

// Log the configured API URL for debugging
console.log('[API] Configured API_BASE_URL:', API_BASE_URL);
console.log('[API] Window origin:', window.location.origin);
console.log('[API] Hostname:', window.location.hostname);

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // Changed to false to avoid CORS issues with localhost
});

// Attach JWT token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Handle 401 - clear token and redirect to login
instance.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('[API] Response error details:');
    console.error('  - Status:', error.response?.status);
    console.error('  - Data:', error.response?.data);
    console.error('  - Message:', error.message);
    console.error('  - URL:', error.config?.url);
    console.error('  - Method:', error.config?.method);
    
    // Network error or server unreachable
    if (!error.response) {
      console.error('[API] Network Error - Server may be unreachable');
      console.error('[API] Trying to reach:', error.config?.url);
      console.error('[API] Base URL:', API_BASE_URL);
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
