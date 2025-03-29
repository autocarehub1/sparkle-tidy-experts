const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  specialties: [{
    type: String
  }],
  availability: {
    monday: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    },
    tuesday: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    },
    wednesday: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    },
    thursday: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    },
    friday: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false }
    }
  },
  documents: {
    idVerification: { type: Boolean, default: false },
    backgroundCheck: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    certification: { type: Boolean, default: false }
  },
  paymentInfo: {
    rate: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['direct_deposit', 'check', 'paypal'],
      default: 'direct_deposit'
    },
    accountDetails: String
  },
  notes: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  completedJobs: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contractor', contractorSchema); 