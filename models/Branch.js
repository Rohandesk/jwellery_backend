const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  jewellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jeweller', required: true, index: true },
  branchName: { type: String, required: true },
  branchCode: { type: String, required: true, unique: true, uppercase: true },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number
  },
  posQrCodeUrl: { type: String, default: "" },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
