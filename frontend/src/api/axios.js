import axios from 'axios';
import config from '../config';

// Determine if we're running in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// Function to check if the site is currently accessed via the live domain
const isRunningOnLiveDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname.includes('sparkletidy.com');
  }
  return false;
};

// If we're on the live domain, prioritize connecting directly rather than via API subdomain
const determineBestApiUrl = () => {
  if (isProduction && isRunningOnLiveDomain()) {
    // Use the domain we're currently on as the first choice
    const currentDomain = window.location.origin;
    return currentDomain.endsWith('/') ? `${currentDomain}api` : `${currentDomain}/api`;
  }
  return config.API_URL;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: determineBestApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable cookies for CORS requests
});

// Track which API URL we're currently using
let currentApiUrlIndex = 0;
// Build apiUrls array, prioritizing direct access if on live domain
const apiUrls = isRunningOnLiveDomain() 
  ? [determineBestApiUrl(), config.API_URL, ...config.FALLBACK_API_URLS] 
  : [config.API_URL, ...config.FALLBACK_API_URLS];
let retryCount = 0;
const MAX_RETRIES = 3;

// Function to switch to the next available API URL
const switchToNextApiUrl = () => {
  currentApiUrlIndex = (currentApiUrlIndex + 1) % apiUrls.length;
  apiClient.defaults.baseURL = apiUrls[currentApiUrlIndex];
  console.log(`Switching to API URL: ${apiClient.defaults.baseURL}`);
  return apiClient.defaults.baseURL;
};

// Health check function to verify API connection
const checkApiHealth = async (url) => {
  try {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await axios.get(`${url}/api/health?ts=${timestamp}`, { 
      timeout: 3000,
      // Send cookies to support sessions if needed
      withCredentials: true
    });
    return response.status === 200 && response.data.status === 'ok';
  } catch (error) {
    console.error(`Health check failed for ${url}:`, error.message);
    return false;
  }
};

// Calculate exponential backoff time for retries
const getRetryDelay = (retryCount) => {
  return Math.min(Math.pow(2, retryCount) * 500, 5000); // 500ms, 1s, 2s, 4s, max 5s
};

// Add request interceptor to handle environment-specific configs
apiClient.interceptors.request.use(
  (axiosConfig) => {
    console.log(`Making ${axiosConfig.method.toUpperCase()} request to: ${axiosConfig.baseURL}${axiosConfig.url}`);
    
    // For secure endpoints, ensure we're using HTTPS in production
    if (isProduction && 
        config.SECURE_ENDPOINTS.some(endpoint => axiosConfig.url.includes(endpoint))) {
      // Force HTTPS for secure endpoints
      if (!axiosConfig.baseURL.startsWith('https://')) {
        axiosConfig.baseURL = axiosConfig.baseURL.replace('http://', 'https://');
      }
    }
    
    // If we're making an API call directly to the main domain, make sure the path has /api
    if (isProduction && isRunningOnLiveDomain() && !axiosConfig.url.startsWith('/api/')) {
      axiosConfig.url = `/api${axiosConfig.url.startsWith('/') ? axiosConfig.url : '/' + axiosConfig.url}`;
    }
    
    return axiosConfig;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    // Reset retry count on successful response
    retryCount = 0;
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API request failed:', error);
      
      if (error.response) {
        console.error(`Response error: Status ${error.response.status}`, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error details:', error.message);
      }
    }
    
    // Handle network errors by trying fallback URLs if available
    if (!error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
      console.error('Network error - attempting recovery strategy');
      
      // Only attempt retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        
        // Add exponential backoff delay
        const delay = getRetryDelay(retryCount);
        console.log(`Retry attempt ${retryCount}/${MAX_RETRIES} after ${delay}ms`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try alternative URLs
        const nextUrl = switchToNextApiUrl();
        
        // Check if the new URL is healthy
        const isHealthy = await checkApiHealth(nextUrl);
        
        if (isHealthy) {
          console.log(`Successfully connected to fallback API URL: ${nextUrl}`);
          
          // Retry the original request with the new baseURL
          const originalRequest = error.config;
          originalRequest.baseURL = nextUrl;
          return apiClient(originalRequest);
        }
        
        // If health check failed, try the next URL
        if (apiUrls.length > 1) {
          return apiClient(error.config);
        }
      } else {
        console.error(`Maximum retry attempts (${MAX_RETRIES}) reached. Could not connect to server.`);
        
        // Customize the error message for better UI display
        error.isConnectionError = true;
        error.friendlyMessage = `Could not connect to our servers at ${config.DOMAIN.WWW}. Please check your internet connection and try again, or contact us directly at ${config.CONTACT.EMAIL}`;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 