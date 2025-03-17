# Sparkle & Tidy Experts - Hostinger Migration README

## IMPORTANT: This is a MERN Stack Application

Dear Hostinger Migration Team,

Thank you for assisting with the migration of the Sparkle & Tidy Experts web application. This is a **MERN stack application** (MongoDB, Express, React, Node.js) and **not a WordPress site**. It requires specific setup for both the frontend and backend components, as well as a MongoDB database.

## Complete Backup Package

The `sparkle-tidy-experts-complete-backup.zip` file contains:

1. **Frontend**: React application code in `/src` directory
2. **Backend**: Node.js/Express server in `/server` directory
3. **Database**: MongoDB database backup in `/database-backup` directory
4. **Documentation**:
   - `MIGRATION_GUIDE.md`: Comprehensive migration instructions
   - `MONGODB_SETUP.md`: Detailed MongoDB setup guide
   - `README.md`: General application information

## Migration Requirements

This application requires:

1. **Node.js hosting environment** (v14+)
2. **MongoDB database** (v4.4+)
3. **Web server** for serving static files (Nginx/Apache)

## Quick Start Guide

1. Extract the backup zip file to your preferred location
2. Set up MongoDB using the instructions in `MONGODB_SETUP.md`
3. Update the `.env` file with Hostinger-specific settings
4. Install dependencies: `npm install`
5. Build the frontend: `npm run build`
6. Start the server: `node server/index.js` (or use PM2 for production)

## Contact Information

If you have any questions or need clarification during the migration process, please contact:

- **Email**: info@sparkletidy.com
- **Subject**: Hostinger Migration Support

Thank you for your assistance!

---

**Note**: This is not a WordPress site and cannot be migrated using WordPress migration tools. It requires a Node.js hosting environment with MongoDB database support. 