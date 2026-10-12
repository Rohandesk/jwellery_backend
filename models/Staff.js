const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', default: null, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'JEWELLER_ADMIN', 'BRANCH_MANAGER', 'CASHIER', 'VERIFICATION_AGENT'], required: true },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
