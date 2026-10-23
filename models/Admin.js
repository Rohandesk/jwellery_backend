const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    firstname: { type: String, default: "Admin User" },
    lastname: { type: String, default: "Admin User" },
    role: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
    },
    mobile: { type: Number, required: true },
    jewellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jeweller",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

adminSchema.index({ jewellerId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Admin", adminSchema);
