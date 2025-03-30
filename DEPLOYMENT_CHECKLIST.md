# Sparkle & Tidy Experts - Deployment Checklist

Use this checklist to ensure all steps are completed when deploying to www.sparkletidy.com.

## Pre-deployment

- [ ] Domain name (sparkletidy.com) is registered with Hostinger
- [ ] VPS is provisioned and running
- [ ] Root access to VPS is confirmed
- [ ] Backup of existing site/application (if applicable)
- [ ] Local development environment is set up
- [ ] All application code is committed and tested

## Server Setup

- [ ] Connected to VPS via SSH
- [ ] System packages updated (`apt update && apt upgrade -y`)
- [ ] Essential packages installed (curl, wget, git, unzip, nano)
- [ ] Node.js installed and verified (v16.x recommended)
- [ ] MongoDB installed and running
- [ ] NGINX installed and running
- [ ] PM2 installed globally

## Application Deployment

- [ ] Updated `deploy.sh` with correct VPS IP address
- [ ] Made `deploy.sh` executable (`chmod +x deploy.sh`)
- [ ] Run deployment script OR completed manual deployment steps
- [ ] Verified application files are in correct directories
- [ ] Checked all dependencies are installed
- [ ] Environment variables set correctly in `.env` file

## NGINX Configuration

- [ ] Made `nginx-setup.sh` executable (`chmod +x nginx-setup.sh`)
- [ ] Run NGINX setup script
- [ ] Verified NGINX configuration test passed
- [ ] NGINX service restarted successfully

## SSL Certificates

- [ ] Installed Certbot
- [ ] Obtained SSL certificates for all domains
- [ ] Verified automatic HTTPS redirection

## DNS Configuration

- [ ] A record for sparkletidy.com pointing to VPS IP
- [ ] A record for www.sparkletidy.com pointing to VPS IP
- [ ] A record for api.sparkletidy.com pointing to VPS IP
- [ ] A record for admin.sparkletidy.com pointing to VPS IP
- [ ] Waited for DNS propagation (can take up to 48 hours)

## Application Launch

- [ ] Started application with PM2 (`pm2 start server/index.js --name sparkle-tidy`)
- [ ] Saved PM2 configuration (`pm2 save`)
- [ ] Set up PM2 to start on system boot (`pm2 startup`)

## Verification

- [ ] Main website loads at https://www.sparkletidy.com
- [ ] API test endpoint responds at https://api.sparkletidy.com/api/test
- [ ] Admin dashboard loads at https://admin.sparkletidy.com
- [ ] Tested core functionality (forms, navigation, etc.)
- [ ] Checked for any console errors in browser

## Security

- [ ] Configured firewall (UFW)
- [ ] Secured SSH access
- [ ] Removed unnecessary services/packages
- [ ] Changed default credentials where applicable
- [ ] Run troubleshooting script to verify setup (`./vps-troubleshoot.sh`)

## Post-deployment

- [ ] Removed temporary files and installation packages
- [ ] Set up regular database backups
- [ ] Configured monitoring (optional)
- [ ] Documented any custom configurations
- [ ] Updated team members on deployment status

## Notes

Use this space to document any specific issues encountered or custom configurations made:

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

_____________________________________________________________

Date of deployment: _______________

Deployed by: ___________________ 