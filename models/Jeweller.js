const mongoose = require('mongoose');

const jewellerSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  gstin: { type: String, required: true, unique: true, uppercase: true },
  ownerName: { type: String, required: true },
  contactEmail: { type: String, required: true, lowercase: true },
  contactMobile: { type: String, required: true, unique: true },
  logoUrl: { type: String, default: "" },
  customGoldMarginPct: { type: Number, default: 0.5 }, // % markup added to live gold rate
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED'], default: 'PENDING', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Jeweller', jewellerSchema);
