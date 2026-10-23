const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', required: true, index: true },
  gatewayOrderId: { type: String, required: true, unique: true, index: true },
  paymentGateway: { type: String, enum: ['RAZORPAY', 'PHONEPE', 'PAYTM'], default: 'RAZORPAY' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  receiptId: { type: String, required: true },
  purpose: { type: String, enum: ['BUY_GOLD', 'WALLET_DEPOSIT', 'SIP_INSTALLMENT'], required: true },
  status: { type: String, enum: ['CREATED', 'PAID', 'FAILED', 'EXPIRED'], default: 'CREATED', index: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
