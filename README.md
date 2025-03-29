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

Update the `VPS_IP` in `deploy.sh` and run:
```
npm run deploy
```

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