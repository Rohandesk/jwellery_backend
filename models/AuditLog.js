const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  actorType: { type: String, enum: ['Admin', 'Staff', 'User', 'System'], required: true },
  action: { type: String, required: true }, // e.g. 'GOLD_PRICE_UPDATE', 'KYC_APPROVE', 'MARGIN_CHANGE'
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  payload: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
