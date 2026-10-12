const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ticketNumber: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['TRANSACTION_ISSUE', 'KYC_HELP', 'GOLD_DELIVERY', 'GENERAL'], required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  messages: [{
    sender: { type: String, enum: ['USER', 'AGENT', 'AI_BOT'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    text: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
