const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String, default: "" }
}, { timestamps: true });

settingsSchema.index({ key: 1, jewellerId: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);
