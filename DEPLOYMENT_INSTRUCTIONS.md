# Sparkle & Tidy Experts - Deployment Instructions

This guide outlines the steps to deploy the Sparkle & Tidy Experts website to your domain (www.sparkletidy.com).

## Prerequisites

- Node.js (v14+)
- npm (v6+)
- MongoDB
- Hostinger VPS or similar hosting service

## Preparing for Deployment

1. Build the application for production:

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build
```

2. Prepare the deployment package:

```bash
npm run deploy:prepare
```

This will create a `deployment` directory containing everything needed for production.

## Server Configuration

### 1. Upload Files to Server

Upload the contents of the `deployment` directory to your server.

### 2. Install Dependencies on Server

```bash
cd /path/to/your/app
npm install --production
cd backend
npm install --production
```

### 3. Configure Environment Variables

Create a `.env.production` file in the `backend` directory with the following variables:

```
PORT=5003
NODE_ENV=production

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/sparkletidy

# Email configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=your_email_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Domain configuration
DOMAIN_MAIN=sparkletidy.com
DOMAIN_WWW=www.sparkletidy.com
DOMAIN_API=api.sparkletidy.com
```

### 4. Nginx Configuration

Create an Nginx configuration file for your domain:

```nginx
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
    }
    
    # Serve static files directly
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|svg|woff|woff2|ttf|eot)$ {
        root /path/to/your/app/frontend/build;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri @nodejs;
    }
    
    location @nodejs {
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
```

Replace `/path/to/your/app` with your actual deployment path.

### 5. Start the Application

Install PM2 for process management:

```bash
npm install -g pm2
```

Start the application:

```bash
cd /path/to/your/app/backend
pm2 start index.js --name sparkle-tidy
```

Make PM2 start on boot:

```bash
pm2 startup
pm2 save
```

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check if the backend server is running:
   ```bash
   pm2 status
   ```

2. Check logs for errors:
   ```bash
   pm2 logs sparkle-tidy
   ```

3. Verify Nginx configuration:
   ```bash
   nginx -t
   systemctl status nginx
   ```

4. Test API health:
   ```bash
   curl http://localhost:5003/api/health
   ```

### Frontend Errors

If the frontend isn't loading correctly:

1. Verify the build files exist:
   ```bash
   ls -la /path/to/your/app/frontend/build
   ```

2. Clear browser cache and try again.

3. Ensure static files are being served correctly:
   ```bash
   curl -I https://www.sparkletidy.com/static/js/main.js
   ```

## Technical Details

The application is configured to:

1. Serve static files from the React frontend build directory.
2. Handle API requests under the `/api` path.
3. Redirect non-www domain to www domain.
4. Redirect HTTP to HTTPS.
5. Set appropriate cache headers for static assets.

This deployment strategy allows your entire application to run on a single domain without needing separate subdomains for the API. 