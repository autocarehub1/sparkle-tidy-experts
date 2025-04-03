#!/bin/bash

# Script to fix domain configuration for www.sparkletidy.com
# Created by Claude for Emmanuel Eleruja

# Set error handling
set -e
echo "Starting server configuration update for www.sparkletidy.com..."

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print status messages
print_status() {
  echo -e "${GREEN}==> ${1}${NC}"
}

print_warning() {
  echo -e "${YELLOW}==> WARNING: ${1}${NC}"
}

print_error() {
  echo -e "${RED}==> ERROR: ${1}${NC}"
}

# 1. Update backend/index.js to properly handle API and static files
print_status "Updating backend/index.js file..."

# Backup the original file
if [ -f /var/www/sparkletidy.com/backend/index.js ]; then
  cp /var/www/sparkletidy.com/backend/index.js /var/www/sparkletidy.com/backend/index.js.bak
  print_status "Created backup of index.js as index.js.bak"
else
  print_error "Backend index.js file not found at expected location"
  exit 1
fi

# Create a function to update the static file serving in index.js
update_index_js() {
  cat > /var/www/sparkletidy.com/backend/index.js.new << 'EOL'
// Modified index.js with improved static file serving and API handling
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;
const ALTERNATIVE_PORTS = [5004, 5005];

// Enhanced logging for production debugging
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};

// Add request logging in production
if (!config.isDevelopment) {
  app.use(logRequest);
}

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('The server will continue to run, but database functionality will be unavailable');
  });

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiting in production
if (config.rateLimit.enabled) {
  console.log(`Setting up rate limiting: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs/60000} minutes`);
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { 
      status: 'error', 
      message: 'Too many requests, please try again later'
    }
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', limiter);
}

// Domain redirect middleware for production - redirect non-www to www
if (!config.isDevelopment) {
  app.use((req, res, next) => {
    const host = req.hostname;
    
    // If request comes to sparkletidy.com (non-www), redirect to www.sparkletidy.com
    if (host === config.domains.main) {
      return res.redirect(301, `https://${config.domains.www}${req.originalUrl}`);
    }
    
    next();
  });
}

// Import models
const Contractor = require('./models/Contractor');
const Feedback = require('./models/Feedback');
const CompanySettings = require('./models/CompanySettings');
const NotificationSettings = require('./models/NotificationSettings');
const Transaction = require('./models/Transaction');
const Client = require('./models/Client');

// Define the frontend URL based on environment
const FRONTEND_URL = config.nodeEnv === 'production' 
  ? 'https://www.sparkletidy.com' 
  : 'http://localhost:3000';

// Global variable to store the transporter
let transporter;

// Global variable to store the server reference
let server;

// ... [REST OF THE ORIGINAL FILE STAYS THE SAME] ...

// REPLACE OR ADD THE FOLLOWING SECTION NEAR THE END OF THE FILE:

// Serve static files from the React frontend app in production
if (!config.isDevelopment) {
  console.log('Setting up static file serving for production');
  
  // Define the path to the frontend build directory
  const staticFilesPath = path.join(__dirname, '../frontend/build');
  
  // Check if the build directory exists
  if (fs.existsSync(staticFilesPath)) {
    console.log(`Static files directory found at: ${staticFilesPath}`);
    
    // Serve static files with proper cache headers
    app.use(express.static(staticFilesPath, {
      etag: true,
      maxAge: '30d', // Cache static assets for 30 days
      setHeaders: (res, path) => {
        // Set cache headers based on file type
        if (path.endsWith('.html')) {
          // Don't cache HTML files
          res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
          // Cache JS, CSS, and images
          res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
      }
    }));
    
    // Log serving static files
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api')) {
        console.log(`Serving static file: ${req.path}`);
      }
      next();
    });
    
    // For any request not starting with /api, serve the React app
    app.get('*', (req, res, next) => {
      if (!req.path.startsWith('/api')) {
        console.log(`Serving index.html for path: ${req.path}`);
        res.sendFile(path.join(staticFilesPath, 'index.html'));
      } else {
        next();
      }
    });
  } else {
    console.error(`Static files directory not found at: ${staticFilesPath}`);
    console.error('Running in API-only mode. Frontend will not be served.');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server',
    error: config.isDevelopment ? err.message : 'Internal Server Error'
  });
});

// Start the server with better error handling and port fallback
const startServer = (portIndex = 0) => {
  const currentPort = portIndex === 0 ? PORT : ALTERNATIVE_PORTS[portIndex - 1];
  
  try {
    console.log(`Attempting to start server on port ${currentPort}...`);
    
    server = app.listen(currentPort, () => {
      console.log(`Server running on port ${currentPort} - Open http://localhost:${currentPort}/api/health in your browser to test`);
      console.log(`Static files will be served from: ${path.join(__dirname, '../frontend/build')}`);
      console.log(`API routes are available at: http://localhost:${currentPort}/api/*`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${currentPort} is already in use.`);
        
        // Try next port if available
        const nextPortIndex = portIndex + 1;
        if (nextPortIndex <= ALTERNATIVE_PORTS.length) {
          console.log(`Trying alternative port ${ALTERNATIVE_PORTS[nextPortIndex - 1]}...`);
          startServer(nextPortIndex);
        } else {
          console.error('❌ All ports are in use. Please manually close the applications using these ports.');
          console.error(`Ports attempted: ${PORT}, ${ALTERNATIVE_PORTS.join(', ')}`);
          process.exit(1);
        }
      } else {
        console.error(`❌ Failed to start server: ${err.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
};

// ... [REST OF THE ORIGINAL SERVER STARTUP CODE STAYS THE SAME] ...

module.exports = app;
EOL

  # Check if the new file was created successfully
  if [ -f /var/www/sparkletidy.com/backend/index.js.new ]; then
    # Replace only the static file serving section
    sed -i '/\/\/ Serve static files from the React frontend app in production/,/^}/c\// Serve static files from the React frontend app in production\nif (!config.isDevelopment) {\n  console.log('\''Setting up static file serving for production'\'');\n  \n  // Define the path to the frontend build directory\n  const staticFilesPath = path.join(__dirname, '\''../frontend/build'\'');\n  \n  // Check if the build directory exists\n  if (fs.existsSync(staticFilesPath)) {\n    console.log(`Static files directory found at: ${staticFilesPath}`);\n    \n    // Serve static files with proper cache headers\n    app.use(express.static(staticFilesPath, {\n      etag: true,\n      maxAge: '\''30d'\'', // Cache static assets for 30 days\n      setHeaders: (res, path) => {\n        // Set cache headers based on file type\n        if (path.endsWith('\''.html'\'')) {\n          // Don'\''t cache HTML files\n          res.setHeader('\''Cache-Control'\'', '\''no-cache'\'');\n        } else if (path.match(/\\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {\n          // Cache JS, CSS, and images\n          res.setHeader('\''Cache-Control'\'', '\''public, max-age=2592000'\''); // 30 days\n        }\n      }\n    }));\n    \n    // Log serving static files\n    app.use((req, res, next) => {\n      if (!req.path.startsWith('\''/api'\'')) {\n        console.log(`Serving static file: ${req.path}`);\n      }\n      next();\n    });\n    \n    // For any request not starting with /api, serve the React app\n    app.get('\''*'\'', (req, res, next) => {\n      if (!req.path.startsWith('\''/api'\'')) {\n        console.log(`Serving index.html for path: ${req.path}`);\n        res.sendFile(path.join(staticFilesPath, '\''index.html'\''));\n      } else {\n        next();\n      }\n    });\n  } else {\n    console.error(`Static files directory not found at: ${staticFilesPath}`);\n    console.error('\''Running in API-only mode. Frontend will not be served.'\'');\n  }\n}' /var/www/sparkletidy.com/backend/index.js

    # Also update the server startup log message
    sed -i 's/console.log(`Server running on port ${currentPort} - Open http:\/\/localhost:${currentPort}\/api\/health in your browser to test`);/console.log(`Server running on port ${currentPort} - Open http:\/\/localhost:${currentPort}\/api\/health in your browser to test`);\n      console.log(`Static files will be served from: ${path.join(__dirname, '\''..\/frontend\/build'\'')}`);\n      console.log(`API routes are available at: http:\/\/localhost:${currentPort}\/api\/*`);/' /var/www/sparkletidy.com/backend/index.js

    print_status "Updated static file serving in index.js"
  else
    print_error "Failed to create new index.js file"
    exit 1
  fi
}

# Call the function to update index.js
update_index_js

# 2. Update Nginx configuration
print_status "Updating Nginx configuration..."

# Create new Nginx configuration file
cat > /etc/nginx/sites-available/sparkletidy.com << 'EOL'
# Main domain configuration
server {
    listen 80;
    server_name sparkletidy.com www.sparkletidy.com;
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
    
    # For Let's Encrypt verification
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
}

# HTTPS configuration for main site
server {
    listen 443 ssl;
    server_name sparkletidy.com www.sparkletidy.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/sparkletidy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sparkletidy.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Enable access logs with detailed information
    access_log /var/log/nginx/sparkletidy.access.log;
    error_log /var/log/nginx/sparkletidy.error.log;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Add custom headers for debugging
        add_header X-Debug-Message "Proxied through Nginx" always;
    }
    
    # Explicitly handle API requests the same way
    location /api/ {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Add custom headers for debugging
        add_header X-Debug-Message "API request through Nginx" always;
    }
    
    # Handle common static file types directly if they exist
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/sparkletidy.com/frontend/build;
        try_files $uri @backend;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Fallback to backend
    location @backend {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOL

# Check if Nginx configuration is valid
nginx -t

# If Nginx configuration is valid, enable and restart Nginx
if [ $? -eq 0 ]; then
  # Enable the site if not already enabled
  if [ ! -f /etc/nginx/sites-enabled/sparkletidy.com ]; then
    ln -s /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-enabled/
  fi
  
  # Restart Nginx
  systemctl restart nginx
  print_status "Nginx configuration updated and restarted"
else
  print_error "Nginx configuration is invalid. Please check the syntax."
  exit 1
fi

# 3. Check and create frontend build directory if it doesn't exist
print_status "Checking frontend build directory..."

if [ ! -d /var/www/sparkletidy.com/frontend/build ]; then
  print_warning "Frontend build directory not found. Creating it..."
  mkdir -p /var/www/sparkletidy.com/frontend/build
fi

# 4. Build frontend if needed
if [ -d /var/www/sparkletidy.com/frontend/src ]; then
  print_status "Building frontend..."
  cd /var/www/sparkletidy.com/frontend
  npm run build
  print_status "Frontend build complete"
else
  print_warning "Frontend source not found. Cannot build frontend."
fi

# 5. Restart the backend server
print_status "Restarting backend server..."

# Check if PM2 is installed
if command -v pm2 >/dev/null 2>&1; then
  # Check if the app is already running in PM2
  if pm2 list | grep -q sparkletidy; then
    pm2 restart sparkletidy
    print_status "Backend server restarted with PM2"
  else
    cd /var/www/sparkletidy.com/backend
    pm2 start index.js --name sparkletidy
    print_status "Backend server started with PM2"
  fi
else
  print_warning "PM2 not found. Using systemd to restart the service..."
  
  # Try to restart with systemd if a service exists
  if systemctl is-active --quiet sparkletidy; then
    systemctl restart sparkletidy
    print_status "Backend server restarted with systemd"
  else
    print_warning "No sparkletidy systemd service found. Starting manually..."
    
    # Start the server manually
    cd /var/www/sparkletidy.com/backend
    NODE_ENV=production node index.js &
    print_status "Backend server started manually"
  fi
fi

# 6. Check server status
print_status "Checking server status..."

# Check if the backend server is running
if curl -s http://localhost:5003/api/health > /dev/null; then
  print_status "Backend server is running and healthy"
else
  print_error "Backend server is not responding. Please check logs."
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
  print_status "Nginx is running"
else
  print_error "Nginx is not running. Please check logs."
fi

print_status "Server configuration update completed."
print_status "Please wait a few minutes and then check your website at https://www.sparkletidy.com"
print_status "If you still experience issues, please check the logs at:"
print_status "  - Backend logs: pm2 logs sparkletidy"
print_status "  - Nginx access logs: /var/log/nginx/sparkletidy.access.log"
print_status "  - Nginx error logs: /var/log/nginx/sparkletidy.error.log" 