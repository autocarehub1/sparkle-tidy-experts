# Sparkle & Tidy Experts - Admin Dashboard

This is the admin dashboard for the Sparkle & Tidy Experts cleaning service application. This dashboard provides administrative controls for managing clients, contractors, appointments, services, and business analytics.

## Features

- Secure admin authentication
- Client management
- Contractor management
- Appointment scheduling and management
- Service configuration
- Business analytics and reporting
- System settings

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
2. Navigate to the admin directory: `cd admin`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

### Development

The admin dashboard will be running on [http://localhost:3000](http://localhost:3000)

### Building for Production

To build the app for production, run:

```
npm run build
```

This will create a `build` folder with all the optimized production files.

## Authentication

For development purposes, use the following credentials:

- Email: admin@sparkletidy.com
- Password: admin123

In production, this will be replaced with a proper authentication system.

## Project Structure

- `/src` - Source code
  - `/api` - API service files
  - `/components` - Reusable components
  - `/pages` - Main pages of the application
  - `/styles` - CSS files
  - `App.js` - Main application component
  - `index.js` - Application entry point

## Deployment

The admin dashboard is designed to be deployed alongside the main application. In a production environment, it will be served from the `/admin` path of the main domain.

## License

This project is private and not licensed for public use. 