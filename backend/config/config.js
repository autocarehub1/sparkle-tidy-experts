const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Determine which .env file to use based on environment
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, '..', envFile);

// Check if the environment file exists before loading
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from: ${envFile}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`Environment file ${envFile} not found, using default .env`);
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

// Define environment
const isDevelopment = nodeEnv !== 'production';

const config = {
  // Server configuration
  port: process.env.PORT || 5003,
  nodeEnv,
  isDevelopment,
  
  // Domain configuration
  domains: {
    main: process.env.DOMAIN_MAIN || 'sparkletidy.com',
    www: process.env.DOMAIN_WWW || 'www.sparkletidy.com',
    api: process.env.DOMAIN_API || 'api.sparkletidy.com'
  },
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sparkletidy',
    options: {
      // MongoDB driver 4.0+ options if needed
    }
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@sparkletidy.com',
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
      ciphers: 'SSLv3' // Use older ciphers for compatibility with some servers
    },
    // Indicates this is a working configuration, not a fallback
    isHostinger: true
  },
  
  // Frontend URLs
  frontendUrl: isDevelopment ? 'http://localhost:3000' : `https://${process.env.DOMAIN_WWW || 'www.sparkletidy.com'}`,
  adminUrl: isDevelopment ? 'http://localhost:3001' : `https://admin.${process.env.DOMAIN_MAIN || 'sparkletidy.com'}`,
  
  // CORS settings
  cors: {
    origin: isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'] 
      : process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',')
        : ['https://www.sparkletidy.com', 'https://sparkletidy.com', 'https://admin.sparkletidy.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'sparkletidy-secret-key',
    expiresIn: '1d'
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Rate limiting
  rateLimit: {
    enabled: process.env.ENABLE_RATE_LIMITING === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)       // Default: 100 requests per window
  }
};

module.exports = config; 