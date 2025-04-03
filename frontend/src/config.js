// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configuration object
const config = {
  // API URLs for backend with fallbacks
  API_URL: isDevelopment ? 'http://localhost:5003' : 'https://api.sparkletidy.com',
  
  // Add production fallbacks for the live site
  FALLBACK_API_URLS: isDevelopment 
    ? ['http://localhost:5004', 'http://localhost:5005'] 
    : ['https://www.sparkletidy.com/api', 'https://sparkletidy.com/api'],
  
  // App name
  APP_NAME: 'Sparkle & Tidy Experts',
  
  // List of secure endpoints that should always use HTTPS
  SECURE_ENDPOINTS: ['/api/send-appointment', '/api/send-estimate', '/api/feedback'],
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'sparkle_tidy_auth_token',
  },
  
  // Contact information
  CONTACT: {
    EMAIL: 'info@sparkletidy.com',
    PHONE: '(210) 555-1234',
    WEBSITE: 'https://www.sparkletidy.com'
  },
  
  // Domain configuration
  DOMAIN: {
    MAIN: 'sparkletidy.com',
    WWW: 'www.sparkletidy.com',
    API: 'api.sparkletidy.com',
    ADMIN: 'admin.sparkletidy.com'
  }
};

export default config; 