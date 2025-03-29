# Hostinger VPS Deployment Checklist

Use this checklist to make sure you've completed all necessary steps to deploy your Sparkle & Tidy Experts website on your Hostinger VPS.

## VPS Setup

- [ ] Log in to Hostinger account and access VPS management
- [ ] Note your VPS IP address
- [ ] Connect to your VPS: `ssh root@YOUR_VPS_IP`
- [ ] Update system packages: `apt update && apt upgrade -y`
- [ ] Install required software:
  - [ ] Node.js and npm: `curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt install -y nodejs`
  - [ ] MongoDB: `apt install -y mongodb-org && systemctl start mongod && systemctl enable mongod`
  - [ ] NGINX: `apt install -y nginx`
  - [ ] PM2: `npm install -g pm2`
  - [ ] Certbot: `apt install -y certbot python3-certbot-nginx`

## Domain Configuration

- [ ] Log in to Hostinger account and access domain management
- [ ] Update DNS settings:
  - [ ] A record for @ pointing to your VPS IP
  - [ ] A record for www pointing to your VPS IP
- [ ] Wait for DNS propagation (can take up to 24-48 hours)
- [ ] Verify DNS resolution: `host sparkletidy.com`

## Application Deployment

- [ ] Update the deployment script with your VPS information
  - [ ] Edit `deploy.sh` to set your VPS IP address
- [ ] Run the deployment script: `./deploy.sh`
- [ ] Check successful deployment on VPS:
  - [ ] Connect to your VPS: `ssh root@YOUR_VPS_IP`
  - [ ] Verify the application is running: `pm2 list`
  - [ ] Check server response: `curl http://localhost:5003`

## NGINX and SSL Setup

- [ ] Create NGINX configuration:
  ```bash
  nano /etc/nginx/sites-available/sparkletidy.com
  ```
- [ ] Enable the site:
  ```bash
  ln -s /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  ```
- [ ] Test NGINX configuration:
  ```bash
  nginx -t
  ```
- [ ] Restart NGINX:
  ```bash
  systemctl restart nginx
  ```
- [ ] Set up SSL certificate:
  ```bash
  certbot --nginx -d sparkletidy.com -d www.sparkletidy.com
  ```
- [ ] Test SSL renewal:
  ```bash
  certbot renew --dry-run
  ```

## Final Verification

- [ ] Visit https://www.sparkletidy.com in your browser
- [ ] Run the domain check script: `./check-domain.sh`
- [ ] Run the troubleshooting script if needed: `./vps-troubleshoot.sh`
- [ ] Test website functionality (forms, navigation, etc.)
- [ ] Set up automatic backups:
  ```bash
  crontab -e
  # Add: 0 2 * * * /root/backup.sh
  ```

## Common Issues

- If domain isn't resolving, check DNS settings and wait for propagation
- If website shows NGINX default page, check NGINX configuration
- If website can't connect to MongoDB, check if MongoDB is running (`systemctl status mongod`)
- If Node.js app isn't running, check PM2 logs (`pm2 logs`)
- If SSL certificate doesn't work, check Certbot logs and run it again

## Maintenance Commands

- Restart application: `pm2 restart sparkle-tidy-experts`
- View application logs: `pm2 logs sparkle-tidy-experts`
- Monitor application: `pm2 monit`
- Check NGINX logs: `tail -f /var/log/nginx/error.log`
- Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log` 