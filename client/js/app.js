const API_BASE =
  (location.protocol === "https:" ? "https://" : "http://") +
  (location.hostname || "localhost") + ":5000/api";

/* ---------- SVG icon set (Lucide-style, stroke-based) ---------- */
const ICONS = {
  siren: '<path d="M7 12a5 5 0 0 1 10 0v6H7v-6Z"/><path d="M5 20h14"/><path d="M12 2v2"/><path d="M4.9 5.6 6.3 7"/><path d="M19.1 5.6 17.7 7"/><path d="M9 12a3 3 0 0 1 6 0"/>',
  hospital: '<path d="M12 6v4M10 8h4"/><path d="M14.5 4h-5l-.5 2h6l-.5-2Z"/><path d="M5 10h14v10H5z"/><path d="M9 20v-4h6v4"/>',
  ambulance: '<path d="M3 8h11v8H3z"/><path d="M14 11h4l3 3v2h-7v-5Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M6 11h4M8 9v4"/>',
  droplet: '<path d="M12 2.7 6.4 9.4a7 7 0 1 0 11.2 0L12 2.7Z"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  gauge: '<path d="M12 4a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z"/><path d="M12 13l4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5 8-5s6.5 1 8 5"/>',
  zap: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  phone: '<path d="M5 3h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
  pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  nav: '<path d="M3 11l18-8-8 18-2-8-8-2Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  moon: '<path d="M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  check: '<path d="M4 12.5 9.5 18 20 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  heart: '<path d="M12 21C6 16 3 12.5 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3.5-3 7-9 12Z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  shield: '<path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"/>',
  message: '<path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/>'
};

function icon(name, size) {
  const s = size || 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* ---------- Theme ---------- */
const Theme = {
  init() {
    const saved = localStorage.getItem("mr_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.apply(saved || (prefersDark ? "dark" : "light"));
  },
  apply(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("mr_theme", mode);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.innerHTML = icon(mode === "dark" ? "sun" : "moon", 20);
  },
  toggle() {
    this.apply(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }
};

/* ---------- Shared chrome (navbar + footer) ---------- */
const NAV_LINKS = [
  { href: "emergency.html", label: "SOS", icon: "siren" },
  { href: "hospitals.html", label: "Hospitals", icon: "hospital" },
  { href: "ambulance.html", label: "Ambulance", icon: "ambulance" },
  { href: "blood-bank.html", label: "Blood", icon: "droplet" },
  { href: "assistant.html", label: "AI Help", icon: "bot" },
  { href: "dashboard.html", label: "Dashboard", icon: "gauge" }
];

const MR = {
  user: JSON.parse(localStorage.getItem("mr_user") || "null"),
  token: localStorage.getItem("mr_token"),
  demo: localStorage.getItem("mr_demo") === "1",

  async api(path, options = {}) {
    try {
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      if (MR.token) headers.Authorization = "Bearer " + MR.token;
      const res = await fetch(API_BASE + path, { ...options, headers });
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

  async sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return "plain:" + btoa(unescape(encodeURIComponent(text)));
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
  },

  mountNavbar() {
    const nav = document.getElementById("navbar");
    if (!nav) return;
    nav.className = "navbar";
    const path = location.pathname.split("/").pop() || "index.html";
    const links = NAV_LINKS.map(
      (l) => `<a href="${l.href}"${l.href === path ? ' class="active" aria-current="page"' : ""}>${icon(l.icon, 16)}${l.label}</a>`
    ).join("");
    nav.innerHTML = `
      <div class="container nav-inner">
        <a class="brand" href="index.html" aria-label="MediRescue AI home">
          <span class="logo">${icon("ambulance", 20)}</span>Medi<span class="accent">Rescue</span>&nbsp;AI
        </a>
        <div class="nav-links" id="nav-links">${links}<span id="nav-auth"></span></div>
        <div class="nav-actions">
          <button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark mode" title="Toggle theme"></button>
          <button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
            ${icon("menu", 20)}
          </button>
        </div>
      </div>`;

    document.getElementById("theme-toggle").addEventListener("click", () => Theme.toggle());
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-links");
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = icon(open ? "x" : "menu", 20);
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));

    const authArea = document.getElementById("nav-auth");
    if (MR.user) {
      authArea.innerHTML = `
        <a href="dashboard.html" style="color:#fff;font-weight:600">${icon("user", 16)}${MR.user.name}</a>
        <a href="#" id="logout-btn" class="btn btn-sm btn-primary">Logout</a>`;
      document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        MR.logout();
      });
    } else {
      authArea.innerHTML = `<a href="login.html" class="btn btn-sm btn-primary">Login / Register</a>`;
    }
  },

  mountFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    footer.className = "footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html"><span class="logo">${icon("ambulance", 20)}</span>Medi<span class="accent">Rescue</span>&nbsp;AI</a>
            <p style="margin-top:.8rem;font-size:.9rem">Smart Emergency Healthcare &amp; Response Platform.<br/>&ldquo;Fast Help. Smart Decisions. Saved Lives.&rdquo;</p>
          </div>
          <div>
            <h4>Modules</h4>
            <a href="emergency.html">${icon("siren", 16)} Smart SOS</a>
            <a href="hospitals.html">${icon("hospital", 16)} Hospital Finder</a>
            <a href="ambulance.html">${icon("ambulance", 16)} Ambulance Request</a>
            <a href="blood-bank.html">${icon("droplet", 16)} Blood Bank Finder</a>
          </div>
          <div>
            <h4>Platform</h4>
            <a href="assistant.html">${icon("bot", 16)} AI Assistant</a>
            <a href="dashboard.html">${icon("gauge", 16)} Dashboard</a>
            <a href="login.html">${icon("user", 16)} Login / Register</a>
          </div>
        </div>
        <p class="fineprint">⚠️ MediRescue AI does not replace doctors or emergency services. In a life-threatening emergency, call 112 / 108 immediately. © 2026 MediRescue AI — Hackathon MVP.</p>
      </div>`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Theme.init();
  MR.mountNavbar();
  MR.mountFooter();

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
