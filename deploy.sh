#!/bin/bash

# Deployment script for Sparkle & Tidy Experts website
# Run this script from your local machine

# Configuration - Change these values as needed
VPS_IP="69.62.65.2"  # Replace with your actual VPS IP
VPS_USER="root"
PROJECT_DIR="/Users/emmanueleleruja/Desktop/Development/hackathon_1"
REMOTE_DIR="/var/www/sparkletidy.com"
BUILD_NAME="sparkle-tidy-experts.zip"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Sparkle & Tidy Experts Deployment Script ===${NC}"
echo

# Check if VPS_IP is set
if [ "$VPS_IP" = "YOUR_VPS_IP_ADDRESS" ]; then
  echo -e "${RED}Error: Please edit this script to set your VPS IP address${NC}"
  exit 1
fi

# Function to show a status message
show_status() {
  echo -e "${YELLOW}$1...${NC}"
}

# Function to check command success
check_success() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Success!${NC}"
  else
    echo -e "${RED}Failed!${NC}"
    if [ -n "$1" ]; then
      echo -e "${RED}$1${NC}"
    fi
    if [ "$2" = "exit" ]; then
      exit 1
    fi
  fi
}

# Build the app
show_status "Building the application"
cd "$PROJECT_DIR"

# Build frontend
cd frontend
show_status "Building React frontend"
NODE_ENV=production npm run build
check_success "Failed to build React frontend" "exit"

# Build admin
cd ../admin
show_status "Building React admin dashboard"
NODE_ENV=production npm run build
check_success "Failed to build React admin dashboard" "exit"

# Create zip file with all components
show_status "Creating deployment package"
cd "$PROJECT_DIR"
rm -f "$BUILD_NAME"
zip -r "$BUILD_NAME" server frontend/build admin/build .env package.json package-lock.json -x "*/node_modules/*"
check_success "Failed to create deployment package" "exit"
echo

# Upload to VPS
show_status "Uploading to VPS"
scp "$BUILD_NAME" "$VPS_USER@$VPS_IP:/tmp/"
check_success "Failed to upload to VPS" "exit"
echo

# Execute commands on VPS
show_status "Setting up on VPS"
ssh "$VPS_USER@$VPS_IP" << EOF
  # Create directories if they don't exist
  mkdir -p "$REMOTE_DIR"
  mkdir -p "$REMOTE_DIR/public"
  mkdir -p "/var/www/admin.sparkletidy.com/public"

  # Stop existing PM2 process if running
  if command -v pm2 &>/dev/null; then
    pm2 stop sparkle-tidy 2>/dev/null || true
  fi

  # Backup existing installation if it exists
  if [ -f "$REMOTE_DIR/package.json" ]; then
    BACKUP_DIR="/root/backups/sparkletidy-\$(date +%Y%m%d-%H%M%S)"
    mkdir -p "\$BACKUP_DIR"
    cp -r "$REMOTE_DIR" "\$BACKUP_DIR"
    echo "Backed up existing installation to \$BACKUP_DIR"
  fi

  # Extract files
  echo "Extracting files..."
  unzip -o "/tmp/$BUILD_NAME" -d "$REMOTE_DIR"
  
  # Copy frontend files to NGINX public directory
  echo "Setting up frontend files..."
  cp -r "$REMOTE_DIR/frontend/build/"* "$REMOTE_DIR/public/"
  
  # Copy admin files to NGINX public directory
  echo "Setting up admin files..."
  cp -r "$REMOTE_DIR/admin/build/"* "/var/www/admin.sparkletidy.com/public/"
  
  # Install dependencies
  echo "Installing dependencies..."
  cd "$REMOTE_DIR"
  npm install --production
  
  # Set correct permissions
  chown -R www-data:www-data "$REMOTE_DIR" "/var/www/admin.sparkletidy.com"
  chmod -R 755 "$REMOTE_DIR" "/var/www/admin.sparkletidy.com"
  
  # Setup environment variables
  if [ ! -f "$REMOTE_DIR/.env" ]; then
    echo "NODE_ENV=production" > "$REMOTE_DIR/.env"
    echo "MONGODB_URI=mongodb://localhost:27017/sparkletidy" >> "$REMOTE_DIR/.env"
    echo "PORT=5003" >> "$REMOTE_DIR/.env"
  fi
  
  # Restart app with PM2
  if command -v pm2 &>/dev/null; then
    echo "Starting application with PM2..."
    cd "$REMOTE_DIR"
    pm2 start server/index.js --name sparkle-tidy || pm2 reload sparkle-tidy
    pm2 save
  else
    echo "PM2 not found. Please install PM2 and start the application manually."
  fi
  
  # Check if NGINX is installed and configuration exists
  if command -v nginx &>/dev/null; then
    # Copy NGINX config if it exists in the package
    if [ -f "$REMOTE_DIR/nginx.conf" ]; then
      cp "$REMOTE_DIR/nginx.conf" /etc/nginx/nginx.conf
    fi
    
    if [ -f "$REMOTE_DIR/sparkletidy.com.conf" ]; then
      cp "$REMOTE_DIR/sparkletidy.com.conf" /etc/nginx/sites-available/
      ln -sf /etc/nginx/sites-available/sparkletidy.com.conf /etc/nginx/sites-enabled/
    fi
    
    echo "Testing NGINX configuration..."
    nginx -t
    
    if [ $? -eq 0 ]; then
      echo "Restarting NGINX..."
      systemctl restart nginx
    else
      echo "WARNING: NGINX configuration test failed. Please fix the errors manually."
    fi
  else
    echo "NGINX not found. Please install NGINX and configure it manually."
  fi
  
  # Clean up
  rm "/tmp/$BUILD_NAME"
  
  echo "Deployment completed!"
  
  # Run basic health check
  echo "Running basic health check..."
  curl -s http://localhost:5003/api/test
  if [ $? -eq 0 ]; then
    echo "Application is responding on port 5003"
  else
    echo "WARNING: Application is not responding on port 5003"
  fi
EOF
check_success "VPS setup had issues" 
echo

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Website should now be available at https://www.sparkletidy.com"
echo -e "Admin should now be available at https://admin.sparkletidy.com"
echo -e "API should now be available at https://api.sparkletidy.com"
echo -e ""
echo -e "To check the status, SSH into your VPS and run:"
echo -e "  pm2 logs sparkle-tidy"
echo -e "To troubleshoot issues, run:"
echo -e "  ./vps-troubleshoot.sh"
