const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("ℹ️  MONGODB_URI not set — using in-memory demo store");
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("⚠️  MongoDB connection failed — falling back to in-memory store:", err.message);
  }
}

function isConnected() {
  return connected;
}

module.exports = { connectDB, isConnected };
