const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  // Server configuration
  port: process.env.PORT || 5003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkletidy',
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    user: process.env.EMAIL_USER || 'info@sparkletidy.com',
    password: process.env.EMAIL_PASSWORD,
    secure: true
  },
  
  // Frontend URLs
  frontendURL: process.env.NODE_ENV === 'production' 
    ? 'https://www.sparkletidy.com' 
    : 'http://localhost:3000',
  
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://www.sparkletidy.com', 'https://sparkletidy.com']
      : ['http://localhost:3000']
  }
};

module.exports = config; 