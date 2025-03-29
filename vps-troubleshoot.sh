#!/bin/bash

# VPS Troubleshooting Script for Sparkle & Tidy Experts

echo "==============================================="
echo "Sparkle & Tidy Experts VPS Troubleshooting Tool"
echo "==============================================="
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# Check if application directory exists
echo "Checking application directory..."
if [ -d "/var/www/sparkletidy.com" ]; then
  echo "✅ Application directory exists"
  ls -la /var/www/sparkletidy.com | head -n 10
else
  echo "❌ Application directory not found at /var/www/sparkletidy.com"
fi
echo

# Check Node.js and npm
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
  node_version=$(node -v)
  echo "✅ Node.js is installed: $node_version"
else
  echo "❌ Node.js is not installed"
fi

if command -v npm &> /dev/null; then
  npm_version=$(npm -v)
  echo "✅ npm is installed: $npm_version"
else
  echo "❌ npm is not installed"
fi
echo

# Check MongoDB status
echo "Checking MongoDB status..."
if systemctl is-active --quiet mongod; then
  echo "✅ MongoDB is running"
  mongo_version=$(mongod --version | head -n 1)
  echo "   $mongo_version"
else
  echo "❌ MongoDB is not running"
  echo "   Attempting to start MongoDB..."
  systemctl start mongod
  if systemctl is-active --quiet mongod; then
    echo "   ✅ MongoDB started successfully"
  else
    echo "   ❌ Failed to start MongoDB"
    echo "   Check the logs: journalctl -u mongod"
  fi
fi
echo

# Check PM2 status
echo "Checking PM2 status..."
if command -v pm2 &> /dev/null; then
  echo "✅ PM2 is installed"
  echo "   PM2 processes:"
  pm2 list | grep -v "Module"
else
  echo "❌ PM2 is not installed"
fi
echo

# Check NGINX status
echo "Checking NGINX status..."
if systemctl is-active --quiet nginx; then
  echo "✅ NGINX is running"
  if [ -f "/etc/nginx/sites-enabled/sparkletidy.com" ]; then
    echo "✅ NGINX site configuration exists"
  else
    echo "❌ NGINX site configuration is missing"
  fi
else
  echo "❌ NGINX is not running"
  echo "   Attempting to start NGINX..."
  systemctl start nginx
  if systemctl is-active --quiet nginx; then
    echo "   ✅ NGINX started successfully"
  else
    echo "   ❌ Failed to start NGINX"
    echo "   Check the logs: journalctl -u nginx"
  fi
fi
echo

# Check domain DNS resolution
echo "Checking domain DNS resolution..."
if command -v host &> /dev/null; then
  echo "Checking sparkletidy.com..."
  host sparkletidy.com || echo "❌ DNS resolution failed for sparkletidy.com"
  
  echo "Checking www.sparkletidy.com..."
  host www.sparkletidy.com || echo "❌ DNS resolution failed for www.sparkletidy.com"
else
  echo "❌ 'host' command not found, install dnsutils package"
fi
echo

# Check SSL certificate
echo "Checking SSL certificate..."
if [ -d "/etc/letsencrypt/live/sparkletidy.com" ]; then
  echo "✅ SSL certificate exists"
  echo "   Certificate details:"
  certbot certificates | grep "Domains\|Expiry"
else
  echo "❌ SSL certificate not found"
  echo "   You might need to run: certbot --nginx -d sparkletidy.com -d www.sparkletidy.com"
fi
echo

# Check application logs
echo "Checking application logs (last 5 lines)..."
if command -v pm2 &> /dev/null; then
  pm2 logs --lines 5 || echo "❌ Failed to retrieve PM2 logs"
else
  echo "❌ PM2 is not installed"
fi
echo

# Check firewall status
echo "Checking firewall status..."
if command -v ufw &> /dev/null; then
  echo "UFW status:"
  ufw status
else
  echo "UFW not installed or other firewall might be in use"
fi
echo

# Check ports
echo "Checking if application port is in use..."
if command -v netstat &> /dev/null; then
  netstat -tuln | grep 5003 || echo "❌ Port 5003 doesn't appear to be in use"
else
  if command -v ss &> /dev/null; then
    ss -tuln | grep 5003 || echo "❌ Port 5003 doesn't appear to be in use"
  else
    echo "❌ Neither netstat nor ss commands available"
  fi
fi
echo

# Check disk space
echo "Checking disk space..."
df -h /
echo

echo "==============================================="
echo "Troubleshooting complete"
echo "For additional help, consult the deployment guide"
echo "If issues persist, contact support at info@sparkletidy.com"
echo "===============================================" 