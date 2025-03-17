/**
 * MongoDB Database Seed Script for Sparkle & Tidy Experts
 * 
 * This script will populate your MongoDB database with sample data
 * for all collections used in the application.
 * 
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Run this script with: node sparkle-tidy-experts-db-seed.js
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sparkletidy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define schemas
const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Sparkle & Tidy Experts' },
  email: { type: String, default: 'info@sparkletidy.com' },
  phone: { type: String, default: '210-555-1234' },
  website: { type: String, default: 'www.sparkletidy.com' },
  address: {
    street: { type: String, default: '123 Cleaning Ave' },
    city: { type: String, default: 'San Antonio' },
    state: { type: String, default: 'TX' },
    zipCode: { type: String, default: '78254' },
    country: { type: String, default: 'USA' }
  },
  description: { type: String, default: 'Professional Cleaning Services in San Antonio, Texas' },
  logo: { type: String, default: '' },
  businessHours: {
    monday: { open: { type: Boolean, default: true }, from: { type: String, default: '08:00' }, to: { type: String, default: '17:00' } },
    tuesday: { open: { type: Boolean, default: true }, from: { type: String, default: '08:00' }, to: { type: String, default: '17:00' } },
    wednesday: { open: { type: Boolean, default: true }, from: { type: String, default: '08:00' }, to: { type: String, default: '17:00' } },
    thursday: { open: { type: Boolean, default: true }, from: { type: String, default: '08:00' }, to: { type: String, default: '17:00' } },
    friday: { open: { type: Boolean, default: true }, from: { type: String, default: '08:00' }, to: { type: String, default: '17:00' } },
    saturday: { open: { type: Boolean, default: false }, from: { type: String, default: '09:00' }, to: { type: String, default: '13:00' } },
    sunday: { open: { type: Boolean, default: false }, from: { type: String, default: '00:00' }, to: { type: String, default: '00:00' } }
  },
  taxRate: { type: Number, default: 8.25 },
  currency: { type: String, default: 'USD' },
  timeZone: { type: String, default: 'America/Chicago' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  timeFormat: { type: String, default: '12h' },
  emailNotifications: {
    newAppointment: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
    appointmentReminder: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
    appointmentCancellation: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
    paymentReceived: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } }
  },
  smsNotifications: {
    newAppointment: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
    appointmentReminder: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
    appointmentCancellation: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
    paymentReceived: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } }
  },
  socialMedia: {
    facebook: { type: String, default: 'https://facebook.com/sparkletidy' },
    twitter: { type: String, default: 'https://twitter.com/sparkletidy' },
    instagram: { type: String, default: 'https://instagram.com/sparkletidy' },
    linkedin: { type: String, default: 'https://linkedin.com/company/sparkletidy' }
  }
});

const notificationSettingsSchema = new mongoose.Schema({
  appointments: {
    new: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    reminder: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    cancellation: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    rescheduled: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    }
  },
  payments: {
    received: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    failed: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    refunded: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    }
  },
  clients: {
    new: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    feedback: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    }
  },
  contractors: {
    new: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    },
    assignment: {
      email: { enabled: { type: Boolean, default: true }, recipients: { type: String, default: 'info@sparkletidy.com' } },
      sms: { enabled: { type: Boolean, default: false }, recipients: { type: String, default: '+12105551234' } },
      push: { enabled: { type: Boolean, default: false } }
    }
  }
});

const clientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  propertyType: { type: String, enum: ['residential', 'commercial'], default: 'residential' },
  squareFootage: { type: Number },
  preferredService: { type: String, enum: ['standard', 'deep', 'move-in', 'move-out', 'commercial'], default: 'standard' },
  preferredDay: { type: String },
  preferredTime: { type: String },
  specialInstructions: { type: String },
  pets: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  lastServiceDate: { type: Date },
  totalServices: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
});

const contractorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  specialties: {
    residential: { type: Boolean, default: true },
    commercial: { type: Boolean, default: false },
    deepCleaning: { type: Boolean, default: true },
    moveIn: { type: Boolean, default: false },
    moveOut: { type: Boolean, default: false }
  },
  availability: {
    monday: { available: { type: Boolean, default: true }, slots: [String] },
    tuesday: { available: { type: Boolean, default: true }, slots: [String] },
    wednesday: { available: { type: Boolean, default: true }, slots: [String] },
    thursday: { available: { type: Boolean, default: true }, slots: [String] },
    friday: { available: { type: Boolean, default: true }, slots: [String] },
    saturday: { available: { type: Boolean, default: false }, slots: [String] },
    sunday: { available: { type: Boolean, default: false }, slots: [String] }
  },
  rating: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  cancelledJobs: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  hireDate: { type: Date, default: Date.now },
  notes: { type: String }
});

const feedbackSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
  appointment: { type: mongoose.Schema.Types.ObjectId },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  serviceQuality: { type: Number, min: 1, max: 5 },
  punctuality: { type: Number, min: 1, max: 5 },
  professionalism: { type: Number, min: 1, max: 5 },
  valueForMoney: { type: Number, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['published', 'pending', 'rejected'], default: 'published' }
});

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  client: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    name: { type: String },
    email: { type: String }
  },
  service: {
    type: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }
  },
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  contractor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
    name: { type: String },
    payoutAmount: { type: Number },
    payoutStatus: { type: String, default: 'pending' },
    payoutDate: { type: Date }
  },
  tax: {
    rate: { type: Number },
    amount: { type: Number }
  },
  discount: {
    code: { type: String },
    amount: { type: Number },
    percentage: { type: Number }
  },
  refund: {
    amount: { type: Number },
    reason: { type: String },
    date: { type: Date }
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);
const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);
const Client = mongoose.model('Client', clientSchema);
const Contractor = mongoose.model('Contractor', contractorSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Sample data
const sampleData = {
  // Company Settings
  companySettings: {
    companyName: 'Sparkle & Tidy Experts',
    email: 'info@sparkletidy.com',
    phone: '210-555-1234',
    website: 'www.sparkletidy.com',
    address: {
      street: '123 Cleaning Ave',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78254',
      country: 'USA'
    },
    description: 'Professional Cleaning Services in San Antonio, Texas',
    logo: '',
    businessHours: {
      monday: { open: true, from: '08:00', to: '17:00' },
      tuesday: { open: true, from: '08:00', to: '17:00' },
      wednesday: { open: true, from: '08:00', to: '17:00' },
      thursday: { open: true, from: '08:00', to: '17:00' },
      friday: { open: true, from: '08:00', to: '17:00' },
      saturday: { open: false, from: '09:00', to: '13:00' },
      sunday: { open: false, from: '00:00', to: '00:00' }
    },
    taxRate: 8.25,
    currency: 'USD',
    timeZone: 'America/Chicago',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  },

  // Notification Settings
  notificationSettings: {
    appointments: {
      new: {
        email: { enabled: true, recipients: 'info@sparkletidy.com' },
        sms: { enabled: false, recipients: '+12105551234' },
        push: { enabled: false }
      },
      reminder: {
        email: { enabled: true, recipients: 'info@sparkletidy.com' },
        sms: { enabled: false, recipients: '+12105551234' },
        push: { enabled: false }
      }
    },
    payments: {
      received: {
        email: { enabled: true, recipients: 'info@sparkletidy.com' },
        sms: { enabled: false, recipients: '+12105551234' },
        push: { enabled: false }
      }
    }
  },

  // Clients
  clients: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '210-555-1111',
      address: '456 Residential St',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78255',
      propertyType: 'residential',
      squareFootage: 2200,
      preferredService: 'standard',
      preferredDay: 'Monday',
      preferredTime: 'Morning',
      specialInstructions: 'Please be careful with the antique furniture in the living room.',
      pets: true,
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastServiceDate: new Date('2024-03-01'),
      totalServices: 5,
      totalSpent: 625.50
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '210-555-2222',
      address: '789 Commercial Ave',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78230',
      propertyType: 'commercial',
      squareFootage: 3500,
      preferredService: 'deep',
      preferredDay: 'Wednesday',
      preferredTime: 'Afternoon',
      specialInstructions: 'Office needs to be cleaned after 6pm when employees leave.',
      pets: false,
      status: 'active',
      createdAt: new Date('2024-02-10'),
      lastServiceDate: new Date('2024-03-10'),
      totalServices: 2,
      totalSpent: 950.00
    },
    {
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      phone: '210-555-3333',
      address: '123 New Home Dr',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78245',
      propertyType: 'residential',
      squareFootage: 1800,
      preferredService: 'move-in',
      preferredDay: 'Friday',
      preferredTime: 'Morning',
      specialInstructions: 'New construction home, needs detailed cleaning before move-in.',
      pets: false,
      status: 'active',
      createdAt: new Date('2024-03-05'),
      lastServiceDate: null,
      totalServices: 0,
      totalSpent: 0
    }
  ],

  // Contractors
  contractors: [
    {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@example.com',
      phone: '210-555-4444',
      address: '567 Worker Lane',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78240',
      specialties: {
        residential: true,
        commercial: true,
        deepCleaning: true,
        moveIn: true,
        moveOut: true
      },
      availability: {
        monday: { available: true, slots: ['morning', 'afternoon'] },
        tuesday: { available: true, slots: ['morning', 'afternoon'] },
        wednesday: { available: true, slots: ['morning', 'afternoon'] },
        thursday: { available: true, slots: ['morning', 'afternoon'] },
        friday: { available: true, slots: ['morning', 'afternoon'] },
        saturday: { available: false, slots: [] },
        sunday: { available: false, slots: [] }
      },
      rating: 4.8,
      totalJobs: 120,
      completedJobs: 118,
      cancelledJobs: 2,
      totalEarnings: 8500.00,
      status: 'active',
      hireDate: new Date('2023-06-15'),
      notes: 'Excellent worker, very reliable and thorough.'
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      phone: '210-555-5555',
      address: '890 Cleaner Rd',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78250',
      specialties: {
        residential: true,
        commercial: false,
        deepCleaning: true,
        moveIn: false,
        moveOut: true
      },
      availability: {
        monday: { available: true, slots: ['morning'] },
        tuesday: { available: true, slots: ['morning'] },
        wednesday: { available: true, slots: ['morning'] },
        thursday: { available: true, slots: ['morning'] },
        friday: { available: true, slots: ['morning'] },
        saturday: { available: true, slots: ['morning'] },
        sunday: { available: false, slots: [] }
      },
      rating: 4.5,
      totalJobs: 85,
      completedJobs: 82,
      cancelledJobs: 3,
      totalEarnings: 6200.00,
      status: 'active',
      hireDate: new Date('2023-08-10'),
      notes: 'Specializes in residential cleaning, very detail-oriented.'
    }
  ],

  // Transactions
  transactions: [
    {
      transactionId: 'TRX-2024-001',
      client: {
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      service: {
        type: 'standard',
        description: 'Standard Cleaning - 2200 sq ft home',
        date: new Date('2024-03-01')
      },
      payment: {
        amount: 125.00,
        method: 'credit_card',
        status: 'completed',
        date: new Date('2024-03-01')
      },
      contractor: {
        name: 'Maria Garcia',
        payoutAmount: 87.50,
        payoutStatus: 'completed',
        payoutDate: new Date('2024-03-03')
      },
      tax: {
        rate: 8.25,
        amount: 10.31
      },
      notes: 'Regular bi-weekly cleaning',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01')
    },
    {
      transactionId: 'TRX-2024-002',
      client: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      service: {
        type: 'deep',
        description: 'Deep Cleaning - 3500 sq ft commercial space',
        date: new Date('2024-03-10')
      },
      payment: {
        amount: 475.00,
        method: 'bank_transfer',
        status: 'completed',
        date: new Date('2024-03-10')
      },
      contractor: {
        name: 'Maria Garcia',
        payoutAmount: 332.50,
        payoutStatus: 'completed',
        payoutDate: new Date('2024-03-13')
      },
      tax: {
        rate: 8.25,
        amount: 39.19
      },
      notes: 'Monthly deep cleaning for office space',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10')
    }
  ],

  // Feedback
  feedback: [
    {
      rating: 5,
      comment: 'Maria did an excellent job cleaning our home. Everything was spotless!',
      serviceQuality: 5,
      punctuality: 5,
      professionalism: 5,
      valueForMoney: 4,
      date: new Date('2024-03-02'),
      status: 'published'
    },
    {
      rating: 4,
      comment: 'Good service overall. The office looks much better, though a few spots were missed under the desks.',
      serviceQuality: 4,
      punctuality: 5,
      professionalism: 4,
      valueForMoney: 4,
      date: new Date('2024-03-11'),
      status: 'published'
    }
  ]
};

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await CompanySettings.deleteMany({});
    await NotificationSettings.deleteMany({});
    await Client.deleteMany({});
    await Contractor.deleteMany({});
    await Transaction.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Existing data cleared');

    // Insert company settings
    const companySettings = await CompanySettings.create(sampleData.companySettings);
    console.log('Company settings created');

    // Insert notification settings
    const notificationSettings = await NotificationSettings.create(sampleData.notificationSettings);
    console.log('Notification settings created');

    // Insert clients
    const clients = await Client.insertMany(sampleData.clients);
    console.log(`${clients.length} clients created`);

    // Insert contractors
    const contractors = await Contractor.insertMany(sampleData.contractors);
    console.log(`${contractors.length} contractors created`);

    // Update transaction and feedback data with references
    const clientMap = clients.reduce((map, client) => {
      map[client.email] = client._id;
      return map;
    }, {});

    const contractorMap = contractors.reduce((map, contractor) => {
      map[contractor.email] = contractor._id;
      return map;
    }, {});

    // Insert transactions with references
    const transactionsWithRefs = sampleData.transactions.map(transaction => {
      const clientEmail = transaction.client.email;
      const contractorName = transaction.contractor.name;
      
      // Find client by email
      const clientId = clientMap[clientEmail];
      
      // Find contractor by name (first name + last name)
      const contractor = contractors.find(c => 
        `${c.firstName} ${c.lastName}` === contractorName
      );
      
      return {
        ...transaction,
        client: {
          ...transaction.client,
          id: clientId
        },
        contractor: {
          ...transaction.contractor,
          id: contractor ? contractor._id : null
        }
      };
    });

    const transactions = await Transaction.insertMany(transactionsWithRefs);
    console.log(`${transactions.length} transactions created`);

    // Insert feedback with references
    const feedbackWithRefs = sampleData.feedback.map((feedback, index) => {
      // Associate feedback with clients and contractors
      const clientId = clients[index % clients.length]._id;
      const contractorId = contractors[index % contractors.length]._id;
      const transactionId = transactions[index % transactions.length]._id;
      
      return {
        ...feedback,
        client: clientId,
        contractor: contractorId,
        appointment: transactionId
      };
    });

    const feedbacks = await Feedback.insertMany(feedbackWithRefs);
    console.log(`${feedbacks.length} feedback entries created`);

    console.log('Database seeded successfully!');
    
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

// Run the seed function
seedDatabase(); 