const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: String,
    type: String,
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "HIGH" },
    location: {
      lat: Number,
      lng: Number
    },
    address: String,
    notes: String,
    contactsNotified: [{ name: String, phone: String }],
    status: { type: String, default: "ACTIVE" },
    timeline: [
      {
        status: String,
        at: String,
        label: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);
