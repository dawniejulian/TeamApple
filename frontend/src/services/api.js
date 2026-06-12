// frontend/src/services/api.js
import axios from 'axios';
import { getDeviceId } from '../utils/deviceFingerprint';

// Determine API base URL based on environment
const API_BASE_URL = (() => {
  const envApiUrl = process.env.REACT_APP_API_URL;
  const host = window.location.hostname;
  const port = window.location.port;

  // Explicitly set via environment variable (for Docker builds)
  if (envApiUrl && envApiUrl.toUpperCase() !== 'AUTO') {
    // If it's a full URL, use as-is
    if (envApiUrl.includes('://')) {
      return envApiUrl;
    }
    // Otherwise assume it's a path and prepend origin
    return window.location.origin + envApiUrl;
  }
  
  // If we are in local development (running React dev server on port 3000)
  if (port === '3000') {
    return `http://${host}:5001/api`;
  }
  
  // Otherwise (running via Nginx in Docker on port 3001, 3002, etc.), use Nginx proxy relative path
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

// Attach JWT token and Device ID to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Always send device fingerprint so backend can verify kasir access
    config.headers['X-Device-ID'] = getDeviceId();
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
    
    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
       (error.response?.data?.message?.toLowerCase().includes('token') ||
        error.response?.data?.message?.toLowerCase().includes('kadaluarsa')))
    ) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
