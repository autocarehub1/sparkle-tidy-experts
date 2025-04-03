# Hostinger Deployment Checklist

Use this checklist to ensure your Sparkle & Tidy Experts application is properly deployed to Hostinger.

## Before Deployment

- [ ] Update `.env.production` with correct values:
  - [ ] Set a strong `JWT_SECRET`
  - [ ] Configure MongoDB URI for production
  - [ ] Set correct Hostinger email credentials
  - [ ] Set proper domain names

- [ ] Test email configuration:
  ```bash
  npm run test:email
  ```

- [ ] Run a production build test:
  ```bash
  npm run deploy:hostinger
  ```

- [ ] Verify that the deployment package was created in the `dist` directory

## Hostinger Account Setup

- [ ] Verify your Hostinger hosting plan supports Node.js
- [ ] Enable Node.js in your Hostinger control panel
- [ ] Set up MongoDB (either on Hostinger or using MongoDB Atlas)
- [ ] Configure your domains and subdomains:
  - [ ] Main domain (sparkletidy.com)
  - [ ] WWW subdomain (www.sparkletidy.com)
  - [ ] Admin subdomain (admin.sparkletidy.com) - if needed

## Deployment Process

- [ ] Upload the deployment package to Hostinger:
  ```bash
  # Using SCP (replace with your Hostinger details)
  scp dist/sparkletidy_*.tar.gz username@your-hostinger-server.com:/home/username/
  ```

- [ ] SSH into your Hostinger server:
  ```bash
  ssh username@your-hostinger-server.com
  ```

- [ ] Extract the deployment package:
  ```bash
  tar -xzf sparkletidy_*.tar.gz
  cd sparkletidy_*
  ```

- [ ] Edit the `.env` file if needed:
  ```bash
  nano backend/.env
  ```

- [ ] Run the installation script:
  ```bash
  ./install.sh
  ```

## Post-Deployment Verification

- [ ] Check if the application is running:
  ```bash
  pm2 status
  ```

- [ ] Verify the API health endpoint:
  ```bash
  curl https://www.sparkletidy.com/api/health
  ```
  
  Expected response:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-04-03T12:00:00.000Z",
    "environment": "production",
    "uptime": "X seconds",
    "database": "connected",
    "email": {
      "status": "configured",
      "provider": "Hostinger"
    }
  }
  ```

- [ ] Test the frontend by visiting:
  - [ ] https://www.sparkletidy.com
  - [ ] https://admin.sparkletidy.com (if applicable)

- [ ] Submit a test estimate form to verify email functionality

## Configuration

- [ ] Set up nginx (if applicable):
  ```bash
  # Edit nginx configuration
  nano /etc/nginx/sites-available/sparkletidy.com.conf
  
  # Enable the site
  ln -sf /etc/nginx/sites-available/sparkletidy.com.conf /etc/nginx/sites-enabled/
  
  # Test configuration
  nginx -t
  
  # Reload nginx
  systemctl reload nginx
  ```

- [ ] Set up SSL certificates:
  ```bash
  # If using Let's Encrypt
  certbot --nginx -d sparkletidy.com -d www.sparkletidy.com -d admin.sparkletidy.com
  ```

## Monitoring and Maintenance

- [ ] Set up PM2 to start on system boot:
  ```bash
  pm2 startup
  pm2 save
  ```

- [ ] Monitor the application:
  ```bash
  pm2 monit
  ```

- [ ] Check logs:
  ```bash
  pm2 logs sparkletidy
  ```

- [ ] Set up a backup strategy for the MongoDB database

## Troubleshooting Common Issues

### Application Won't Start

- Check the logs:
  ```bash
  pm2 logs sparkletidy
  ```

- Verify MongoDB connection:
  ```bash
  mongo mongodb://localhost:27017/sparkletidy_production
  ```

- Check if port 5003 is already in use:
  ```bash
  lsof -i:5003
  ```

### Email Issues

- Verify email settings in `.env` file
- Check if Hostinger is blocking outgoing SMTP
- Test email configuration using the test script:
  ```bash
  cd backend && node test-email.js
  ```

### Frontend Loading Issues

- Check the browser console for errors
- Verify the API URL in the frontend configuration
- Check that static files are being served correctly

### Database Connection Issues

- Verify MongoDB is running
- Check connection string in the `.env` file
- Check if authentication credentials are correct

## Resources

- [Hostinger Node.js Deployment Guide](https://www.hostinger.com/tutorials/how-to-host-node-js-application)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [MongoDB Backup Tutorial](https://docs.mongodb.com/manual/core/backups/)
- [Sparkle & Tidy Experts Deployment Documentation](DEPLOY_TO_PRODUCTION.md) 