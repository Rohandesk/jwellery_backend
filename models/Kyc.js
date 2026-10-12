const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  panNumber: { type: String, required: true, uppercase: true, trim: true },
  panDocumentUrl: { type: String, default: "" },
  aadhaarNumber: { type: String, required: true, trim: true },
  aadhaarFrontUrl: { type: String, default: "" },
  aadhaarBackUrl: { type: String, default: "" },
  ocrData: { type: Object, default: {} },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  verificationRemarks: { type: String, default: "" },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Kyc', kycSchema);
