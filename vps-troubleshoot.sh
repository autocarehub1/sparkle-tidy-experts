#!/bin/bash

# VPS Troubleshooting Script for Sparkle & Tidy Experts

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==============================================="
echo "Sparkle & Tidy Experts VPS Troubleshooting Tool"
echo -e "===============================================${NC}"
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

# Check if application directory exists
echo -e "${YELLOW}Checking application directory...${NC}"
if [ -d "/var/www/sparkletidy.com" ]; then
  echo -e "${GREEN}✅ Application directory exists${NC}"
  ls -la /var/www/sparkletidy.com | head -n 10
else
  echo -e "${RED}❌ Application directory not found at /var/www/sparkletidy.com${NC}"
fi
echo

# Check admin directory exists
echo -e "${YELLOW}Checking admin directory...${NC}"
if [ -d "/var/www/admin.sparkletidy.com" ]; then
  echo -e "${GREEN}✅ Admin directory exists${NC}"
  ls -la /var/www/admin.sparkletidy.com | head -n 10
else
  echo -e "${RED}❌ Admin directory not found at /var/www/admin.sparkletidy.com${NC}"
fi
echo

# Check Node.js and npm
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
  node_version=$(node -v)
  echo -e "${GREEN}✅ Node.js is installed: $node_version${NC}"
else
  echo -e "${RED}❌ Node.js is not installed${NC}"
fi

if command -v npm &> /dev/null; then
  npm_version=$(npm -v)
  echo -e "${GREEN}✅ npm is installed: $npm_version${NC}"
else
  echo -e "${RED}❌ npm is not installed${NC}"
fi
echo

# Check MongoDB status
echo -e "${YELLOW}Checking MongoDB status...${NC}"
if systemctl is-active --quiet mongod; then
  echo -e "${GREEN}✅ MongoDB is running${NC}"
  mongo_version=$(mongod --version | head -n 1)
  echo "   $mongo_version"
else
  echo -e "${RED}❌ MongoDB is not running${NC}"
  echo "   Attempting to start MongoDB..."
  systemctl start mongod
  if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}   ✅ MongoDB started successfully${NC}"
  else
    echo -e "${RED}   ❌ Failed to start MongoDB${NC}"
    echo "   Check the logs: journalctl -u mongod"
  fi
fi
echo

# Check PM2 status
echo -e "${YELLOW}Checking PM2 status...${NC}"
if command -v pm2 &> /dev/null; then
  echo -e "${GREEN}✅ PM2 is installed${NC}"
  echo "   PM2 processes:"
  pm2 list
  
  # Check specific application
  if pm2 list | grep -q "sparkle-tidy"; then
    echo -e "${GREEN}✅ sparkle-tidy application is running in PM2${NC}"
  else
    echo -e "${RED}❌ sparkle-tidy application is not running in PM2${NC}"
    echo "   Attempting to start application..."
    if [ -f "/var/www/sparkletidy.com/server/index.js" ]; then
      cd /var/www/sparkletidy.com && pm2 start server/index.js --name sparkle-tidy
      echo -e "${GREEN}   ✅ Application started${NC}"
    else
      echo -e "${RED}   ❌ Application server file not found${NC}"
    fi
  fi
else
  echo -e "${RED}❌ PM2 is not installed${NC}"
  echo "   Installing PM2..."
  npm install -g pm2
  if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}   ✅ PM2 installed successfully${NC}"
  else
    echo -e "${RED}   ❌ Failed to install PM2${NC}"
  fi
fi
echo

# Check NGINX status
echo -e "${YELLOW}Checking NGINX status...${NC}"
if systemctl is-active --quiet nginx; then
  echo -e "${GREEN}✅ NGINX is running${NC}"
  if [ -f "/etc/nginx/sites-enabled/sparkletidy.com.conf" ]; then
    echo -e "${GREEN}✅ NGINX site configuration exists${NC}"
  else
    echo -e "${RED}❌ NGINX site configuration is missing${NC}"
    
    if [ -f "/var/www/sparkletidy.com/sparkletidy.com.conf" ]; then
      echo "   Found configuration file in application directory. Copying..."
      cp /var/www/sparkletidy.com/sparkletidy.com.conf /etc/nginx/sites-available/
      ln -sf /etc/nginx/sites-available/sparkletidy.com.conf /etc/nginx/sites-enabled/
      
      echo "   Testing NGINX configuration..."
      nginx -t
      
      if [ $? -eq 0 ]; then
        systemctl restart nginx
        echo -e "${GREEN}   ✅ NGINX configuration updated and restarted${NC}"
      else
        echo -e "${RED}   ❌ NGINX configuration test failed${NC}"
      fi
    else
      echo -e "${RED}   ❌ Configuration file not found in application directory${NC}"
    fi
  fi
else
  echo -e "${RED}❌ NGINX is not running${NC}"
  echo "   Attempting to start NGINX..."
  systemctl start nginx
  if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}   ✅ NGINX started successfully${NC}"
  else
    echo -e "${RED}   ❌ Failed to start NGINX${NC}"
    echo "   Check the logs: journalctl -u nginx"
  fi
fi
echo

# Check domain DNS resolution
echo -e "${YELLOW}Checking domain DNS resolution...${NC}"
if command -v host &> /dev/null; then
  echo "Checking sparkletidy.com..."
  host sparkletidy.com && echo -e "${GREEN}✅ DNS resolved for sparkletidy.com${NC}" || echo -e "${RED}❌ DNS resolution failed for sparkletidy.com${NC}"
  
  echo "Checking www.sparkletidy.com..."
  host www.sparkletidy.com && echo -e "${GREEN}✅ DNS resolved for www.sparkletidy.com${NC}" || echo -e "${RED}❌ DNS resolution failed for www.sparkletidy.com${NC}"
  
  echo "Checking api.sparkletidy.com..."
  host api.sparkletidy.com && echo -e "${GREEN}✅ DNS resolved for api.sparkletidy.com${NC}" || echo -e "${RED}❌ DNS resolution failed for api.sparkletidy.com${NC}"
  
  echo "Checking admin.sparkletidy.com..."
  host admin.sparkletidy.com && echo -e "${GREEN}✅ DNS resolved for admin.sparkletidy.com${NC}" || echo -e "${RED}❌ DNS resolution failed for admin.sparkletidy.com${NC}"
else
  echo -e "${RED}❌ 'host' command not found${NC}"
  echo "   Installing dnsutils..."
  apt-get update && apt-get install -y dnsutils
  
  if command -v host &> /dev/null; then
    echo -e "${GREEN}   ✅ dnsutils installed successfully${NC}"
    echo "   Rechecking domain..."
    host sparkletidy.com && echo -e "${GREEN}✅ DNS resolved for sparkletidy.com${NC}" || echo -e "${RED}❌ DNS resolution failed for sparkletidy.com${NC}"
  else
    echo -e "${RED}   ❌ Failed to install dnsutils${NC}"
  fi
fi
echo

# Check SSL certificate
echo -e "${YELLOW}Checking SSL certificate...${NC}"
if [ -d "/etc/letsencrypt/live/sparkletidy.com" ]; then
  echo -e "${GREEN}✅ SSL certificate exists${NC}"
  echo "   Certificate details:"
  certbot certificates | grep "Domains\|Expiry"
else
  echo -e "${RED}❌ SSL certificate not found${NC}"
  echo "   Do you want to install Let's Encrypt SSL certificate now? (y/n)"
  read -r install_ssl
  
  if [ "$install_ssl" = "y" ] || [ "$install_ssl" = "Y" ]; then
    if ! command -v certbot &> /dev/null; then
      echo "   Installing Certbot..."
      apt-get update && apt-get install -y certbot python3-certbot-nginx
    fi
    
    if command -v certbot &> /dev/null; then
      echo "   Running Certbot..."
      certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d api.sparkletidy.com -d admin.sparkletidy.com
    else
      echo -e "${RED}   ❌ Failed to install Certbot${NC}"
    fi
  else
    echo "   Skipping SSL certificate installation"
    echo "   You can run this command later:"
    echo "   certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d api.sparkletidy.com -d admin.sparkletidy.com"
  fi
fi
echo

# Check application logs
echo -e "${YELLOW}Checking application logs (last 10 lines)...${NC}"
if command -v pm2 &> /dev/null; then
  if pm2 list | grep -q "sparkle-tidy"; then
    pm2 logs sparkle-tidy --lines 10 || echo -e "${RED}❌ Failed to retrieve PM2 logs${NC}"
  else
    echo -e "${RED}❌ sparkle-tidy process not found in PM2${NC}"
  fi
else
  echo -e "${RED}❌ PM2 is not installed${NC}"
fi
echo

# Check firewall status
echo -e "${YELLOW}Checking firewall status...${NC}"
if command -v ufw &> /dev/null; then
  ufw status | grep -q "Status: active" && echo -e "${GREEN}✅ UFW is active${NC}" || echo -e "${YELLOW}⚠️ UFW is not active${NC}"
  echo "UFW status:"
  ufw status
  
  # Check if ports 80 and 443 are allowed
  if ufw status | grep -q "80/tcp" && ufw status | grep -q "443/tcp"; then
    echo -e "${GREEN}✅ Ports 80 and 443 are allowed${NC}"
  else
    echo -e "${RED}❌ HTTP/HTTPS ports might not be allowed in the firewall${NC}"
    echo "   Do you want to allow HTTP/HTTPS ports now? (y/n)"
    read -r allow_ports
    
    if [ "$allow_ports" = "y" ] || [ "$allow_ports" = "Y" ]; then
      ufw allow 80/tcp
      ufw allow 443/tcp
      echo -e "${GREEN}   ✅ Ports allowed${NC}"
    else
      echo "   Skipping firewall configuration"
    fi
  fi
else
  echo -e "${YELLOW}⚠️ UFW not installed${NC}"
  echo "   You might be using a different firewall or none at all"
fi
echo

# Check ports
echo -e "${YELLOW}Checking if application port is in use...${NC}"
if command -v netstat &> /dev/null; then
  netstat -tuln | grep 5003 && echo -e "${GREEN}✅ Port 5003 is in use${NC}" || echo -e "${RED}❌ Port 5003 doesn't appear to be in use${NC}"
else
  if command -v ss &> /dev/null; then
    ss -tuln | grep 5003 && echo -e "${GREEN}✅ Port 5003 is in use${NC}" || echo -e "${RED}❌ Port 5003 doesn't appear to be in use${NC}"
  else
    echo -e "${RED}❌ Neither netstat nor ss commands available${NC}"
    echo "   Installing net-tools..."
    apt-get update && apt-get install -y net-tools
    
    if command -v netstat &> /dev/null; then
      netstat -tuln | grep 5003 && echo -e "${GREEN}✅ Port 5003 is in use${NC}" || echo -e "${RED}❌ Port 5003 doesn't appear to be in use${NC}"
    fi
  fi
fi
echo

# Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
df -h / | awk 'NR>1 {print $5}' | grep -q "9[0-9]%" && echo -e "${RED}❌ Disk space critical!${NC}" || echo -e "${GREEN}✅ Disk space looks good${NC}"
df -h /
echo

# Check environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"
if [ -f "/var/www/sparkletidy.com/.env" ]; then
  echo -e "${GREEN}✅ Environment file exists${NC}"
  echo "   Environment variables (redacted):"
  grep -v "^#" /var/www/sparkletidy.com/.env | sed 's/=.*/=****/' || echo "   No variables found"
else
  echo -e "${RED}❌ Environment file not found${NC}"
  echo "   Creating basic environment file..."
  echo "NODE_ENV=production" > /var/www/sparkletidy.com/.env
  echo "MONGODB_URI=mongodb://localhost:27017/sparkletidy" >> /var/www/sparkletidy.com/.env
  echo "PORT=5003" >> /var/www/sparkletidy.com/.env
  echo -e "${GREEN}   ✅ Basic environment file created${NC}"
fi
echo

echo -e "${GREEN}==============================================="
echo "Troubleshooting complete"
echo "For additional help, consult the deployment guide"
echo "If issues persist, contact support at info@sparkletidy.com"
echo -e "===============================================${NC}" 