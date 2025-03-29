const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  emailNotifications: {
    appointments: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }]
    },
    feedback: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }]
    },
    reports: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String, trim: true }]
    }
  },
  smsNotifications: {
    appointments: {
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String, trim: true }]
    },
    emergencies: {
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String, trim: true }]
    }
  },
  pushNotifications: {
    enabled: { type: Boolean, default: false },
    devices: [{
      deviceId: { type: String },
      name: { type: String },
      platform: { type: String },
      lastActive: { type: Date }
    }]
  },
  alertPreferences: {
    lowInventory: { type: Boolean, default: true },
    staffAbsence: { type: Boolean, default: true },
    paymentOverdue: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings; 