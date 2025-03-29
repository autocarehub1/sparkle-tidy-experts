import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle environment-specific configs
apiClient.interceptors.request.use(
  (axiosConfig) => {
    // For secure endpoints, ensure we're using HTTPS in production
    if (process.env.NODE_ENV === 'production' && 
        config.SECURE_ENDPOINTS.some(endpoint => axiosConfig.url.includes(endpoint))) {
      // Force HTTPS for secure endpoints
      if (!axiosConfig.baseURL.startsWith('https://')) {
        axiosConfig.baseURL = axiosConfig.baseURL.replace('http://', 'https://');
      }
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API request failed:', error);
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 