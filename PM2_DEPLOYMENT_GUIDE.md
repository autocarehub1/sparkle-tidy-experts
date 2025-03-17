# PM2 Deployment Guide for Sparkle & Tidy Experts

## Issue: PM2 Cannot Find Server File

The error `[PM2][ERROR] Script not found: /root/sparkle-tidy-experts/server/server.js` indicates that PM2 is looking for a file that doesn't exist. The correct server file in your application is `server/index.js`, not `server/server.js`.

## Solution

### Option 1: Update PM2 Configuration

1. SSH into your server
2. Navigate to your application directory:
   ```
   cd /root/sparkle-tidy-experts
   ```
3. Stop the current PM2 process:
   ```
   pm2 stop sparkle-tidy-experts
   ```
4. Delete the current PM2 process:
   ```
   pm2 delete sparkle-tidy-experts
   ```
5. Start the application with the correct file path:
   ```
   pm2 start server/index.js --name sparkle-tidy-experts
   ```
6. Save the PM2 configuration:
   ```
   pm2 save
   ```

### Option 2: Use the Ecosystem Config File

1. Upload the `ecosystem.config.js` file to your server in the root directory of your application
2. SSH into your server
3. Navigate to your application directory:
   ```
   cd /root/sparkle-tidy-experts
   ```
4. Stop and delete any existing PM2 processes for your app:
   ```
   pm2 stop sparkle-tidy-experts
   pm2 delete sparkle-tidy-experts
   ```
5. Start your application using the ecosystem file:
   ```
   pm2 start ecosystem.config.js
   ```
6. Save the PM2 configuration:
   ```
   pm2 save
   ```

## Verifying the Deployment

After applying either solution, verify that your application is running correctly:

1. Check the status of your PM2 processes:
   ```
   pm2 list
   ```
2. Check the logs for any errors:
   ```
   pm2 logs sparkle-tidy-experts
   ```
3. Access your application in a web browser to ensure it's working properly

## Troubleshooting

If you encounter any issues:

1. Make sure Node.js and npm are properly installed on your server
2. Verify that all dependencies are installed:
   ```
   npm install
   ```
3. Check that the MongoDB connection is working:
   ```
   pm2 logs sparkle-tidy-experts
   ```
   Look for "MongoDB connected successfully" in the logs
4. Ensure your `.env` file is properly configured with the correct environment variables

## Additional Notes

- The application is configured to run on port 5003 by default
- Make sure this port is open in your server's firewall settings
- If you need to change the port, update it in the `.env` file and in the PM2 configuration 