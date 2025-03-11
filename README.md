# Sparkle & Tidy Experts

A professional cleaning service website with an estimate calculator feature. This project includes a React frontend and an Express backend for handling estimate emails.

## Features

- Modern, responsive design
- Interactive cleaning service estimate calculator
- Email functionality for sending estimates to clients
- Service showcase
- Customer testimonials
- Mobile-friendly interface

## Tech Stack

- **Frontend**: React, CSS
- **Backend**: Node.js, Express
- **Email**: Nodemailer

## Project Structure

- `src/` - React frontend code
  - `components/` - Reusable UI components
  - `pages/` - Page components
- `server/` - Express backend code

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
EMAIL_HOST=your-smtp-host
EMAIL_PORT=your-smtp-port
EMAIL_PASSWORD=your-email-password
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will start both the React frontend and Express backend concurrently.

## Available Scripts

- `npm start` - Runs the React frontend
- `npm run server` - Runs the Express backend
- `npm run dev` - Runs both frontend and backend
- `npm run build` - Builds the React app for production

## Deployment

The frontend can be deployed to services like Netlify, Vercel, or GitHub Pages. The backend can be deployed to services like Heroku, Render, or Railway.

## License

MIT 