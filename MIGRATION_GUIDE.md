# Sparkle & Tidy Experts - Migration Guide for Hostinger

## Application Overview
Sparkle & Tidy Experts is a MERN stack application (MongoDB, Express, React, Node.js) for a cleaning service business. The application includes a client-facing website and an admin dashboard for managing bookings, clients, contractors, services, and financial reports.

## Backup Contents
The backup file `sparkle-tidy-experts-complete-backup.zip` contains:
1. Frontend React application (in `/src` directory)
2. Backend Node.js/Express server (in `/server` directory)
3. MongoDB database backup (in `/database-backup` directory)
4. Configuration files (package.json, .env, etc.)

## Technical Requirements

### Server Requirements
- Node.js v14 or higher
- MongoDB v4.4 or higher
- npm or yarn package manager

### Environment Variables
The application uses the following environment variables that should be configured:

```
PORT=5003
MONGODB_URI=mongodb://localhost:27017/sparkletidy
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=YourEmailPassword
```

Please update these values according to your Hostinger environment, especially the MongoDB connection string.

## Database Setup
The MongoDB database backup is included in the `/database-backup` directory. This needs to be restored to your MongoDB instance using the `mongorestore` command:

```
mongorestore --uri="your_mongodb_connection_string" /path/to/database-backup
```

Alternatively, you can use the included seed script to populate the database with sample data:

```
node sparkle-tidy-experts-db-seed.js
```

## Deployment Instructions

### Backend Deployment
1. Install dependencies:
   ```
   npm install
   ```
2. Update the `.env` file with your Hostinger-specific settings
3. Start the server:
   ```
   node server/index.js
   ```
   
   For production, we recommend using PM2:
   ```
   npm install -g pm2
   pm2 start server/index.js --name sparkle-tidy-experts
   ```

### Frontend Deployment
For production deployment, build the React application:

```
npm run build
```

This will create a `build` directory with optimized static files that can be served by your web server.

## Application Structure

### Frontend (React)
- `/src`: React application source code
  - `/components`: UI components
  - `/pages`: Page components
  - `/components/admin`: Admin dashboard components

### Backend (Node.js/Express)
- `/server`: Backend server code
  - `/server/index.js`: Main server file
  - `/server/models`: MongoDB schema models

### Database (MongoDB)
The application uses MongoDB with the following collections:
- Clients
- Contractors
- Transactions
- Feedback
- NotificationSettings
- CompanySettings

## Additional Notes
- The application uses port 5003 for the backend API and port 3000 for the development frontend server
- In production, the frontend build should be served by a web server (Nginx, Apache, etc.)
- The application requires CORS to be properly configured if the frontend and backend are on different domains

## Contact Information
For any questions or issues during migration, please contact:
- Email: info@sparkletidy.com

Thank you for your assistance with this migration! 