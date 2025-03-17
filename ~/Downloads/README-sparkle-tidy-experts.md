# Sparkle & Tidy Experts - Cleaning Service Web Application

This README provides instructions for setting up and deploying the Sparkle & Tidy Experts web application.

## Project Overview

Sparkle & Tidy Experts is a full-stack web application for a cleaning service business, featuring:

- Client-facing website with service information and appointment booking
- Admin dashboard for managing clients, contractors, appointments, and business settings
- Financial reporting and business analytics
- Email notifications for appointments and other business events

## Files Included

The following zip files have been created for deployment:

1. **sparkle-tidy-experts.zip**
   - Complete source code (excluding node_modules, .git, and build folders)
   - Useful for development and code review

2. **sparkle-tidy-experts-build.zip**
   - Optimized production build of the React application
   - Ready to be deployed to a static web hosting service

3. **sparkle-tidy-experts-server.zip**
   - Server-side code and configuration files
   - Includes Node.js/Express server and MongoDB models

4. **sparkle-tidy-experts-db-seed.js**
   - Database seed script to populate MongoDB with sample data

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Frontend Deployment

1. Unzip `sparkle-tidy-experts-build.zip`
2. Upload the contents of the build folder to your web hosting service
3. Configure your web server to serve the `index.html` file for all routes

### Backend Deployment

1. Unzip `sparkle-tidy-experts-server.zip` on your server
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure MongoDB is installed and running
4. Update the `.env` file with your production environment variables
5. Start the server:
   ```
   node server/index.js
   ```
   
   Or use a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start server/index.js --name "sparkle-tidy-api"
   ```

### Database Setup

To populate your MongoDB database with sample data:

1. Make sure MongoDB is running
2. Install mongoose if not already installed:
   ```
   npm install mongoose
   ```
3. Run the database seed script:
   ```
   node sparkle-tidy-experts-db-seed.js
   ```

This will create sample data for:
- Company settings
- Notification settings
- Clients
- Contractors
- Transactions
- Feedback

### Development Setup

1. Unzip `sparkle-tidy-experts.zip`
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   This will start both the React frontend and Node.js backend.

## Environment Variables

The `.env` file contains important configuration settings:

```
PORT=5003
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=SparkSpark2024$
MONGODB_URI=mongodb://localhost:27017/sparkletidy
```

Update these values for your production environment.

## Admin Access

To access the admin dashboard:

1. Navigate to `/admin/login`
2. Use the following credentials:
   - Email: admin@sparkletidy.com
   - Password: admin123

## Features

### Client-Facing Website
- Service information and pricing
- Online booking system
- Estimate calculator
- Feedback submission

### Admin Dashboard
- Client management
- Contractor management and scheduling
- Appointment tracking
- Financial reporting
- Business analytics
- Company settings
- Notification settings

## Support

For questions or issues, please contact:

Email: info@sparkletidy.com
Phone: 210-555-1234 