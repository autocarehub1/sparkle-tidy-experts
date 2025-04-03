# Deploying Sparkle & Tidy Experts to Production (Hostinger)

This guide provides step-by-step instructions for deploying the Sparkle & Tidy Experts application to a Hostinger hosting environment.

## Prerequisites

- A Hostinger hosting account with:
  - Node.js support
  - MongoDB database (or MongoDB Atlas connection)
  - SSH access
  - Domain configured (sparkletidy.com)

## Deployment Checklist

### 1. Prepare Your Environment Files

- Ensure `.env.production` file is configured correctly:
  - Update `MONGODB_URI` with the production database connection string
  - Set a strong `JWT_SECRET` 
  - Configure the email with correct Hostinger SMTP credentials
  - Set `NODE_ENV=production`

### 2. Build the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies if needed
npm install

# Build the production version
npm run build

# This will create a 'build' folder with optimized static files
```

### 3. Prepare the Backend

```bash
# Navigate to the backend directory
cd backend

# Install dependencies if needed
npm install

# Install pm2 globally for process management
npm install -g pm2
```

### 4. Setup Hostinger Environment

1. **Access Hostinger Control Panel**:
   - Log in to your Hostinger account
   - Navigate to "Website" > "Hosting" section

2. **Setup Node.js**:
   - Enable Node.js in your hosting plan
   - Select Node.js version (14+ recommended)

3. **Setup MongoDB**:
   - Option 1: Use Hostinger's MongoDB service if available
   - Option 2: Create a MongoDB Atlas account and set up a cluster

4. **Configure Domain**:
   - Ensure your domain (sparkletidy.com) is pointing to your Hostinger hosting
   - Set up a subdomain for API if needed (api.sparkletidy.com)

### 5. Upload Files to Hostinger

#### Using FTP:

1. Connect to your Hostinger account via FTP (FileZilla or similar)
2. Upload the `/backend` directory to the server root
3. Upload the `/frontend/build` directory to a folder named `public_html`

#### Using SSH and Git:

```bash
# Connect to your Hostinger server via SSH
ssh u123456789@your-server.hostinger.com

# Clone your repository (if using git)
git clone https://github.com/yourusername/sparkletidy.git

# Navigate to your project
cd sparkletidy

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Move build files to public_html
mkdir -p ~/public_html
cp -r frontend/build/* ~/public_html/
```

### 6. Configure Environment Variables on Hostinger

If using the Hostinger control panel:

1. Navigate to "Website" > "Hosting" > "Advanced" > "Environment Variables"
2. Add each variable from your `.env.production` file

If using SSH:

```bash
# Create .env file on the server
cd ~/backend
nano .env
# Paste the contents of your .env.production file
```

### 7. Setup Process Manager (PM2)

```bash
# Navigate to backend directory
cd ~/backend

# Start the application with PM2
pm2 start index.js --name "sparkletidy"

# Make PM2 start the app when server restarts
pm2 startup
pm2 save
```

### 8. Configure Hostinger Server

#### Domain & SSL Configuration:

1. In Hostinger control panel, go to "SSL/TLS"
2. Enable SSL for your domains (www.sparkletidy.com and sparkletidy.com)
3. Set up domain redirects so all traffic goes to https://www.sparkletidy.com

#### Nginx Configuration (if available):

Create or modify the Nginx configuration to:
- Direct API requests to your Node.js server
- Serve static files from public_html
- Handle SSL properly

Example Nginx config:

```nginx
server {
    listen 80;
    server_name sparkletidy.com www.sparkletidy.com;
    return 301 https://www.sparkletidy.com$request_uri;
}

server {
    listen 443 ssl;
    server_name www.sparkletidy.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        root /home/username/public_html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 9. Testing the Deployment

1. **Test Backend API**:
   - Visit https://www.sparkletidy.com/api/health to verify the API is running
   - Check MongoDB connection and email service status

2. **Test Frontend**:
   - Open https://www.sparkletidy.com in a browser
   - Test the main functionality (estimate form, appointments)

3. **Test Email Functionality**:
   - Submit a test estimate form
   - Verify emails are sent correctly

### 10. Monitoring & Maintenance

1. **Setup Application Monitoring**:
   ```bash
   # View PM2 dashboard
   pm2 monit
   
   # View logs
   pm2 logs sparkletidy
   ```

2. **Setup Error Notifications**:
   - Configure PM2 to send notifications on application crashes
   - Set up server monitoring through Hostinger's tools

3. **Backup Strategy**:
   - Regular MongoDB backups
   - Code backups (if making changes directly on server)

### Troubleshooting

#### Common Issues:

1. **Application not starting**:
   - Check logs: `pm2 logs sparkletidy`
   - Verify Node.js version compatibility
   - Check environment variables are properly set

2. **Database connection failures**:
   - Verify MongoDB URI in .env file
   - Check MongoDB service status
   - Confirm network/firewall settings allow connection

3. **Email sending issues**:
   - Verify SMTP settings (host, port, credentials)
   - Check for spam or firewall blocking

#### Getting Help:

- Hostinger Support: Access via your account dashboard
- Community Support: Check forums or Stack Overflow
- Application Support: Review documentation or contact development team

## Additional Resources

- [Hostinger Node.js Hosting Documentation](https://www.hostinger.com/tutorials/how-to-host-node-js-application)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MongoDB Backup Guide](https://docs.mongodb.com/manual/core/backups/) 