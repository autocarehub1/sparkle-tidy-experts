#!/bin/bash

# Restart Script for Sparkle & Tidy Experts Application
# This script kills any processes running on the specified ports and restarts the application

echo "🔄 Restarting Sparkle & Tidy Experts application..."

# Kill any processes running on the application ports
echo "🛑 Stopping any running processes..."
kill $(lsof -t -i:5003) 2>/dev/null || echo "No process running on port 5003"
kill $(lsof -t -i:3000) 2>/dev/null || echo "No process running on port 3000"
kill $(lsof -t -i:3001) 2>/dev/null || echo "No process running on port 3001"
kill $(lsof -t -i:3002) 2>/dev/null || echo "No process running on port 3002"
kill $(lsof -t -i:3003) 2>/dev/null || echo "No process running on port 3003"

# Give processes time to fully terminate
echo "⏳ Waiting for processes to terminate..."
sleep 2

# Check if any MongoDB server is running locally
echo "🔍 Checking MongoDB status..."
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "⚠️ MongoDB doesn't appear to be running. Starting MongoDB..."
    mongod --dbpath ./data/db &
    sleep 3
fi

# Install dependencies if needed
echo "📦 Checking for dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Check and install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check and install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check and install admin dependencies
if [ ! -d "admin/node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    cd admin && npm install && cd ..
fi

# Start the application
echo "🚀 Starting the application..."
npm run start

echo "✅ Done! The application should now be running."
echo "⚠️ If you encounter any errors, try running the individual components separately:"
echo "  - Backend:  cd backend && npm run dev"
echo "  - Frontend: cd frontend && npm start"
echo "  - Admin:    cd admin && npm start" 