#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Sparkle & Tidy Experts NGINX Setup Script ===${NC}"
echo

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled /var/www/html

# Create directories for websites
echo -e "${YELLOW}Creating website directories...${NC}"
mkdir -p /var/www/sparkletidy.com/public
mkdir -p /var/www/admin.sparkletidy.com/public

# Copy NGINX configuration
echo -e "${YELLOW}Copying NGINX configuration files...${NC}"
cp nginx.conf /etc/nginx/nginx.conf
cp sparkletidy.com.conf /etc/nginx/sites-available/sparkletidy.com.conf

# Create symbolic link
echo -e "${YELLOW}Creating symbolic link...${NC}"
ln -sf /etc/nginx/sites-available/sparkletidy.com.conf /etc/nginx/sites-enabled/sparkletidy.com.conf

# Check NGINX configuration
echo -e "${YELLOW}Testing NGINX configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}NGINX configuration test passed!${NC}"
    echo -e "${YELLOW}Restarting NGINX...${NC}"
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}NGINX restarted successfully!${NC}"
    else
        echo -e "${RED}Failed to restart NGINX. Please check the logs.${NC}"
    fi
else
    echo -e "${RED}NGINX configuration test failed. Please fix the errors and try again.${NC}"
fi

echo
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Obtain SSL certificates using Let's Encrypt:"
echo "   certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d api.sparkletidy.com -d admin.sparkletidy.com"
echo "2. Make sure your DNS records are properly configured:"
echo "   - A record for sparkletidy.com pointing to your server IP"
echo "   - A record for www.sparkletidy.com pointing to your server IP"
echo "   - A record for api.sparkletidy.com pointing to your server IP"
echo "   - A record for admin.sparkletidy.com pointing to your server IP"
echo "3. Upload your website files to /var/www/sparkletidy.com/public"
echo "4. Upload your admin dashboard files to /var/www/admin.sparkletidy.com/public"
echo "5. Make sure your Node.js application is running on ports 5003 (main) and 3001 (admin)"
echo 