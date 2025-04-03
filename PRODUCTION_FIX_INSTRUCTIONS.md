# Sparkle & Tidy Experts Production Fix Instructions

## Problem Summary
The website www.sparkletidy.com is experiencing connectivity issues when users try to schedule appointments. Based on the logs and error messages, the following issues have been identified:

1. Port conflict - multiple Node.js processes trying to use port 5003
2. Improper static file serving configuration in production environment
3. Missing proxy configuration for API requests 
4. Incorrect domain routing between the frontend and backend

## Solution Overview
We need to implement a comprehensive fix that will:

1. Clean up stale processes and ensure proper port management
2. Configure Nginx correctly to serve the static files and proxy API requests
3. Update the backend's index.js file to handle API routes properly
4. Implement proper domain handling, including www redirection

## How to Apply the Fix

### Option 1: Use the Provided Fix Script (Recommended)

1. **SSH into your server**:
   ```
   ssh root@69.62.65.2
   ```
   Password: `BubblesAdemi1#`

2. **Create a fix script**:
   ```
   nano /root/server_fix.sh
   ```

3. **Copy and paste the following script**:
   ```bash
   #!/bin/bash
   
   # Sparkle & Tidy Experts Server Fix Script
   # This script fixes issues with the production deployment on www.sparkletidy.com
   
   echo "Starting Sparkle & Tidy Experts server fix..."
   
   # 1. Stop all running node processes
   echo "Stopping any running Node.js processes..."
   pkill -f node
   
   # 2. Back up existing files before making changes
   echo "Creating backups of critical files..."
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   
   # Backup backend index.js
   cp /var/www/html/sparkletidy.com/backend/index.js /var/www/html/sparkletidy.com/backend/index.js.backup.$TIMESTAMP
   
   # Backup Nginx config
   cp /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-available/sparkletidy.com.backup.$TIMESTAMP
   
   # 3. Update backend index.js to properly handle API requests and static files
   echo "Updating backend index.js file..."
   cat > /var/www/html/sparkletidy.com/backend/index.js << 'EOL'
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const path = require('path');
   const config = require('./config/config');
   const nodemailer = require('nodemailer');
   const rateLimit = require('express-rate-limit');
   
   // Import routes
   const estimateRoutes = require('./routes/estimateRoutes');
   const appointmentRoutes = require('./routes/appointmentRoutes');
   const feedbackRoutes = require('./routes/feedbackRoutes');
   const healthRoutes = require('./routes/healthRoutes');
   
   // Initialize express app
   const app = express();
   
   // Redirect from non-www to www in production
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       const host = req.hostname;
       if (host === 'sparkletidy.com') {
         return res.redirect(301, `https://www.sparkletidy.com${req.originalUrl}`);
       }
       next();
     });
   }
   
   // Apply rate limiting
   if (config.rateLimit.enabled) {
     const limiter = rateLimit({
       windowMs: config.rateLimit.windowMs,
       max: config.rateLimit.max,
       message: 'Too many requests from this IP, please try again later.'
     });
     app.use('/api/', limiter);
   }
   
   // Middleware
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   
   // Configure CORS
   app.use(cors(config.cors));
   
   // Request logging middleware
   app.use((req, res, next) => {
     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
     next();
   });
   
   // Health check endpoint - keep this outside API routes for monitoring
   app.use('/health', healthRoutes);
   
   // API Routes
   app.use('/api/health', healthRoutes);
   app.use('/api/send-estimate', estimateRoutes);
   app.use('/api/appointments', appointmentRoutes);
   app.use('/api/feedback', feedbackRoutes);
   
   // Serve static files in production with proper cache headers
   if (process.env.NODE_ENV === 'production') {
     // Set cache for static assets - 1 day for most assets
     app.use(express.static(path.join(__dirname, '../frontend/build'), {
       maxAge: '1d',
       setHeaders: (res, filePath) => {
         // Use a longer cache period for hashed assets (containing .chunk.)
         if (filePath.includes('.chunk.')) {
           res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
         }
       }
     }));
   
     // For any route that doesn't start with /api, serve the React app
     app.use('*', (req, res, next) => {
       if (!req.originalUrl.startsWith('/api/')) {
         return res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
       }
       next();
     });
   }
   
   // Error middleware
   app.use((err, req, res, next) => {
     console.error(`[ERROR] ${err.stack}`);
     res.status(500).json({
       error: true,
       message: process.env.NODE_ENV === 'production' 
         ? 'An unexpected error occurred' 
         : err.message
     });
   });
   
   // Connect to MongoDB
   mongoose.connect(config.mongodb.uri, config.mongodb.options)
     .then(() => console.log('Connected to MongoDB successfully'))
     .catch(err => console.error('Failed to connect to MongoDB:', err));
   
   // Email verification and initialization
   let emailTransporter = null;
   
   const verifyEmailConnection = async () => {
     console.log('Attempting to verify email connection to Hostinger...');
     
     try {
       console.log(`Setting up Hostinger email transporter...
   Host: ${config.email.host}, Port: ${config.email.port}, User: ${config.email.auth.user}`);
       
       const transporter = nodemailer.createTransport({
         host: config.email.host,
         port: config.email.port,
         secure: true,
         auth: {
           user: config.email.auth.user,
           pass: config.email.auth.pass
         },
         tls: config.email.tls
       });
       
       console.log('✅ Hostinger email transporter created successfully');
       
       // Verify connection
       console.log('Testing SMTP connection...');
       const isVerified = await transporter.verify();
       console.log(`✅ SMTP connection to Hostinger verified successfully: ${isVerified}`);
       console.log(`✅ Using email: ${config.email.auth.user}`);
       
       // Set as main transporter
       console.log('Using production Hostinger email configuration');
       emailTransporter = transporter;
       
       console.log('Email service initialized successfully');
       return true;
     } catch (error) {
       console.error('❌ Error verifying email connection:', error);
       return false;
     }
   };
   
   // Start the server with retry logic for port conflicts
   const startServer = (port = config.port) => {
     try {
       const server = app.listen(port, () => {
         console.log(`Server running on port ${port}`);
         
         // Initialize email service
         verifyEmailConnection();
       });
       
       // Handle server errors
       server.on('error', (err) => {
         if (err.code === 'EADDRINUSE') {
           console.error(`Port ${port} is already in use.`);
           
           // In production, fail fast rather than trying alternate ports
           if (process.env.NODE_ENV === 'production') {
             console.error('Critical error: Port conflict in production environment');
             process.exit(1);
           }
         } else {
           console.error('Server error:', err);
           process.exit(1);
         }
       });
       
       // Graceful shutdown
       process.on('SIGTERM', () => {
         console.log('SIGTERM signal received. Closing server gracefully...');
         server.close(() => {
           console.log('Server closed.');
           mongoose.connection.close(false, () => {
             console.log('MongoDB connection closed.');
             process.exit(0);
           });
         });
       });
       
       process.on('SIGINT', () => {
         console.log('SIGINT signal received. Closing server gracefully...');
         server.close(() => {
           console.log('Server closed.');
           mongoose.connection.close(false, () => {
             console.log('MongoDB connection closed.');
             process.exit(0);
           });
         });
       });
       
     } catch (error) {
       console.error('Failed to start server:', error);
       process.exit(1);
     }
   };
   
   // Start the server on the configured port
   startServer();
   EOL
   
   # 4. Update Nginx configuration
   echo "Updating Nginx configuration..."
   cat > /etc/nginx/sites-available/sparkletidy.com << 'EOL'
   server {
       listen 80;
       server_name sparkletidy.com www.sparkletidy.com;
   
       # Redirect HTTP to HTTPS
       location / {
           return 301 https://$host$request_uri;
       }
   }
   
   server {
       listen 443 ssl;
       server_name sparkletidy.com;
   
       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/sparkletidy.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/sparkletidy.com/privkey.pem;
       
       # Redirect non-www to www
       return 301 https://www.sparkletidy.com$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name www.sparkletidy.com;
   
       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/sparkletidy.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/sparkletidy.com/privkey.pem;
   
       # SSL optimizations
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 1d;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options nosniff;
       add_header X-Frame-Options SAMEORIGIN;
       add_header X-XSS-Protection "1; mode=block";
       
       # Document root
       root /var/www/html/sparkletidy.com/frontend/build;
       index index.html;
   
       # Logs
       access_log /var/log/nginx/sparkletidy.access.log;
       error_log /var/log/nginx/sparkletidy.error.log;
   
       # Proxy for API requests
       location /api/ {
           proxy_pass http://localhost:5003;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_read_timeout 90s;
       }
   
       # Health check endpoint direct access
       location /health {
           proxy_pass http://localhost:5003/health;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Static asset caching
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   
       # Handle React routing - serve index.html for any path not found
       location / {
           try_files $uri $uri/ /index.html;
           expires -1;
           add_header Cache-Control "no-store, no-cache, must-revalidate";
       }
   }
   EOL
   
   # 5. Test the Nginx configuration
   echo "Testing Nginx configuration..."
   nginx -t
   
   # 6. Restart Nginx if test was successful
   if [ $? -eq 0 ]; then
     echo "Nginx configuration valid, restarting Nginx..."
     systemctl restart nginx
   else
     echo "Nginx configuration test failed. Please check the syntax."
     exit 1
   fi
   
   # 7. Start the backend service
   echo "Restarting the backend service..."
   
   # Check if we're using PM2
   if command -v pm2 &> /dev/null; then
     cd /var/www/html/sparkletidy.com/backend
     pm2 restart sparkletidy-backend || pm2 start index.js --name "sparkletidy-backend" --env production
   else
     # Using systemd
     systemctl restart sparkletidy-backend.service
   fi
   
   echo "✅ Server fix completed successfully!"
   echo "The website should now be working correctly at https://www.sparkletidy.com"
   echo "Please test the appointment scheduling feature to verify the fix."
   ```

4. **Save the file**: Press `CTRL+X`, then `Y`, then `Enter`

5. **Make the script executable**:
   ```
   chmod +x /root/server_fix.sh
   ```

6. **Run the script**:
   ```
   /root/server_fix.sh
   ```

7. **Verify the fix**: 
   - Visit https://www.sparkletidy.com and try scheduling an appointment
   - Check the backend logs for any errors:
     ```
     cd /var/www/html/sparkletidy.com/backend
     pm2 logs sparkletidy-backend
     ```

### Option 2: Manual Application (If Script Doesn't Work)

If you prefer to apply these changes manually:

1. **Update the backend code**:
   - Edit `/var/www/html/sparkletidy.com/backend/index.js` with the content provided in the script above
   - Make sure to add the domain redirection, improved static file serving, and proper error handling

2. **Update the Nginx configuration**:
   - Edit `/etc/nginx/sites-available/sparkletidy.com` with the configuration provided above
   - Test the configuration with `nginx -t`
   - Apply the changes with `systemctl restart nginx`

3. **Rebuild the frontend** (if needed):
   ```
   cd /var/www/html/sparkletidy.com/frontend
   npm run build
   ```

4. **Restart the backend server**:
   ```
   cd /var/www/html/sparkletidy.com/backend
   # If using PM2
   pm2 restart sparkletidy-backend
   # OR if using systemd
   systemctl restart sparkletidy-backend.service
   ```

## Verification
After applying the fixes, verify that:

1. The website at https://www.sparkletidy.com loads correctly
2. The appointment scheduling form works properly
3. The API health check is accessible at https://www.sparkletidy.com/health
4. Non-www URLs redirect to www.sparkletidy.com

## Troubleshooting
If issues persist:

1. **Check backend logs**:
   ```
   cd /var/www/html/sparkletidy.com/backend
   pm2 logs sparkletidy-backend
   ```

2. **Check Nginx logs**:
   ```
   tail -f /var/log/nginx/sparkletidy.error.log
   ```

3. **Verify frontend build**:
   ```
   ls -la /var/www/html/sparkletidy.com/frontend/build
   ```

4. **Ensure MongoDB is running**:
   ```
   systemctl status mongod
   ```

## Support
If you continue experiencing issues, please contact our support team with:
1. Screenshots of any error messages
2. The output of the backend logs
3. The output of the Nginx logs 