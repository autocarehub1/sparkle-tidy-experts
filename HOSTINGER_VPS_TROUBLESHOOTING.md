# Hostinger VPS Troubleshooting Guide

This guide addresses common issues with Hostinger VPS deployments and how to fix them.

## 1. Website Not Accessible (Cannot Reach www.sparkletidy.com)

### Check DNS Configuration

1. Log into your Hostinger control panel
2. Go to "Domains" > "sparkletidy.com" > "DNS / Nameservers"
3. Verify A records are set up correctly:
   ```
   Type: A Record
   Host: @ (or blank)
   Points to: YOUR_VPS_IP
   TTL: Auto
   
   Type: A Record
   Host: www
   Points to: YOUR_VPS_IP
   TTL: Auto
   ```
4. If any records are missing or incorrect, add or update them

### Check DNS Propagation

DNS changes can take 24-48 hours to propagate globally. You can check propagation status:

```bash
dig sparkletidy.com
dig www.sparkletidy.com
```

Or use [whatsmydns.net](https://www.whatsmydns.net/) to check from multiple locations.

### Test Direct IP Access

Try accessing your site using the IP address directly:

```
http://YOUR_VPS_IP
```

If this works, but the domain doesn't, it's likely a DNS issue.

## 2. Application Not Running

### Check PM2 Status

```bash
pm2 list
```

If your application is not running or shows "errored" status:

```bash
# Stop any errored processes
pm2 delete sparkle-tidy-experts

# Start application with correct configuration
cd /root/sparkle-tidy-experts
pm2 start ecosystem.config.js

# Save the configuration
pm2 save
```

### Check Application Logs

```bash
pm2 logs sparkle-tidy-experts
```

Look for specific error messages that might indicate:
- Missing dependencies
- Configuration issues
- Database connection problems

### Verify Files and Directory Structure

```bash
cd /root/sparkle-tidy-experts
ls -la
```

Ensure all required files are present:
- index.js
- server/index.js
- ecosystem.config.js
- .env
- node_modules/ directory

## 3. Nginx Configuration Issues

### Check Nginx Status

```bash
systemctl status nginx
```

If Nginx is not running:

```bash
# Start Nginx
systemctl start nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

### Verify Nginx Configuration

```bash
nginx -t
```

If there are errors in the configuration, fix them.

### Check Site Configuration

```bash
cat /etc/nginx/sites-available/sparkletidy.com
```

Ensure the configuration is correct and includes:
- Proper server_name directive with both www and non-www
- Correct proxy_pass to your Node.js application
- SSL certificate paths (if using HTTPS)

### Enable Site Configuration

```bash
ln -sf /etc/nginx/sites-available/sparkletidy.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 4. SSL Certificate Issues

### Check Certificate Status

```bash
certbot certificates
```

### Obtain a New Certificate

If certificate is missing or doesn't include both domains:

```bash
# Basic HTTP challenge method
certbot --nginx -d sparkletidy.com -d www.sparkletidy.com

# If that fails, try standalone method
systemctl stop nginx
certbot certonly --standalone -d sparkletidy.com -d www.sparkletidy.com
systemctl start nginx
```

### Update Nginx Configuration After Certificate Installation

```bash
cat > /etc/nginx/sites-available/sparkletidy.com << 'EOL'
server {
    listen 80;
    server_name sparkletidy.com www.sparkletidy.com;
    
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name sparkletidy.com www.sparkletidy.com;
    
    ssl_certificate /etc/letsencrypt/live/sparkletidy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sparkletidy.com/privkey.pem;
    
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

nginx -t
systemctl reload nginx
```

## 5. MongoDB Issues

### Check MongoDB Status

```bash
systemctl status mongod
```

If MongoDB is not running:

```bash
# Start MongoDB
systemctl start mongod

# Enable MongoDB to start on boot
systemctl enable mongod
```

### Check MongoDB Connection in Application

Make sure your `.env` file contains the correct MongoDB URI:

```bash
cat /root/sparkle-tidy-experts/.env
```

It should contain something like:
```
MONGODB_URI=mongodb://localhost:27017/sparkletidy
```

## 6. Port and Firewall Issues

### Check Listening Ports

```bash
netstat -tulpn
```

Verify your application is listening on the expected port (5003).

### Check Firewall Status

```bash
ufw status
```

If ports 80 and 443 are not allowed, add them:

```bash
ufw allow 80
ufw allow 443
```

## 7. Hostinger-Specific Settings

### Check Hostinger Control Panel Settings

1. Log in to your Hostinger control panel
2. Look for VPS management settings
3. Verify that the domain is properly linked to your VPS
4. Check for any Hostinger-specific firewalls or security settings

### Check VPS Default Hostname

Some Hostinger VPS instances have a default hostname (e.g., mediumorchid-crow-841793.hostingersite.com).

Try accessing your website using that hostname to rule out domain-specific issues:
```
http://YOUR-VPS-HOSTNAME.hostingersite.com
```

## 8. Complete Restart Procedure

If all else fails, try this complete restart procedure:

```bash
# Stop and restart the application
pm2 stop all
pm2 delete all
cd /root/sparkle-tidy-experts
pm2 start ecosystem.config.js
pm2 save

# Restart Nginx
systemctl restart nginx

# Restart MongoDB
systemctl restart mongod
```

## 9. Alternative Approach: Using IP Instead of Domain Temporarily

If you're facing persistent domain issues, you can temporarily configure your application to use the IP address:

1. Update your Nginx configuration:
```bash
cat > /etc/nginx/sites-available/default << 'EOL'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/sparkletidy.com
nginx -t
systemctl reload nginx
```

2. Access your website using your VPS IP address:
```
http://YOUR_VPS_IP
```

## 10. Contact Hostinger Support

If you're still experiencing issues, contact Hostinger support:

1. Log in to your Hostinger account
2. Go to the Help section
3. Create a support ticket detailing your issue
4. Provide them with:
   - Your domain name
   - VPS information
   - Error messages you're encountering
   - Steps you've already taken to troubleshoot 