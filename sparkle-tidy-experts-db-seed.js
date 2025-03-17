/**
 * Database Seed Script for Sparkle & Tidy Experts
 * 
 * This script populates the MongoDB database with sample data for all collections
 * used in the application. It creates sample clients, contractors, transactions,
 * feedback, notification settings, and company settings.
 * 
 * Usage: 
 * 1. Make sure MongoDB is running
 * 2. Run this script with Node.js: node sparkle-tidy-experts-db-seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/sparkletidy';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define Schemas
const companySettingsSchema = new mongoose.Schema({
  companyName: String,
  logo: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  serviceAreas: [String],
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
});

const notificationSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: {
    newBooking: { type: Boolean, default: true },
    bookingReminder: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true }
  },
  sms: {
    newBooking: { type: Boolean, default: false },
    bookingReminder: { type: Boolean, default: false },
    promotions: { type: Boolean, default: false }
  },
  pushNotifications: {
    newBooking: { type: Boolean, default: true },
    bookingReminder: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false }
  }
});

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  dateJoined: { type: Date, default: Date.now },
  preferences: {
    servicePreferences: [String],
    communicationPreference: { type: String, enum: ['email', 'phone', 'sms'], default: 'email' }
  },
  paymentMethods: [{
    type: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'] },
    lastFour: String,
    isDefault: Boolean
  }],
  bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  isActive: { type: Boolean, default: true }
});

const contractorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  password: { type: String, required: true },
  role: { type: String, default: 'contractor' },
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
  rating: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
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
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  dateJoined: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
  service: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  date: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: true }
});

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  client: {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    name: String,
    email: String,
    phone: String
  },
  service: {
    type: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    duration: Number,
    location: String
  },
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, enum: ['credit_card', 'paypal', 'cash', 'bank_transfer'] },
    status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'pending' },
    date: { type: Date }
  },
  contractor: {
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
    name: String,
    payoutAmount: Number,
    payoutStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
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
    status: { type: String, enum: ['pending', 'completed', 'rejected'] }
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);
const Client = mongoose.model('Client', clientSchema);
const Contractor = mongoose.model('Contractor', contractorSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Sample Data
const sampleCompanySettings = {
  companyName: 'Sparkle & Tidy Experts',
  logo: 'https://example.com/logo.png',
  contactEmail: 'contact@sparkletidy.com',
  contactPhone: '(555) 123-4567',
  address: '123 Cleaning Ave, San Antonio, TX 78254',
  socialMedia: {
    facebook: 'https://facebook.com/sparkletidy',
    instagram: 'https://instagram.com/sparkletidy',
    twitter: 'https://twitter.com/sparkletidy'
  },
  serviceAreas: ['San Antonio', 'Austin', 'Houston', 'Dallas'],
  businessHours: {
    monday: { open: '08:00', close: '18:00' },
    tuesday: { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' },
    thursday: { open: '08:00', close: '18:00' },
    friday: { open: '08:00', close: '18:00' },
    saturday: { open: '09:00', close: '16:00' },
    sunday: { open: 'Closed', close: 'Closed' }
  }
};

// Generate sample clients
const generateSampleClients = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const sampleClients = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 111-2222',
      address: {
        street: '456 Residential St',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78255'
      },
      password: hashedPassword,
      preferences: {
        servicePreferences: ['Deep Cleaning', 'Regular Maintenance'],
        communicationPreference: 'email'
      },
      paymentMethods: [
        {
          type: 'credit_card',
          lastFour: '4242',
          isDefault: true
        }
      ],
      isActive: true
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(555) 333-4444',
      address: {
        street: '789 Home Ave',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78230'
      },
      password: hashedPassword,
      preferences: {
        servicePreferences: ['Move-in/Move-out Cleaning', 'Window Cleaning'],
        communicationPreference: 'phone'
      },
      paymentMethods: [
        {
          type: 'paypal',
          lastFour: '',
          isDefault: true
        }
      ],
      isActive: true
    },
    {
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '(555) 555-6666',
      address: {
        street: '101 Condo Lane',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301'
      },
      password: hashedPassword,
      preferences: {
        servicePreferences: ['Regular Maintenance', 'Carpet Cleaning'],
        communicationPreference: 'sms'
      },
      paymentMethods: [
        {
          type: 'bank_transfer',
          lastFour: '9876',
          isDefault: true
        }
      ],
      isActive: true
    }
  ];
  
  return sampleClients;
};

// Generate sample contractors
const generateSampleContractors = async () => {
  const hashedPassword = await bcrypt.hash('contractor123', 10);
  
  const sampleContractors = [
    {
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      phone: '(555) 777-8888',
      address: {
        street: '222 Worker St',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78240'
      },
      password: hashedPassword,
      skills: ['Deep Cleaning', 'Regular Maintenance', 'Window Cleaning'],
      availability: {
        monday: { available: true, hours: { start: '09:00', end: '17:00' } },
        tuesday: { available: true, hours: { start: '09:00', end: '17:00' } },
        wednesday: { available: true, hours: { start: '09:00', end: '17:00' } },
        thursday: { available: true, hours: { start: '09:00', end: '17:00' } },
        friday: { available: true, hours: { start: '09:00', end: '17:00' } },
        saturday: { available: false, hours: { start: '', end: '' } },
        sunday: { available: false, hours: { start: '', end: '' } }
      },
      serviceAreas: ['San Antonio', 'Austin'],
      rating: 4.8,
      completedJobs: 156,
      paymentDetails: {
        accountType: 'checking',
        accountNumber: '****5678',
        routingNumber: '****1234',
        paypalEmail: ''
      },
      documents: {
        idProof: 'id_proof_maria.jpg',
        certification: 'certification_maria.pdf',
        backgroundCheck: 'background_maria.pdf'
      },
      isVerified: true,
      isActive: true
    },
    {
      name: 'David Wilson',
      email: 'david@example.com',
      phone: '(555) 999-0000',
      address: {
        street: '333 Cleaner Ave',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78245'
      },
      password: hashedPassword,
      skills: ['Move-in/Move-out Cleaning', 'Carpet Cleaning', 'Deep Cleaning'],
      availability: {
        monday: { available: true, hours: { start: '08:00', end: '16:00' } },
        tuesday: { available: true, hours: { start: '08:00', end: '16:00' } },
        wednesday: { available: true, hours: { start: '08:00', end: '16:00' } },
        thursday: { available: true, hours: { start: '08:00', end: '16:00' } },
        friday: { available: true, hours: { start: '08:00', end: '16:00' } },
        saturday: { available: true, hours: { start: '10:00', end: '14:00' } },
        sunday: { available: false, hours: { start: '', end: '' } }
      },
      serviceAreas: ['San Antonio'],
      rating: 4.6,
      completedJobs: 89,
      paymentDetails: {
        accountType: 'savings',
        accountNumber: '****4321',
        routingNumber: '****5678',
        paypalEmail: ''
      },
      documents: {
        idProof: 'id_proof_david.jpg',
        certification: 'certification_david.pdf',
        backgroundCheck: 'background_david.pdf'
      },
      isVerified: true,
      isActive: true
    }
  ];
  
  return sampleContractors;
};

// Generate sample transactions
const generateSampleTransactions = (clients, contractors) => {
  const sampleTransactions = [];
  
  // Helper function to generate random date within the last 3 months
  const getRandomDate = () => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    return new Date(threeMonthsAgo.getTime() + Math.random() * (Date.now() - threeMonthsAgo.getTime()));
  };
  
  // Helper function to generate random transaction ID
  const generateTransactionId = () => {
    return 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  };
  
  // Generate 20 sample transactions
  for (let i = 0; i < 20; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const contractor = contractors[Math.floor(Math.random() * contractors.length)];
    const serviceTypes = ['Deep Cleaning', 'Regular Maintenance', 'Move-in/Move-out Cleaning', 'Window Cleaning', 'Carpet Cleaning'];
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    
    // Generate random amount between $80 and $300
    const amount = Math.floor(80 + Math.random() * 220);
    
    // Calculate tax (8.25% for Texas)
    const taxRate = 0.0825;
    const taxAmount = parseFloat((amount * taxRate).toFixed(2));
    
    // Calculate contractor payout (70% of pre-tax amount)
    const payoutAmount = parseFloat((amount * 0.7).toFixed(2));
    
    // Random payment methods
    const paymentMethods = ['credit_card', 'paypal', 'cash', 'bank_transfer'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Random payment status with weighted distribution
    const paymentStatusOptions = ['completed', 'completed', 'completed', 'completed', 'pending', 'refunded', 'failed'];
    const paymentStatus = paymentStatusOptions[Math.floor(Math.random() * paymentStatusOptions.length)];
    
    // Random payout status based on payment status
    let payoutStatus = 'pending';
    if (paymentStatus === 'completed') {
      const payoutOptions = ['completed', 'completed', 'completed', 'pending'];
      payoutStatus = payoutOptions[Math.floor(Math.random() * payoutOptions.length)];
    } else if (paymentStatus === 'refunded' || paymentStatus === 'failed') {
      payoutStatus = 'failed';
    }
    
    // Generate transaction date
    const transactionDate = getRandomDate();
    
    // Create transaction object
    const transaction = {
      transactionId: generateTransactionId(),
      client: {
        clientId: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone
      },
      service: {
        type: serviceType,
        description: `${serviceType} service for ${client.name}`,
        date: transactionDate,
        duration: Math.floor(2 + Math.random() * 4), // 2-5 hours
        location: `${client.address.street}, ${client.address.city}, ${client.address.state} ${client.address.zipCode}`
      },
      payment: {
        amount: amount,
        method: paymentMethod,
        status: paymentStatus,
        date: transactionDate
      },
      contractor: {
        contractorId: contractor._id,
        name: contractor.name,
        payoutAmount: payoutAmount,
        payoutStatus: payoutStatus
      },
      tax: {
        amount: taxAmount,
        rate: taxRate
      },
      discount: {
        code: Math.random() > 0.8 ? 'WELCOME10' : '',
        amount: Math.random() > 0.8 ? parseFloat((amount * 0.1).toFixed(2)) : 0,
        percentage: Math.random() > 0.8 ? 10 : 0
      },
      refund: {
        amount: paymentStatus === 'refunded' ? amount : 0,
        reason: paymentStatus === 'refunded' ? 'Customer dissatisfaction' : '',
        date: paymentStatus === 'refunded' ? new Date(transactionDate.getTime() + 86400000) : null, // 1 day after transaction
        status: paymentStatus === 'refunded' ? 'completed' : null
      },
      notes: '',
      createdAt: transactionDate,
      updatedAt: transactionDate
    };
    
    sampleTransactions.push(transaction);
  }
  
  return sampleTransactions;
};

// Generate sample feedback
const generateSampleFeedback = (clients, contractors, transactions) => {
  const sampleFeedback = [];
  
  // Generate feedback for completed transactions
  const completedTransactions = transactions.filter(t => t.payment.status === 'completed');
  
  for (const transaction of completedTransactions) {
    // Only generate feedback for 80% of completed transactions
    if (Math.random() > 0.2) {
      const rating = Math.floor(3 + Math.random() * 3); // Ratings between 3-5
      
      const feedback = {
        client: transaction.client.clientId,
        contractor: transaction.contractor.contractorId,
        service: transaction.service.type,
        rating: rating,
        comment: rating >= 4 
          ? 'Great service! Very professional and thorough.' 
          : 'Service was okay, but could have been more thorough.',
        date: new Date(transaction.service.date.getTime() + 86400000 * 2), // 2 days after service
        isPublic: true
      };
      
      sampleFeedback.push(feedback);
    }
  }
  
  return sampleFeedback;
};

// Generate notification settings
const generateNotificationSettings = (clients, contractors) => {
  const notificationSettings = [];
  
  // For clients
  for (const client of clients) {
    notificationSettings.push({
      userId: client._id,
      email: {
        newBooking: true,
        bookingReminder: true,
        promotions: Math.random() > 0.3 // 70% opt-in for promotions
      },
      sms: {
        newBooking: Math.random() > 0.5, // 50% opt-in for SMS
        bookingReminder: Math.random() > 0.5,
        promotions: Math.random() > 0.7 // 30% opt-in for SMS promotions
      },
      pushNotifications: {
        newBooking: true,
        bookingReminder: true,
        promotions: Math.random() > 0.5 // 50% opt-in for push promotions
      }
    });
  }
  
  // For contractors
  for (const contractor of contractors) {
    notificationSettings.push({
      userId: contractor._id,
      email: {
        newBooking: true,
        bookingReminder: true,
        promotions: false
      },
      sms: {
        newBooking: true,
        bookingReminder: true,
        promotions: false
      },
      pushNotifications: {
        newBooking: true,
        bookingReminder: true,
        promotions: false
      }
    });
  }
  
  return notificationSettings;
};

// Seed Database Function
async function seedDatabase() {
  try {
    // Clear existing data
    await CompanySettings.deleteMany({});
    await NotificationSettings.deleteMany({});
    await Client.deleteMany({});
    await Contractor.deleteMany({});
    await Feedback.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert company settings
    await CompanySettings.create(sampleCompanySettings);
    console.log('Added company settings');
    
    // Insert clients
    const sampleClients = await generateSampleClients();
    const clients = await Client.insertMany(sampleClients);
    console.log(`Added ${clients.length} clients`);
    
    // Insert contractors
    const sampleContractors = await generateSampleContractors();
    const contractors = await Contractor.insertMany(sampleContractors);
    console.log(`Added ${contractors.length} contractors`);
    
    // Insert transactions
    const sampleTransactions = generateSampleTransactions(clients, contractors);
    const transactions = await Transaction.insertMany(sampleTransactions);
    console.log(`Added ${transactions.length} transactions`);
    
    // Insert feedback
    const sampleFeedback = generateSampleFeedback(clients, contractors, transactions);
    const feedback = await Feedback.insertMany(sampleFeedback);
    console.log(`Added ${feedback.length} feedback entries`);
    
    // Insert notification settings
    const sampleNotificationSettings = generateNotificationSettings(clients, contractors);
    const notificationSettings = await NotificationSettings.insertMany(sampleNotificationSettings);
    console.log(`Added ${notificationSettings.length} notification settings`);
    
    console.log('Database seeding completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 