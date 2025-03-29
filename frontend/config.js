const isDevelopment = process.env.NODE_ENV === 'development';

// API and application URLs
const config = {
  // API URL for backend requests
  API_URL: isDevelopment ? 'http://localhost:5003' : 'https://www.sparkletidy.com',
  
  // Frontend URL for links in emails and redirects
  APP_URL: isDevelopment ? 'http://localhost:3000' : 'https://www.sparkletidy.com',
  
  // API endpoints that should use HTTPS regardless of environment
  SECURE_ENDPOINTS: ['/api/send-appointment', '/api/send-estimate', '/api/feedback'],
  
  // Company information
  COMPANY_NAME: 'Sparkle & Tidy Experts',
  COMPANY_EMAIL: 'info@sparkletidy.com',
  COMPANY_PHONE: '(210) 555-1234',
  COMPANY_ADDRESS: '123 Main Street, San Antonio, TX'
};

export default config; 