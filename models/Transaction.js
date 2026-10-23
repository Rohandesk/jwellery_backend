const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  jewellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jeweller',
    required: true,
    index: true,
  },
  txnReference: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['BUY_GOLD', 'SELL_GOLD', 'WALLET_DEPOSIT', 'WALLET_WITHDRAWAL'], 
    required: true 
  },
  amount: { type: Number, required: true },
  goldGrams: { type: Number, default: 0 },
  ratePerGram: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  paymentGatewayTxnId: { type: String, default: "" },
  paymentMode: { 
    type: String, 
    enum: ['WALLET', 'GATEWAY', 'BANK_TRANSFER'], 
    default: 'WALLET' 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'], 
    default: 'PENDING',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
