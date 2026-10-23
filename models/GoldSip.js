const mongoose = require('mongoose');

const goldSipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', required: true, index: true },
  sipReference: { type: String, required: true, unique: true, index: true },
  amountPerInstallment: { type: Number, required: true, min: 100 },
  frequency: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], default: 'MONTHLY' },
  startDate: { type: Date, required: true },
  nextPaymentDate: { type: Date, required: true },
  totalInstallments: { type: Number, required: true },
  completedInstallments: { type: Number, default: 0 },
  accumulatedGoldGrams: { type: Number, default: 0 },
  razorpaySubscriptionId: { type: String, default: "" },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE', index: true }
}, { timestamps: true });

module.exports = mongoose.model('GoldSip', goldSipSchema);
