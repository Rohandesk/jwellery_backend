const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null }, // Null = Broadcast
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['PRICE_ALERT', 'TRANSACTION', 'PROMO', 'SYSTEM'], default: 'SYSTEM' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
