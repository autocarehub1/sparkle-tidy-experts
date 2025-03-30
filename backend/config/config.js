const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  // Server configuration
  port: process.env.PORT || 5003,
  nodeEnv,
  isDevelopment,
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkletidy',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@sparkletidy.com',
      pass: process.env.EMAIL_PASSWORD || 'SparkSpark2024$',
    }
  },
  
  // Frontend URLs
  frontendUrl: isDevelopment ? 'http://localhost:3000' : 'https://www.sparkletidy.com',
  adminUrl: isDevelopment ? 'http://localhost:3001' : 'https://admin.sparkletidy.com',
  
  // CORS settings
  cors: {
    origin: isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:3001'] 
      : ['https://www.sparkletidy.com', 'https://sparkletidy.com', 'https://admin.sparkletidy.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'sparkletidy-secret-key',
    expiresIn: '1d'
  }
};

module.exports = config; 