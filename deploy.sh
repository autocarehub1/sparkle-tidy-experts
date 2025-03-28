#!/bin/bash
echo "pulling latest changes from GitHub..."
git pull origin master  # Change 'main' to your branch if different

echo "Installing dependencies..."
npm install  # For Node.js
# pip install -r requirements.txt  # For Python apps
# composer install  # For PHP apps

echo "Building the app..."
npm run build  # If needed

echo "Restarting the app..."
pm2 restart all  # For Node.js apps
# systemctl restart myapp  # For Python apps using systemd

echo "Deployment completed!"
