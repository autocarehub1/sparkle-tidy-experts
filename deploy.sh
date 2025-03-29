#!/bin/bash

# Deployment script for Sparkle & Tidy Experts website
# Run this script from your local machine

# Configuration - Change these values as needed
VPS_IP="YOUR_VPS_IP_ADDRESS"
VPS_USER="root"
PROJECT_DIR="/Users/emmanueleleruja/Desktop/Development/hackathon_1"
REMOTE_DIR="/var/www/sparkletidy.com"
BACKEND_NAME="sparkle-tidy-experts-backend.zip"
FRONTEND_NAME="sparkle-tidy-experts-frontend.zip"
ADMIN_NAME="sparkle-tidy-experts-admin.zip"

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

# Build React frontend
show_status "Building React frontend"
cd "$PROJECT_DIR/frontend"
NODE_ENV=production npm run build
check_success "Failed to build React frontend" "exit"
echo

# Build React admin dashboard
show_status "Building React admin dashboard"
cd "$PROJECT_DIR/admin"
NODE_ENV=production npm run build
check_success "Failed to build React admin dashboard" "exit"
echo

# Create zip files
show_status "Creating zip files"
cd "$PROJECT_DIR/backend"
rm -f "../$BACKEND_NAME"
zip -r "../$BACKEND_NAME" . -x "node_modules/*"

cd "$PROJECT_DIR/frontend"
rm -f "../$FRONTEND_NAME"
zip -r "../$FRONTEND_NAME" build

cd "$PROJECT_DIR/admin"
rm -f "../$ADMIN_NAME"
zip -r "../$ADMIN_NAME" build
check_success "Failed to create zip files" "exit"
echo

# Upload to VPS
show_status "Uploading to VPS"
cd "$PROJECT_DIR"
scp "$BACKEND_NAME" "$FRONTEND_NAME" "$ADMIN_NAME" "$VPS_USER@$VPS_IP:/tmp/"
check_success "Failed to upload to VPS" "exit"
echo

# Execute commands on VPS
show_status "Setting up on VPS"
ssh "$VPS_USER@$VPS_IP" << EOF
  # Check if directory exists
  if [ ! -d "$REMOTE_DIR" ]; then
    mkdir -p "$REMOTE_DIR"
  fi

  mkdir -p "$REMOTE_DIR/backend" "$REMOTE_DIR/frontend" "$REMOTE_DIR/admin"

  # Stop existing PM2 process if running
  if command -v pm2 &>/dev/null; then
    pm2 stop sparkle-tidy-experts 2>/dev/null || true
  fi

  # Backup existing installation if it exists
  if [ -f "$REMOTE_DIR/backend/package.json" ]; then
    BACKUP_DIR="/root/backups/sparkletidy-\$(date +%Y%m%d-%H%M%S)"
    mkdir -p "\$BACKUP_DIR"
    cp -r "$REMOTE_DIR" "\$BACKUP_DIR"
    echo "Backed up existing installation to \$BACKUP_DIR"
  fi

  # Extract backend zip file
  echo "Extracting backend files..."
  unzip -o "/tmp/$BACKEND_NAME" -d "$REMOTE_DIR/backend"
  
  # Extract frontend zip file
  echo "Extracting frontend files..."
  unzip -o "/tmp/$FRONTEND_NAME" -d "$REMOTE_DIR/frontend"
  
  # Extract admin zip file
  echo "Extracting admin files..."
  unzip -o "/tmp/$ADMIN_NAME" -d "$REMOTE_DIR/admin"
  
  # Install dependencies
  echo "Installing backend dependencies..."
  cd "$REMOTE_DIR/backend"
  npm install --production
  
  # Set correct permissions
  chown -R www-data:www-data "$REMOTE_DIR"
  chmod -R 755 "$REMOTE_DIR"
  
  # Restart app with PM2
  if command -v pm2 &>/dev/null; then
    echo "Starting application with PM2..."
    cd "$REMOTE_DIR/backend"
    pm2 start index.js --name sparkle-tidy-experts || pm2 reload sparkle-tidy-experts
    pm2 save
  else
    echo "PM2 not found. Please install PM2 and start the application manually."
  fi
  
  # Restart NGINX if it exists
  if command -v nginx &>/dev/null; then
    echo "Restarting NGINX..."
    systemctl restart nginx
  fi
  
  # Clean up
  rm "/tmp/$BACKEND_NAME" "/tmp/$FRONTEND_NAME" "/tmp/$ADMIN_NAME"
  
  echo "Deployment completed!"
  
  # Run basic health check
  echo "Running basic health check..."
  curl -s http://localhost:5003/ > /dev/null
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
echo -e "To check the status, SSH into your VPS and run:"
echo -e "  cd $REMOTE_DIR/backend && pm2 logs sparkle-tidy-experts"
echo -e "To troubleshoot issues, run:"
echo -e "  cd $REMOTE_DIR && ./vps-troubleshoot.sh"
