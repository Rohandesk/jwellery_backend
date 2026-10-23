const mongoose = require('mongoose');

const userStoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jewellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jeweller',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

userStoreSchema.index({ userId: 1, jewellerId: 1 }, { unique: true });

module.exports = mongoose.model('UserStore', userStoreSchema);
