# Running Sparkle & Tidy Experts on www.sparkletidy.com

This document provides a quick overview of how to run the Sparkle & Tidy Experts web application on your domain (www.sparkletidy.com). For detailed instructions, please refer to the comprehensive `SPARKLETIDY_DEPLOYMENT_GUIDE.md`.

## Quick Start

### 1. Set Up Your VPS

- Log in to your Hostinger account and provision a VPS (minimum 2GB RAM recommended)
- Note your VPS IP address
- Set up SSH access to your VPS

### 2. Update DNS Records

In your Hostinger domain control panel, create the following A records:
- `sparkletidy.com` → Your VPS IP
- `www.sparkletidy.com` → Your VPS IP
- `api.sparkletidy.com` → Your VPS IP
- `admin.sparkletidy.com` → Your VPS IP

### 3. Deploy Your Application

From your local machine:

1. Update the deployment script with your VPS IP:
   ```bash
   nano deploy.sh
   # Change VPS_IP="YOUR_VPS_IP_ADDRESS" to your actual VPS IP
   ```

2. Make scripts executable:
   ```bash
   chmod +x deploy.sh nginx-setup.sh vps-troubleshoot.sh check-sparkletidy-domain.sh
   ```

3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

### 4. Configure the Server

On your VPS:

1. Run the NGINX setup script:
   ```bash
   cd /var/www/sparkletidy.com
   ./nginx-setup.sh
   ```

2. Install SSL certificates:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d api.sparkletidy.com -d admin.sparkletidy.com
   ```

3. Start the application:
   ```bash
   cd /var/www/sparkletidy.com
   pm2 start server/index.js --name sparkle-tidy
   pm2 save
   pm2 startup
   ```

## Verify Your Deployment

Run the domain connectivity check script:
```bash
./check-sparkletidy-domain.sh YOUR_VPS_IP
```

Visit these URLs to ensure they're working:
- Main website: https://www.sparkletidy.com
- API test: https://api.sparkletidy.com/api/test
- Admin dashboard: https://admin.sparkletidy.com

## Troubleshooting

If you encounter issues, run the troubleshooting script:
```bash
cd /var/www/sparkletidy.com
./vps-troubleshoot.sh
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `deploy.sh` | Deploys the application to your VPS |
| `nginx-setup.sh` | Configures NGINX on your VPS |
| `vps-troubleshoot.sh` | Diagnoses common issues on your VPS |
| `check-sparkletidy-domain.sh` | Checks domain connectivity |

## Application Structure

The application consists of:
- **Backend API Server**: Node.js/Express (port 5003)
- **Frontend Website**: React application served at www.sparkletidy.com
- **Admin Dashboard**: React application served at admin.sparkletidy.com
- **MongoDB Database**: Data storage

## Maintaining Your Site

- **Updates**: Run `./deploy.sh` again to deploy updated code
- **Monitoring**: Use `pm2 monit` to monitor application status
- **Logs**: View logs with `pm2 logs sparkle-tidy`
- **Backups**: Regularly backup your MongoDB database

## Need More Help?

For detailed instructions, please refer to:
- `SPARKLETIDY_DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist 