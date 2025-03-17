# MongoDB Setup Guide for Sparkle & Tidy Experts

This document provides detailed instructions for setting up the MongoDB database for the Sparkle & Tidy Experts application on Hostinger.

## Database Requirements

- MongoDB version 4.4 or higher
- Database name: `sparkletidy`
- Collections:
  - `clients`
  - `contractors`
  - `transactions`
  - `feedbacks`
  - `notificationsettings`
  - `companysettings`

## Option 1: Restore from Backup

The application backup includes a MongoDB database dump in the `/database-backup` directory. To restore this database:

1. Ensure MongoDB is installed and running on your server
2. Use the `mongorestore` command to restore the database:

```bash
mongorestore --uri="mongodb://username:password@hostname:port/sparkletidy" /path/to/database-backup
```

Replace `username`, `password`, `hostname`, and `port` with your MongoDB connection details.

## Option 2: Use the Seed Script

Alternatively, you can use the included seed script to populate the database with sample data:

1. Ensure MongoDB is installed and running
2. Install the required Node.js dependencies:

```bash
npm install mongoose bcryptjs
```

3. Update the MongoDB connection string in the seed script if necessary:

```javascript
// In sparkle-tidy-experts-db-seed.js
const MONGODB_URI = 'mongodb://localhost:27017/sparkletidy';
// Change to your MongoDB connection string
```

4. Run the seed script:

```bash
node sparkle-tidy-experts-db-seed.js
```

## MongoDB Connection in Application

The application connects to MongoDB using the connection string specified in the `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/sparkletidy
```

Update this value to match your Hostinger MongoDB configuration:

```
MONGODB_URI=mongodb://username:password@hostname:port/sparkletidy
```

## Database Schema

The application uses the following MongoDB schemas:

### Client Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  password: String,
  role: String,
  dateJoined: Date,
  preferences: {
    servicePreferences: [String],
    communicationPreference: String
  },
  paymentMethods: [{
    type: String,
    lastFour: String,
    isDefault: Boolean
  }],
  bookingHistory: [ObjectId],
  isActive: Boolean
}
```

### Contractor Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  password: String,
  role: String,
  skills: [String],
  availability: {
    monday: { available: Boolean, hours: { start: String, end: String } },
    tuesday: { available: Boolean, hours: { start: String, end: String } },
    wednesday: { available: Boolean, hours: { start: String, end: String } },
    thursday: { available: Boolean, hours: { start: String, end: String } },
    friday: { available: Boolean, hours: { start: String, end: String } },
    saturday: { available: Boolean, hours: { start: String, end: String } },
    sunday: { available: Boolean, hours: { start: String, end: String } }
  },
  serviceAreas: [String],
  rating: Number,
  completedJobs: Number,
  paymentDetails: {
    accountType: String,
    accountNumber: String,
    routingNumber: String,
    paypalEmail: String
  },
  documents: {
    idProof: String,
    certification: String,
    backgroundCheck: String
  },
  isVerified: Boolean,
  isActive: Boolean,
  dateJoined: Date
}
```

### Transaction Schema
```javascript
{
  transactionId: String,
  client: {
    clientId: ObjectId,
    name: String,
    email: String,
    phone: String
  },
  service: {
    type: String,
    description: String,
    date: Date,
    duration: Number,
    location: String
  },
  payment: {
    amount: Number,
    method: String,
    status: String,
    date: Date
  },
  contractor: {
    contractorId: ObjectId,
    name: String,
    payoutAmount: Number,
    payoutStatus: String
  },
  tax: {
    amount: Number,
    rate: Number
  },
  discount: {
    code: String,
    amount: Number,
    percentage: Number
  },
  refund: {
    amount: Number,
    reason: String,
    date: Date,
    status: String
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

If you encounter issues with the MongoDB connection:

1. Verify that MongoDB is running and accessible
2. Check that the connection string in the `.env` file is correct
3. Ensure that the database user has appropriate permissions
4. Check MongoDB logs for any errors
5. Verify that the required collections exist in the database

For further assistance, please contact info@sparkletidy.com. 