#!/bin/bash

# Server Diagnostic Script for Sparkle & Tidy Experts

echo "===== SYSTEM INFORMATION ====="
echo "Hostname: $(hostname)"
echo "IP Address: $(curl -s ifconfig.me)"
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo

echo "===== DISK USAGE ====="
df -h
echo

echo "===== MEMORY USAGE ====="
free -h
echo

echo "===== NODE.JS VERSION ====="
node -v
npm -v
echo

echo "===== MONGODB STATUS ====="
systemctl status mongod | head -10
echo

echo "===== PM2 PROCESSES ====="
pm2 list
echo

echo "===== APPLICATION STATUS ====="
echo "Checking if application is running on port 5003:"
netstat -tulpn | grep 5003
echo
echo "Testing local access to application:"
curl -I http://localhost:5003
echo

echo "===== NGINX STATUS ====="
systemctl status nginx | head -10
echo
echo "Nginx configuration test:"
nginx -t 2>&1
echo

echo "===== NGINX SITES ====="
ls -la /etc/nginx/sites-enabled/
echo

echo "===== SPARKLETIDY.COM CONFIGURATION ====="
if [ -f /etc/nginx/sites-available/sparkletidy.com ]; then
  grep -A 3 "server_name" /etc/nginx/sites-available/sparkletidy.com
else
  echo "File not found: /etc/nginx/sites-available/sparkletidy.com"
fi
echo

echo "===== DNS RESOLUTION ====="
echo "sparkletidy.com resolves to: $(dig +short sparkletidy.com)"
echo "www.sparkletidy.com resolves to: $(dig +short www.sparkletidy.com)"
echo

echo "===== SSL CERTIFICATES ====="
if command -v certbot &> /dev/null; then
  certbot certificates 2>/dev/null
else
  echo "Certbot not installed"
fi
echo

echo "===== FIREWALL STATUS ====="
if command -v ufw &> /dev/null; then
  ufw status
else
  echo "UFW not installed"
fi
echo

echo "===== APPLICATION DIRECTORY ====="
if [ -d /root/sparkle-tidy-experts ]; then
  ls -la /root/sparkle-tidy-experts | head -10
  echo "..."
else
  echo "Directory not found: /root/sparkle-tidy-experts"
fi
echo

echo "===== APPLICATION FILES ====="
if [ -f /root/sparkle-tidy-experts/index.js ]; then
  echo "Root index.js exists"
else
  echo "Root index.js missing"
fi

if [ -f /root/sparkle-tidy-experts/server/index.js ]; then
  echo "Server index.js exists"
else
  echo "Server index.js missing"
fi

if [ -f /root/sparkle-tidy-experts/ecosystem.config.js ]; then
  echo "ecosystem.config.js exists"
else
  echo "ecosystem.config.js missing"
fi

if [ -f /root/sparkle-tidy-experts/.env ]; then
  echo ".env file exists"
else
  echo ".env file missing"
fi
echo

echo "===== RECENT ERRORS ====="
echo "Recent Nginx errors:"
if [ -f /var/log/nginx/error.log ]; then
  tail -n 20 /var/log/nginx/error.log
else
  echo "Nginx error log not found"
fi
echo

echo "===== PM2 LOGS ====="
pm2 logs --lines 20 2>&1
echo

echo "===== DIAGNOSIS COMPLETE =====" 