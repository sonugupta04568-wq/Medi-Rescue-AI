const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: String,
    type: String,
    city: String,
    lat: Number,
    lng: Number,
    emergency: Boolean,
    phone: String,
    address: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
