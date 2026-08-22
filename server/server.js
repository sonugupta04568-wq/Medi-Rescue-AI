require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { getStats } = require("./store");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "MediRescue AI" }));
app.get("/api/stats", (req, res) => res.json(getStats()));
app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(path.join(__dirname, "..", "client", "index.html"));
  }
  next();
});

const PORT = process.env.PORT || 5000;
connectDB().finally(() => {
  app.listen(PORT, () => console.log(`🚑 MediRescue AI running on http://localhost:${PORT}`));
});
