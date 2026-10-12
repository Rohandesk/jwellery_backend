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
      enum: ["Admin"]
    },
    mobile: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admin", adminSchema);
