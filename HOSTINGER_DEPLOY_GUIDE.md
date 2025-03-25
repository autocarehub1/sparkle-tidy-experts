# Complete Deployment Guide for Sparkle & Tidy Experts on Hostinger VPS

This guide provides step-by-step instructions to properly deploy your Sparkle & Tidy Experts website on Hostinger VPS.

## 1. Server Setup

### Connect to your VPS
```bash
ssh root@YOUR_VPS_IP
```

### Update the system
```bash
apt update
apt upgrade -y
```

### Install required tools
```bash
apt install -y curl git nginx
```

## 2. Node.js Installation

### Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### Verify Node.js installation
```bash
node -v  # Should show v18.x.x
npm -v   # Should show 8.x.x or higher
```

### Install PM2 globally
```bash
npm install -g pm2
```

## 3. MongoDB Installation

### Install MongoDB 6.0
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB and enable it to start on boot
systemctl start mongod
systemctl enable mongod
```

### Verify MongoDB installation
```bash
mongod --version
systemctl status mongod
```

## 4. Application Deployment

### Create application directory
```bash
mkdir -p /root/sparkle-tidy-experts
```

### Upload your application files to the server
Use SFTP or SCP to upload your application files to `/root/sparkle-tidy-experts`

### Set up directory structure
Your application directory should look like this:
```
/root/sparkle-tidy-experts/
├── build/               # React production build
├── server/              # Server code
│   ├── index.js         # Main server file
│   └── models/          # Database models
├── .env                 # Environment variables
├── ecosystem.config.js  # PM2 configuration
├── index.js             # Root-level entry point
├── package.json         # Project dependencies
└── package-lock.json    # Lock file for dependencies
```

### Install dependencies
```bash
cd /root/sparkle-tidy-experts
npm install
```

### Create .env file
```bash
cat > /root/sparkle-tidy-experts/.env << 'EOL'
PORT=5003
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=YourEmailPassword
MONGODB_URI=mongodb://localhost:27017/sparkletidy
NODE_ENV=production
EOL
```

### Create or update index.js file
```bash
cat > /root/sparkle-tidy-experts/index.js << 'EOL'
/**
 * Root-level entry point for Sparkle & Tidy Experts application
 * This file simply requires the actual server file in the server directory
 */

// Require the main server file
require('./server/index.js');
EOL
```

### Create or update ecosystem.config.js
```bash
cat > /root/sparkle-tidy-experts/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: "sparkle-tidy-experts",
    script: "server/index.js",
    cwd: "/root/sparkle-tidy-experts",
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
EOL
```

## 5. Database Setup

### Seed the database
```bash
cd /root/sparkle-tidy-experts
node sparkle-tidy-experts-db-seed.js
```

## 6. Start Application with PM2

### Start the application
```bash
cd /root/sparkle-tidy-experts
pm2 start ecosystem.config.js
```

### Save PM2 configuration
```bash
pm2 save
```

### Configure PM2 to start on boot
```bash
pm2 startup
```
Run the command that the above displays

### Verify the application is running
```bash
pm2 list
curl http://localhost:5003
```

## 7. Nginx Configuration

### Create Nginx configuration file
```bash
cat > /etc/nginx/sites-available/sparkletidy.com << 'EOL'
server {
    listen 80;
    server_name sparkletidy.com www.sparkletidy.com;
    
    # For Let's Encrypt verification
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sparkletidy.com www.sparkletidy.com;
    
    # SSL certificate paths - will be updated by certbot
    ssl_certificate /etc/letsencrypt/live/sparkletidy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sparkletidy.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    
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
}
EOL
```

### Create directory for Let's Encrypt
```bash
mkdir -p /var/www/html/.well-known/acme-challenge
chmod -R 755 /var/www/html
```

### Enable the site
```bash
ln -sf /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-enabled/
```

### Remove default site
```bash
rm -f /etc/nginx/sites-enabled/default
```

### Test Nginx configuration
```bash
nginx -t
```

### Reload Nginx
```bash
systemctl reload nginx
```

## 8. SSL Certificate Setup

### Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate
```bash
certbot --nginx -d sparkletidy.com -d www.sparkletidy.com
```

Follow the prompts and choose to redirect HTTP to HTTPS

### Verify automatic renewal
```bash
certbot renew --dry-run
```

## 9. DNS Configuration

1. Log in to your Hostinger account
2. Go to "Domains" → select "sparkletidy.com" → "DNS / Nameservers"
3. Make sure you have these two A records:
   - **Host**: @ (or blank) pointing to your VPS IP address
   - **Host**: www pointing to your VPS IP address

## 10. Firewall Configuration

### Set up UFW firewall
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## 11. Test Your Website

### Test the website
```bash
curl -k https://localhost
```

Visit https://sparkletidy.com and https://www.sparkletidy.com in your browser

## 12. Troubleshooting

### Check application logs
```bash
pm2 logs
```

### Check Nginx error logs
```bash
tail -f /var/log/nginx/error.log
```

### Check SSL certificate status
```bash
certbot certificates
```

### Test Nginx configuration
```bash
nginx -t
```

### Check if the application is listening on port 5003
```bash
netstat -tulpn | grep 5003
```

### Restart everything
```bash
pm2 restart all
systemctl restart nginx
```

## 13. Maintenance

### Keep the system updated
```bash
apt update
apt upgrade -y
```

### Update Node.js application
```bash
cd /root/sparkle-tidy-experts
git pull  # If using git
npm install
pm2 restart all
```

### Backup your database regularly
```bash
mongodump --out=/root/backups/mongodb-$(date +%Y-%m-%d)
```

### Backup website files
```bash
cp -r /root/sparkle-tidy-experts /root/backups/sparkle-tidy-experts-$(date +%Y-%m-%d)
``` 