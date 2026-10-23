const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  name: { type: String, trim: true, default: "" },
  mobile: { type: String, required: true, unique: true, index: true },
  email: { type: String, lowercase: true, trim: true, default: "" },
  fcmToken: { type: String, default: "" },
  jewellerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jeweller',
    index: true,
  }],
  kycStatus: { 
    type: String, 
    enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'], 
    default: 'NOT_SUBMITTED' 
  },
  panNumber: { type: String, default: "" },
  aadhaarNumber: { type: String, default: "" },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
