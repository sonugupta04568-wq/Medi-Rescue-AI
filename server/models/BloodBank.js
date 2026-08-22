const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    lat: Number,
    lng: Number,
    phone: String,
    stock: {
      "A+": String,
      "A-": String,
      "B+": String,
      "B-": String,
      "O+": String,
      "O-": String,
      "AB+": String,
      "AB-": String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodBank", bloodBankSchema);
