const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
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
    trim: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
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
  propertyType: {
    type: String,
    enum: ['residential', 'commercial'],
    default: 'residential'
  },
  squareFootage: {
    type: Number,
    min: 0
  },
  preferredService: {
    type: String,
    enum: ['standard', 'deep', 'move-in', 'move-out', 'commercial'],
    default: 'standard'
  },
  preferredDay: {
    type: String,
    trim: true
  },
  preferredTime: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  pets: {
    type: Boolean,
    default: false
  },
  howHeard: {
    type: String,
    trim: true
  },
  referralSource: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastServiceDate: {
    type: Date
  },
  totalServices: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
});

// Create a compound index on firstName and lastName for faster searches
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ zipCode: 1 });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client; 