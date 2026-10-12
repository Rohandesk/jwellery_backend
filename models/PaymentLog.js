const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
  paymentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentOrder' },
  gatewayPaymentId: { type: String, default: "" },
  gatewaySignature: { type: String, default: "" },
  event: { type: String, required: true }, // e.g. 'order.paid', 'payment.failed'
  rawPayload: { type: Object, default: {} },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
