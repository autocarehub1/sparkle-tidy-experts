# Backend Service

## Overview
This is the backend API service for Sparkle & Tidy Experts. It handles all server-side logic including appointment booking, estimate calculations, and email communications.

## Environment Setup
Copy the `.env.example` file to `.env` and fill in the required variables:

```
PORT=5003
MONGO_URI=mongodb://localhost:27017/sparkletidy
NODE_ENV=development

# Email Configuration
EMAIL_USER=info@sparkletidy.com
EMAIL_PASSWORD=your_hostinger_password
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
```

## Email Configuration

The application is configured to use Hostinger email service:

- **Provider**: Hostinger
- **Email Address**: info@sparkletidy.com
- **SMTP Server**: smtp.hostinger.com
- **Port**: 465
- **Security**: SSL/TLS (secure: true)

### Testing Email Configuration

You can test the email configuration without starting the entire application:

```bash
node test-email.js
```

This script will:
1. Connect to the SMTP server
2. Verify the connection
3. Send a test email to the same address (info@sparkletidy.com)
4. Log the results

If the connection fails, the application will automatically fall back to using Ethereal test accounts for development purposes.

### Troubleshooting Email Issues

If emails are not sending properly:

1. Check that your `.env` file has the correct EMAIL_PASSWORD
2. Verify that the Hostinger account doesn't have 2FA enabled for SMTP
3. Make sure port 465 is not blocked by your firewall or network
4. Check the email logs in the console for specific error messages
5. Use the test-email.js script to isolate email issues from other application problems

## API Endpoints

### Health Check
- `GET /api/health` - Check the status of the server, database, and email configuration

### Estimates
- `POST /api/send-estimate` - Calculate an estimate and send it by email

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create a new appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment

### Additional endpoints available for other functionality...

## Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
``` 