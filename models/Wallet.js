const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
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
  cashBalance: { type: Number, required: true, default: 0, min: 0 },
  goldGramBalance: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

walletSchema.index({ userId: 1, jewellerId: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
