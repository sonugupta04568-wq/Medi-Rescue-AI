const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: String,
    bloodGroup: String,
    age: Number,
    allergies: String,
    emergencyNotes: String,
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
