// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configuration object
const config = {
  // API URL for backend
  API_URL: isDevelopment ? 'http://localhost:5003' : 'https://api.sparkletidy.com',
  
  // App name
  APP_NAME: 'Sparkle & Tidy Experts',
  
  // List of secure endpoints that should always use HTTPS
  SECURE_ENDPOINTS: ['/api/send-appointment', '/api/send-estimate', '/api/feedback'],
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'sparkle_tidy_auth_token',
  }
};

export default config; 