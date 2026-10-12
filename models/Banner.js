const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  targetScreen: { type: String, enum: ['BUY_GOLD', 'SELL_GOLD', 'SIP', 'OFFERS', 'EXTERNAL_URL'], default: 'BUY_GOLD' },
  targetUrl: { type: String, default: "" },
  priority: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
