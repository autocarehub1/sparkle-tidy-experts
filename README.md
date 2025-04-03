# Sparkle & Tidy Experts

A professional cleaning service website with an estimate calculator, appointment booking, and admin dashboard.

## Project Structure

This project is organized as a monorepo with three main components:

```
sparkle-tidy-experts/
├── backend/         # Node.js Express backend API
├── frontend/        # React frontend client website
├── admin/           # React admin dashboard
├── deploy.sh        # Deployment script
└── package.json     # Root package.json for workspace management
```

### Backend

The backend is a Node.js Express server that provides the API endpoints for the application.

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # Mongoose models
├── routes/          # API routes
├── index.js         # Main entry point
└── package.json     # Backend dependencies
```

### Frontend

The frontend is a React application for the client-facing website.

```
frontend/
├── components/      # React components
├── pages/           # Page components
├── styles/          # CSS files
├── utils/           # Utility functions and API client
├── App.js           # Main App component
├── index.js         # Entry point
└── package.json     # Frontend dependencies
```

### Admin

The admin dashboard is a separate React application for managing the business.

```
admin/
├── components/      # Admin-specific components
├── pages/           # Admin page components
├── styles/          # Admin CSS files
├── utils/           # Admin utility functions
├── App.js           # Admin App component
├── index.js         # Admin entry point
└── package.json     # Admin dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/sparkle-tidy-experts.git
   cd sparkle-tidy-experts
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` file to include your MongoDB URI and other configuration.

### Development

Start all services in development mode:
```
npm start
```

Or start each service individually:
```
npm run start:backend
npm run start:frontend
npm run start:admin
```

### Building for Production

Build all applications:
```
npm run build
```

### Deployment

The project includes two deployment options:

#### 1. Standard Deployment (Legacy)

Update the `VPS_IP` in the old deployment script and run:
```
npm run deploy
```

#### 2. Hostinger Deployment (Recommended)

For Hostinger hosting deployment, we've created a new deployment process:

1. Prepare your production environment file:
   ```bash
   # Review and update production environment settings
   nano backend/.env.production
   ```
   
   Make sure to set:
   - A strong JWT secret
   - Correct MongoDB URI
   - Proper email credentials
   - Production domain settings

2. Create the deployment package:
   ```bash
   ./deploy.sh
   ```
   
   This will:
   - Build the frontend
   - Prepare the backend
   - Create a deployment package in the `dist` directory

3. Upload the package to your Hostinger server:
   ```bash
   # Using SCP (replace with your Hostinger server details)
   scp dist/sparkletidy_*.tar.gz username@your-hostinger-server.com:/home/username/
   ```

4. On the Hostinger server:
   ```bash
   # Extract the package
   tar -xzf sparkletidy_*.tar.gz
   
   # Run the installation script
   cd sparkletidy_*
   ./install.sh
   ```

For detailed instructions, see [DEPLOY_TO_PRODUCTION.md](DEPLOY_TO_PRODUCTION.md)

## Access URLs

- Frontend: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- Backend API: http://localhost:5003

In production:
- Frontend: https://www.sparkletidy.com
- Admin Dashboard: https://admin.sparkletidy.com
- Backend API: https://www.sparkletidy.com/api (same domain with /api path)

## Admin Access

- Username: admin
- Password: sparkletidy2024

## Features

- Estimate calculator for cleaning services
- Appointment scheduling
- Client management
- Contractor management and scheduling
- Financial reporting and analytics
- Company settings and notification management
- Responsive design for all devices 

## Production Setup

### Environment Configuration

The application supports different environment configurations:

- **Development**: Uses `.env` file in backend directory
- **Production**: Uses `.env.production` file in backend directory

The config loads the appropriate environment file based on `NODE_ENV`.

### Domain Configuration

The application is set up to handle:

- Main domain: sparkletidy.com
- WWW subdomain: www.sparkletidy.com
- API subdomain: api.sparkletidy.com (optional)

When deployed on the same domain, the backend serves the frontend static files and handles API requests via the `/api` path.

### Process Management

For production environments, we use PM2 to manage the Node.js process:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
npm run prod:start

# View logs
npm run prod:logs

# Monitor application
npm run prod:monitor
```

### Security Features

The production setup includes:

- Rate limiting for API endpoints
- HTTPS redirection
- WWW redirection
- JWT authentication
- Secure email configuration

## Troubleshooting

### Connection Issues

If you see the error "Could not connect to the server. Please check your internet connection and try again, or contact us directly at info@sparkletidy.com", follow these steps:

1. **Kill any stalled processes**:
   ```bash
   # Run the kill-ports script to free up any blocked ports
   npm run kill-ports
   ```

2. **Check MongoDB Connection**:
   Make sure MongoDB is running on your machine with:
   ```bash
   mongod --dbpath ./data/db
   ```

3. **Check Email Configuration**:
   If you're having email issues, check the `.env` file in the `backend` directory and ensure your email credentials are correct. 
   The system will fall back to Ethereal test accounts if it can't connect to your SMTP server.

   You can test the email configuration separately using:
   ```bash
   cd backend && node test-email.js
   ```
   
   The application is now configured to use Hostinger email with the following settings:
   - Email: info@sparkletidy.com
   - SMTP Server: smtp.hostinger.com
   - Port: 465
   - Secure: true (SSL/TLS)
   
   Make sure your `.env` file has the correct EMAIL_PASSWORD variable set.

4. **Restart Everything**:
   Use the provided restart script to kill any running processes and start fresh:
   ```bash
   ./restart.sh
   ```

5. **Port Conflicts**:
   The application has been enhanced to automatically try alternative ports if the primary ones are in use:
   - If port 5003 is in use, the backend will try port 5004
   - The frontend will automatically detect the changed port and update its connections

6. **Verify Backend Status**:
   You can check if the backend server is running by visiting the health endpoint:
   ```
   http://localhost:5003/api/health
   ```
   or if it's using an alternative port:
   ```
   http://localhost:5004/api/health
   ```
   
   A successful response looks like:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-04-03T15:07:55.645Z",
     "server": {
       "environment": "development",
       "uptime": "125 seconds"
     },
     "database": {
       "status": "connected"
     },
     "email": {
       "status": "configured",
       "provider": "Hostinger"
     }
   }
   ```

7. **Frontend Connection Handling**:
   The frontend has been updated with improved error handling that:
   - Automatically attempts alternative backend ports if the primary one fails
   - Performs health checks on alternative endpoints before switching
   - Provides clearer error messages with retry buttons
   - Uses exponential backoff for retry attempts

### Start Services Individually

If you're still having issues, you can start each service individually:

```bash
# Start backend
cd backend && npm run dev

# In a new terminal, start frontend
cd frontend && npm start

# In a new terminal, start admin
cd admin && npm start
```

This approach helps identify which specific component is causing issues.

### Clear Cache and Reload

If you're experiencing frontend issues:

1. Hard refresh your browser with Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear your browser cache and cookies
3. Try a different browser to rule out browser-specific issues 