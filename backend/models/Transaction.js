const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  clientName: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['standard', 'deep', 'move-in', 'move-out', 'commercial']
  },
  appointmentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'check', 'paypal', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'refunded', 'failed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contractor'
  },
  contractorPayout: {
    type: Number,
    default: 0
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

// Create indexes for common queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ clientEmail: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ contractorId: 1 });

// Static method to generate transaction reports
transactionSchema.statics.generateReport = async function(startDate, endDate, filters = {}) {
  const query = {
    date: { $gte: startDate, $lte: endDate },
    ...filters
  };
  
  const transactions = await this.find(query).sort({ date: -1 });
  
  // Calculate summary statistics
  const totalRevenue = transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.amount : sum, 0);
  const totalRefunds = transactions.reduce((sum, t) => t.status === 'refunded' ? sum + t.refundAmount : sum, 0);
  const netRevenue = totalRevenue - totalRefunds;
  const totalTax = transactions.reduce((sum, t) => t.status === 'completed' ? sum + t.taxAmount : sum, 0);
  const totalDiscounts = transactions.reduce((sum, t) => sum + t.discountAmount, 0);
  const totalPayouts = transactions.reduce((sum, t) => t.payoutStatus === 'paid' ? sum + t.contractorPayout : sum, 0);
  
  // Group by service type
  const serviceTypeBreakdown = {};
  transactions.forEach(t => {
    if (t.status === 'completed') {
      if (!serviceTypeBreakdown[t.serviceType]) {
        serviceTypeBreakdown[t.serviceType] = { count: 0, revenue: 0 };
      }
      serviceTypeBreakdown[t.serviceType].count += 1;
      serviceTypeBreakdown[t.serviceType].revenue += t.amount;
    }
  });
  
  return {
    transactions,
    summary: {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      refundedTransactions: transactions.filter(t => t.status === 'refunded').length,
      totalRevenue,
      totalRefunds,
      netRevenue,
      totalTax,
      totalDiscounts,
      totalPayouts,
      grossProfit: netRevenue - totalPayouts
    },
    serviceTypeBreakdown
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 