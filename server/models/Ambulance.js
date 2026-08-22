const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    ambulance: {
      id: String,
      code: String,
      type: String,
      driver: String,
      phone: String
    },
    emergencyType: String,
    pickup: {
      lat: Number,
      lng: Number
    },
    destinationHospitalId: String,
    status: { type: String, default: "ASSIGNED" },
    etaMinutes: Number,
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

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
