const API_BASE = "http://" + (location.hostname || "localhost") + ":5000/api";

const MR = {
  user: JSON.parse(localStorage.getItem("mr_user") || "null"),
  token: localStorage.getItem("mr_token"),
  demo: localStorage.getItem("mr_demo") === "1",

  async api(path, options = {}) {
    try {
      const res = await fetch(API_BASE + path, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }
      return await res.json();
    } catch (err) {
      console.warn("API unavailable, using local demo mode:", err.message);
      MR.demo = true;
      localStorage.setItem("mr_demo", "1");
      return null;
    }
  },

  toast(message, type = "") {
    let zone = document.querySelector(".toast-zone");
    if (!zone) {
      zone = document.createElement("div");
      zone.className = "toast-zone";
      document.body.appendChild(zone);
    }
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = message;
    zone.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  },

  requireAuth() {
    if (!MR.user) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },

  logout() {
    localStorage.removeItem("mr_user");
    localStorage.removeItem("mr_token");
    localStorage.removeItem("mr_demo");
    window.location.href = "index.html";
  },

  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  },

  directionsUrl(lat, lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  },

  timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return new Date(iso).toLocaleDateString();
  },

  priorityBadge(priority) {
    const map = { CRITICAL: "badge-critical", HIGH: "badge-high", MEDIUM: "badge-medium", LOW: "badge-low" };
    return `<span class="badge ${map[priority] || "badge-navy"}">${priority}</span>`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
  const authArea = document.getElementById("nav-auth");
  if (authArea) {
    if (MR.user) {
      authArea.innerHTML = `
        <a href="dashboard.html" style="color:#fff;font-weight:600">👋 ${MR.user.name}</a>
        <a href="#" id="logout-btn" class="btn btn-sm btn-primary">Logout</a>`;
      document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        MR.logout();
      });
    } else {
      authArea.innerHTML = `<a href="login.html" class="btn btn-sm btn-primary">Login / Register</a>`;
    }
  }
});
