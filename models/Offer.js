const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  couponCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  discountType: { type: String, enum: ['FLAT_DISCOUNT', 'PERCENTAGE_CASHBACK', 'EXTRA_GOLD_GRAMS'], required: true },
  discountValue: { type: Number, required: true },
  minPurchaseAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validTill: { type: Date, required: true },
  usageLimit: { type: Number, default: 1000 },
  timesUsed: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'DISABLED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
