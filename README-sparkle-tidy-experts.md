# Sparkle & Tidy Experts - Deployment Guide

## Project Overview
Sparkle & Tidy Experts is a comprehensive web application for a cleaning service business. The application includes a client-facing website and an admin dashboard for managing bookings, clients, contractors, services, and financial reports.

## Files Included
1. `sparkle-tidy-experts.zip` - Complete source code for development
2. `sparkle-tidy-experts-build.zip` - Optimized production build of the React application
3. `sparkle-tidy-experts-server.zip` - Server-side code and configuration files
4. `sparkle-tidy-experts-db-seed.js` - Database seed script for populating MongoDB with sample data

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Frontend Deployment (Production)
1. Extract the `sparkle-tidy-experts-build.zip` file to your web server's public directory
2. Configure your web server (Apache, Nginx, etc.) to serve the static files
3. Set up URL rewriting to handle React Router paths

### Backend Deployment
1. Extract the `sparkle-tidy-experts-server.zip` file to your server
2. Navigate to the extracted directory
3. Install dependencies:
   ```
   npm install
   ```
4. Update the `.env` file with your environment-specific settings
5. Start the server:
   ```
   npm start
   ```

### Development Setup
1. Extract the `sparkle-tidy-experts.zip` file
2. Navigate to the extracted directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Database Setup
1. Ensure MongoDB is installed and running
2. Copy the `sparkle-tidy-experts-db-seed.js` file to a directory of your choice
3. Install required dependencies:
   ```
   npm install mongoose bcryptjs
   ```
4. Run the seed script to populate the database with sample data:
   ```
   node sparkle-tidy-experts-db-seed.js
   ```

## Environment Variables
The application uses the following environment variables that should be configured in the `.env` file:

```
PORT=5003
MONGODB_URI=mongodb://localhost:27017/sparkletidy
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Make sure to update these values for your production environment.

## Admin Access
To access the admin dashboard, use the following credentials:

- **URL**: http://your-domain.com/admin
- **Email**: admin@sparkletidy.com
- **Password**: admin123

It's highly recommended to change these credentials after the first login.

## Features

### Client-Facing Website
- Home page with service overview
- Service details and pricing
- Online booking system
- Client registration and login
- Client dashboard for managing bookings
- Contact form and information

### Admin Dashboard
- Overview dashboard with key metrics
- Client management
- Contractor management
- Service management
- Booking management
- Financial reports
- Business analytics
- Settings and configuration

## Database Structure
The application uses MongoDB with the following collections:
- Clients
- Contractors
- Transactions
- Feedback
- NotificationSettings
- CompanySettings

The database seed script (`sparkle-tidy-experts-db-seed.js`) provides sample data for all these collections.

## API Endpoints
The backend provides RESTful API endpoints for all functionality, including:
- Authentication and user management
- Client and contractor management
- Service and booking management
- Financial transactions and reporting
- Feedback and ratings

## Customization
To customize the application for your business:
1. Update the company information in the CompanySettings collection
2. Modify the service types and pricing in the services collection
3. Update the logo and branding elements in the frontend code
4. Customize email templates in the server/templates directory

## Support
For any issues or questions regarding deployment or usage, please contact:
- Email: support@sparkletidy.com
- Phone: (555) 123-4567

## License
This application is licensed for use by Sparkle & Tidy Experts only. Unauthorized distribution or use is prohibited. 