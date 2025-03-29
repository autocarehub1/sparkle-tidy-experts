# Hostinger VPS Deployment Guide for Sparkle & Tidy Experts

## 1. Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP_ADDRESS
```

## 2. Update System and Install Dependencies

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

# Verify installation
node -v  # Should output v16.x.x
npm -v   # Should output 8.x.x

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
apt update
apt install -y mongodb-org

# Start MongoDB service
systemctl start mongod
systemctl enable mongod

# Install NGINX
apt install -y nginx

# Install PM2 globally
npm install -g pm2
```

## 3. Upload Your Application to the VPS

From your local machine:

```bash
# ZIP your application
cd /path/to/your/project
zip -r sparkle-tidy-experts.zip .

# Transfer to VPS
scp sparkle-tidy-experts.zip root@YOUR_VPS_IP_ADDRESS:/root/
```

Back on your VPS:

```bash
# Create directory for application
mkdir -p /var/www/sparkletidy.com

# Extract application
cd /root
unzip sparkle-tidy-experts.zip -d /var/www/sparkletidy.com

# Navigate to application directory
cd /var/www/sparkletidy.com
```

## 4. Configure MongoDB

```bash
# Create MongoDB database
mongosh
> use sparkletidy
> exit

# Import database backup if you have one
# mongorestore --db sparkletidy /path/to/backup
```

## 5. Configure Environment Variables

```bash
# Edit .env file
nano /var/www/sparkletidy.com/.env
```

Update the .env file with these settings:

```
PORT=5003
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/sparkletidy
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=YourActualPassword
```

## 6. Install Dependencies and Build the App

```bash
# Navigate to application directory
cd /var/www/sparkletidy.com

# Install dependencies
npm install

# Build React application
npm run build
```

## 7. Configure PM2 for Process Management

```bash
# Create or copy the ecosystem.config.js file
nano /var/www/sparkletidy.com/ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [{
    name: "sparkle-tidy-experts",
    script: "server/index.js",
    cwd: "/var/www/sparkletidy.com",
    env: {
      NODE_ENV: "production",
      PORT: 5003
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
};
```

Start the application:

```bash
# Start the application
cd /var/www/sparkletidy.com
pm2 start ecosystem.config.js

# Make PM2 start on boot
pm2 startup
pm2 save
```

## 8. Configure NGINX as a Reverse Proxy

```bash
# Create NGINX server block
nano /etc/nginx/sites-available/sparkletidy.com
```

Add the following content:

```nginx
server {
    listen 80;
    server_name sparkletidy.com www.sparkletidy.com;
    
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
}
```

Enable the configuration:

```bash
# Enable site
ln -s /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site if needed

# Test configuration
nginx -t

# Restart NGINX
systemctl restart nginx
```

## 9. Configure SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d sparkletidy.com -d www.sparkletidy.com

# Verify auto-renewal
certbot renew --dry-run
```

## 10. Set Up Domain Records in Hostinger

1. Log in to your Hostinger account
2. Go to the Domains section
3. Click on your domain (sparkletidy.com)
4. Go to DNS / Nameservers
5. Add/Update these records:
   - A record: @ -> YOUR_VPS_IP_ADDRESS
   - A record: www -> YOUR_VPS_IP_ADDRESS

## 11. Verify Your Deployment

Run the domain check script to ensure everything is working correctly:

```bash
# Create and run check-domain.sh
cd /var/www/sparkletidy.com
chmod +x check-domain.sh
./check-domain.sh
```

## 12. Monitor the Application

```bash
# Check application logs
pm2 logs

# Monitor resources
pm2 monit

# View status
pm2 status
```

## 13. Set Up Regular Backups

```bash
# Create backup script
nano /root/backup.sh
```

Add the following content:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --out $BACKUP_DIR/mongodb-$DATE

# Backup application code
cp -r /var/www/sparkletidy.com $BACKUP_DIR/app-$DATE

# Compress backups
cd $BACKUP_DIR
tar -czf sparkletidy-backup-$DATE.tar.gz mongodb-$DATE app-$DATE

# Clean up
rm -rf mongodb-$DATE app-$DATE

# Keep only last 7 backups
ls -t $BACKUP_DIR/sparkletidy-backup-*.tar.gz | tail -n +8 | xargs -r rm
```

Make the script executable and set up a cron job:

```bash
chmod +x /root/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add this line:
# 0 2 * * * /root/backup.sh
```

## Troubleshooting

If your app isn't working correctly, check:

1. Application logs: `pm2 logs`
2. NGINX logs: `tail -f /var/log/nginx/error.log`
3. Connectivity: `./check-domain.sh`
4. MongoDB status: `systemctl status mongod`
5. Node service: `pm2 list` and `pm2 info sparkle-tidy-experts` 