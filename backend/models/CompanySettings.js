const mongoose = require('mongoose');

const businessHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true
  },
  close: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

const companySettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  businessHours: {
    monday: { type: businessHoursSchema, default: { open: '09:00', close: '17:00', isOpen: true } },
    tuesday: { type: businessHoursSchema, default: { open: '09:00', close: '17:00', isOpen: true } },
    wednesday: { type: businessHoursSchema, default: { open: '09:00', close: '17:00', isOpen: true } },
    thursday: { type: businessHoursSchema, default: { open: '09:00', close: '17:00', isOpen: true } },
    friday: { type: businessHoursSchema, default: { open: '09:00', close: '17:00', isOpen: true } },
    saturday: { type: businessHoursSchema, default: { open: '10:00', close: '15:00', isOpen: true } },
    sunday: { type: businessHoursSchema, default: { open: '10:00', close: '15:00', isOpen: false } }
  },
  taxRate: {
    type: Number,
    default: 8.25,
    min: 0,
    max: 20
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  timeZone: {
    type: String,
    default: 'America/New_York'
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
  },
  timeFormat: {
    type: String,
    default: '12h',
    enum: ['12h', '24h']
  },
  emailNotifications: {
    newBooking: { type: Boolean, default: true },
    bookingCancellation: { type: Boolean, default: true },
    bookingReminder: { type: Boolean, default: true },
    paymentReceived: { type: Boolean, default: true },
    reviewReceived: { type: Boolean, default: true }
  },
  smsNotifications: {
    newBooking: { type: Boolean, default: true },
    bookingCancellation: { type: Boolean, default: true },
    bookingReminder: { type: Boolean, default: false },
    paymentReceived: { type: Boolean, default: false },
    reviewReceived: { type: Boolean, default: false }
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
companySettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// There should only be one company settings document
companySettingsSchema.statics.findOrCreate = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  // Create default settings if none exist
  return this.create({
    companyName: 'Sparkle & Tidy Experts',
    email: 'info@sparkletidy.com',
    phone: '(210) 555-1234',
    website: 'www.sparkletidy.com',
    address: '123 Main Street',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78248',
    description: 'Professional cleaning services for homes and businesses in San Antonio, Texas.'
  });
};

const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);

module.exports = CompanySettings; 