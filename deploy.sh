#!/bin/bash

# Sparkle & Tidy Experts Production Deployment Script
# =================================================
# This script builds and prepares the application for production deployment

# Exit on any error
set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function for printing status messages
print_status() {
  echo -e "${GREEN}==> ${1}${NC}"
}

print_warning() {
  echo -e "${YELLOW}==> WARNING: ${1}${NC}"
}

print_error() {
  echo -e "${RED}==> ERROR: ${1}${NC}"
}

# Check if we are in the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  print_error "This script must be run from the project root directory"
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
  print_error "Node.js is not installed. Please install Node.js 14.x or higher."
  exit 1
fi

if ! command_exists npm; then
  print_error "npm is not installed. Please install npm."
  exit 1
fi

# Check node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR_VERSION" -lt 14 ]; then
  print_error "Node.js version is too old. Please use version 14.x or higher. Current version: $NODE_VERSION"
  exit 1
fi

print_status "Using Node.js version: $NODE_VERSION"

# Check for .env.production file
if [ ! -f "backend/.env.production" ]; then
  print_warning "No .env.production file found in backend directory"
  print_warning "Using .env file for production build - this is NOT recommended"
  
  if [ ! -f "backend/.env" ]; then
    print_error "No .env file found in backend directory. Please create one before deploying."
    exit 1
  fi
fi

# Create a deployment directory
DEPLOY_DIR="dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_NAME="sparkletidy_${TIMESTAMP}"
DEPLOY_PATH="${DEPLOY_DIR}/${DEPLOY_NAME}"

print_status "Creating deployment directory: ${DEPLOY_PATH}"
mkdir -p "${DEPLOY_PATH}"

# Build frontend
print_status "Building frontend..."
cd frontend
npm install
npm run build

if [ ! -d "build" ]; then
  print_error "Frontend build failed or build directory not found"
  exit 1
fi

print_status "Frontend build successful"

# Copy frontend build to deployment directory
print_status "Copying frontend build to deployment directory..."
mkdir -p "${DEPLOY_PATH}/public_html"
cp -r build/* "${DEPLOY_PATH}/public_html/"

# Prepare backend
print_status "Preparing backend..."
cd ../backend

print_status "Installing backend dependencies..."
npm install --only=production

# Copy backend files to deployment directory
print_status "Copying backend files to deployment directory..."
mkdir -p "${DEPLOY_PATH}/backend"

# Define files/directories to include
include_files=(
  "config"
  "models"
  "index.js"
  "package.json"
  "package-lock.json"
  "node_modules"
)

# Define files/directories to exclude
exclude_files=(
  "node_modules/.bin"
  "*.test.js"
  "tests"
)

# Copy included files
for item in "${include_files[@]}"; do
  if [ -e "$item" ]; then
    cp -r "$item" "${DEPLOY_PATH}/backend/"
  fi
done

# Copy the appropriate .env file
if [ -f ".env.production" ]; then
  cp .env.production "${DEPLOY_PATH}/backend/.env"
else
  cp .env "${DEPLOY_PATH}/backend/.env"
  print_warning "Copied development .env file instead of .env.production"
fi

print_status "Creating deployment package..."
cd ..
tar -czvf "${DEPLOY_DIR}/sparkletidy_${TIMESTAMP}.tar.gz" -C "${DEPLOY_DIR}" "${DEPLOY_NAME}"

print_status "Deployment package created: ${DEPLOY_DIR}/sparkletidy_${TIMESTAMP}.tar.gz"
print_status "Deploy this package to your Hostinger server"
print_status "Follow the instructions in DEPLOY_TO_PRODUCTION.md for next steps"

# Create a simple installation script to include in the package
cat > "${DEPLOY_PATH}/install.sh" << 'EOF'
#!/bin/bash

# Sparkle & Tidy Experts Installation Script
# ==========================================

set -e

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Installing Sparkle & Tidy Experts...${NC}"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo -e "${YELLOW}==> This script is not running as root. Some operations may fail.${NC}"
fi

# Create necessary directories
echo -e "${GREEN}==> Setting up directories...${NC}"

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Install PM2 if not already installed
if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${GREEN}==> Installing PM2...${NC}"
  npm install -g pm2
fi

# Copy files to appropriate locations
echo -e "${GREEN}==> Copying files...${NC}"

# Set up the backend
echo -e "${GREEN}==> Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend"

# Start the application using PM2
echo -e "${GREEN}==> Starting application with PM2...${NC}"
pm2 start index.js --name "sparkletidy"
pm2 save

echo -e "${GREEN}==> Installation complete!${NC}"
echo -e "${GREEN}==> Your application is now running with PM2${NC}"
echo -e "${GREEN}==> To monitor your application, run: pm2 monit${NC}"
echo -e "${GREEN}==> To view logs, run: pm2 logs sparkletidy${NC}"
EOF

chmod +x "${DEPLOY_PATH}/install.sh"

print_status "Deployment build process completed successfully!"
print_status "Use SCP or SFTP to upload ${DEPLOY_DIR}/sparkletidy_${TIMESTAMP}.tar.gz to your Hostinger server"
print_status "Then extract it and run the install.sh script"
