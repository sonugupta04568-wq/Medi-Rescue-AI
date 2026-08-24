require("dotenv").config();
const express = require("express");
const path = require("path");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const bedsRoutes = require("./routes/bedsRoutes");
const callRoutes = require("./routes/callRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { getStats } = require("./store");

const app = express();

/* Security headers */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Permissions-Policy", "geolocation=(self), camera=(self), microphone=(self)");
  next();
});

/* The frontend is served by this same app — no cross-origin API use is expected.
   Tighten CORS from `origin: true` to same-origin only (no CORS headers at all). */
app.use(express.json({ limit: "100kb" }));

/* Simple in-memory rate limiter for auth endpoints (no extra dependency). */
const authHits = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_HITS = 30;
function authLimiter(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = authHits.get(key) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  entry.count++;
  authHits.set(key, entry);
  if (entry.count > MAX_AUTH_HITS) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }
  next();
}

const staticOpts = {
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache");
    } else if (/\.(css|js|svg|png|jpg|webmanifest|woff2)$/.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  }
};
app.use(express.static(path.join(__dirname, "..", "client"), staticOpts));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "MediRescue AI" }));
app.get("/api/stats", (req, res) => res.json(getStats()));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/beds", bedsRoutes);
app.use("/api/call", callRoutes);
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
