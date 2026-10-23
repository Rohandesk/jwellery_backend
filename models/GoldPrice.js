const mongoose = require('mongoose');

const goldPriceSchema = new mongoose.Schema({
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', required: true, index: true },
  buyPrice: { type: Number, required: true },  // Per gram buy price for user
  sellPrice: { type: Number, required: true }, // Per gram sell price for user
  gstRate: { type: Number, default: 3 },       // GST % (default 3%)
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  updatedByMasterAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterAdmin' },
}, { timestamps: true });

module.exports = mongoose.model('GoldPrice', goldPriceSchema);
