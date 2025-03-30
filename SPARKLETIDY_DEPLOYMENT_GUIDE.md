# Sparkle & Tidy Experts - Website Deployment Guide

This document provides a step-by-step guide to deploy the Sparkle & Tidy Experts website to your domain (www.sparkletidy.com).

## Prerequisites

- A VPS (Virtual Private Server) from Hostinger
- Domain name (sparkletidy.com) registered and pointing to your VPS IP
- Root access to your VPS
- Basic knowledge of terminal/command line

## Overview of the Architecture

The Sparkle & Tidy Experts application consists of:

1. **Backend API Server**: Node.js/Express application (runs on port 5003)
2. **Frontend Application**: React application for the main website
3. **Admin Dashboard**: React application for admin functionality
4. **MongoDB Database**: For storing application data

## Deployment Process

### 1. Initial Server Setup

```bash
# Connect to your VPS via SSH
ssh root@YOUR_VPS_IP

# Update the system packages
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip nano
```

### 2. Install Node.js

```bash
# Install Node.js 16.x
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 3. Install MongoDB

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
apt update

# Install MongoDB
apt install -y mongodb-org

# Start MongoDB service
systemctl start mongod
systemctl enable mongod

# Verify MongoDB is running
systemctl status mongod
```

### 4. Install NGINX

```bash
# Install NGINX
apt install -y nginx

# Start NGINX service
systemctl start nginx
systemctl enable nginx

# Verify NGINX is running
systemctl status nginx
```

### 5. Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2
```

### 6. Deploy the Application

You have two options for deploying the application:

#### Option 1: Using the automatic deployment script

1. On your local machine, edit the `deploy.sh` script to set your VPS IP:

```bash
# Edit the deploy.sh file
nano deploy.sh

# Change the VPS_IP value from YOUR_VPS_IP_ADDRESS to your actual VPS IP
# Save and exit (Ctrl+X, then Y, then Enter)
```

2. Make the script executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Build the frontend and admin applications
- Package everything into a zip file
- Upload it to your VPS
- Extract and set up the application on your server
- Configure PM2 to run the application
- Set up NGINX configuration

#### Option 2: Manual deployment

If you prefer to do the deployment manually:

1. Build the frontend and admin applications:

```bash
# Build frontend
cd frontend
NODE_ENV=production npm run build

# Build admin dashboard
cd ../admin
NODE_ENV=production npm run build
```

2. Create a zip file with all necessary files:

```bash
cd ..
zip -r sparkle-tidy-experts.zip server frontend/build admin/build .env package.json package-lock.json
```

3. Upload the zip file to your VPS:

```bash
scp sparkle-tidy-experts.zip root@YOUR_VPS_IP:/tmp/
```

4. On your VPS, extract and set up the application:

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Create directories
mkdir -p /var/www/sparkletidy.com/public
mkdir -p /var/www/admin.sparkletidy.com/public

# Extract files
cd /var/www/sparkletidy.com
unzip /tmp/sparkle-tidy-experts.zip

# Copy frontend files
cp -r frontend/build/* public/

# Copy admin files
cp -r admin/build/* /var/www/admin.sparkletidy.com/public/

# Install dependencies
npm install --production

# Set correct permissions
chown -R www-data:www-data /var/www/sparkletidy.com /var/www/admin.sparkletidy.com
chmod -R 755 /var/www/sparkletidy.com /var/www/admin.sparkletidy.com
```

### 7. Set Up NGINX Configuration

Run the NGINX setup script:

```bash
# Make the script executable
chmod +x nginx-setup.sh

# Run the script
./nginx-setup.sh
```

This script will:
- Create necessary directories
- Copy NGINX configuration files
- Set up symbolic links
- Test the configuration
- Restart NGINX

### 8. Obtain SSL Certificates

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain certificates
certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d api.sparkletidy.com -d admin.sparkletidy.com
```

### 9. Configure DNS Records

In your Hostinger domain control panel, set up the following DNS records:

- A record: `sparkletidy.com` → Your VPS IP
- A record: `www.sparkletidy.com` → Your VPS IP
- A record: `api.sparkletidy.com` → Your VPS IP
- A record: `admin.sparkletidy.com` → Your VPS IP

### 10. Start the Application

```bash
# Start the application with PM2
cd /var/www/sparkletidy.com
pm2 start server/index.js --name sparkle-tidy

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

### 11. Verify the Deployment

Test your website by visiting:

- Main website: https://www.sparkletidy.com
- API endpoint: https://api.sparkletidy.com/api/test
- Admin dashboard: https://admin.sparkletidy.com

### 12. Troubleshooting

If you encounter any issues, run the troubleshooting script:

```bash
chmod +x vps-troubleshoot.sh
./vps-troubleshoot.sh
```

This script will:
- Check if all necessary directories exist
- Verify Node.js and npm installation
- Check MongoDB status
- Check PM2 status and running processes
- Check NGINX status and configuration
- Verify DNS resolution
- Check SSL certificates
- Examine application logs
- Check firewall status
- Verify port usage
- Check disk space

## Maintenance Tasks

### Updating the Application

To update the application, run the deployment script again:

```bash
./deploy.sh
```

### Monitoring the Application

```bash
# View application logs
pm2 logs sparkle-tidy

# Monitor application status
pm2 monit
```

### Backing Up the Database

```bash
# Create a backup directory
mkdir -p /root/backups

# Backup the MongoDB database
mongodump --out /root/backups/mongodb-$(date +%Y%m%d)

# Optional: Upload backup to a secure location
```

### Checking NGINX Logs

```bash
# Check access logs
tail -f /var/log/nginx/access.log

# Check error logs
tail -f /var/log/nginx/error.log
```

## Security Recommendations

1. **Set up a firewall**:
   ```bash
   ufw allow 22/tcp     # SSH
   ufw allow 80/tcp     # HTTP
   ufw allow 443/tcp    # HTTPS
   ufw enable
   ```

2. **Secure SSH**:
   - Use SSH keys instead of passwords
   - Disable root login (after creating a sudo user)
   - Change the default SSH port

3. **Keep your system updated**:
   ```bash
   apt update && apt upgrade -y
   ```

4. **Monitor your server**:
   - Install and configure fail2ban to protect against brute force attacks
   - Set up regular log checking

## Need Help?

If you encounter any issues or need assistance:

- Run the troubleshooting script: `./vps-troubleshoot.sh`
- Contact support at info@sparkletidy.com 