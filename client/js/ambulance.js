const FLOW = ["ASSIGNED", "EN_ROUTE", "ARRIVED", "HOSPITAL_REACHED", "CLOSED"];
const FLOW_LABELS = { ASSIGNED: "Assigned", EN_ROUTE: "En Route", ARRIVED: "Arrived", HOSPITAL_REACHED: "Hospital Reached", CLOSED: "Closed" };
let selectedType = "";
let pickup = null;
let currentRequest = null;

document.querySelectorAll("#amb-type-chips .chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    document.querySelectorAll("#amb-type-chips .chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    selectedType = chip.dataset.type;
  })
);

document.getElementById("use-gps").addEventListener("click", async () => {
  const status = document.getElementById("pickup-status");
  status.textContent = "📡 Detecting…";
  try {
    pickup = await MR.getUserLocation();
    status.textContent = `📍 Pickup set: ${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`;
    MR.toast("📍 Pickup location captured", "success");
  } catch {
    pickup = { lat: 28.6139, lng: 77.209 };
    status.textContent = "⚠️ GPS denied — using city-center demo location";
  }
});

document.getElementById("request-btn").addEventListener("click", async () => {
  if (!pickup) {
    MR.toast("📍 Set pickup location first!", "warn");
    return;
  }
  const btn = document.getElementById("request-btn");
  btn.disabled = true;
  btn.textContent = "🚨 Requesting…";
  const payload = {
    type: selectedType || null,
    emergencyType: document.getElementById("em-type").value,
    pickup
  };
  let req = await MR.api("/ambulance/request", { method: "POST", body: JSON.stringify(payload) });
  if (!req) {
    const units = [
      { id: "a1", code: "MR-101", type: "Basic", driver: "Ramesh Kumar", phone: "+91-9810010101", lat: 28.615, lng: 77.21 },
      { id: "a2", code: "MR-205", type: "ALS", driver: "Sunil Yadav", phone: "+91-9810020202", lat: 28.605, lng: 77.245 }
    ];
    const unit = units.find((u) => !selectedType || u.type === selectedType) || units[0];
    req = {
      id: "REQ-" + Date.now(),
      ambulance: unit,
      emergencyType: payload.emergencyType,
      pickup,
      status: "ASSIGNED",
      etaMinutes: 8,
      createdAt: new Date().toISOString(),
      timeline: [{ status: "ASSIGNED", at: new Date().toISOString(), label: `${unit.code} assigned — driver ${unit.driver}` }]
    };
    localStorage.setItem("mr_local_amb_request", JSON.stringify(req));
    localStorage.setItem("mr_local_amb_requests", String(Number(localStorage.getItem("mr_local_amb_requests") || 0) + 1));
  }
  currentRequest = req;
  localStorage.setItem("mr_last_amb_request", JSON.stringify(req));
  showTracking(req);
  MR.toast(`🚑 ${req.ambulance.code} assigned! ETA ~${req.etaMinutes} min`, "success");
  btn.disabled = false;
  btn.textContent = "🚨 Request Ambulance Now";
});

function showTracking(req) {
  document.getElementById("request-section").style.display = "none";
  const section = document.getElementById("tracking-section");
  section.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("req-id").textContent = req.id;
  AmbMap.init(req);
  renderTracking(req);
}

function renderTracking(req) {
  const badge = document.getElementById("req-status-badge");
  badge.textContent = FLOW_LABELS[req.status] || req.status;

  const stepper = document.getElementById("amb-stepper");
  const idx = FLOW.indexOf(req.status);
  stepper.innerHTML = FLOW.map((s, i) => `<div class="step ${i < idx ? "done" : i === idx ? "active" : ""}">${FLOW_LABELS[s]}</div>`).join("");

  document.getElementById("drv-name").textContent = req.ambulance.driver;
  document.getElementById("drv-phone").textContent = req.ambulance.phone;
  document.getElementById("drv-unit").textContent = `${req.ambulance.code} • ${req.ambulance.type}`;
  document.getElementById("call-driver").href = "tel:" + req.ambulance.phone;
  const dest = req.pickup || { lat: 28.61, lng: 77.21 };
  document.getElementById("track-map").href = MR.directionsUrl(dest.lat, dest.lng);

  document.getElementById("amb-timeline").innerHTML = (req.timeline || [])
    .map(
      (t, i, arr) => `
        <div class="timeline-item ${i === arr.length - 1 ? "" : "done"}">
          <div class="t-label">${t.label}</div>
          <div class="t-time">${new Date(t.at).toLocaleTimeString()}</div>
        </div>`
    )
    .join("");

  AmbMap.setStatus(req.status);
}

document.getElementById("advance-btn").addEventListener("click", async () => {
  if (!currentRequest) return;
  let updated = await MR.api(`/ambulance/request/${currentRequest.id}/status`, { method: "PATCH" });
  if (!updated) {
    const idx = FLOW.indexOf(currentRequest.status);
    if (idx >= FLOW.length - 1) return;
    const next = FLOW[idx + 1];
    const labels = { EN_ROUTE: "Ambulance en route to pickup", ARRIVED: "Ambulance arrived at pickup", HOSPITAL_REACHED: "Patient reached hospital", CLOSED: "Emergency closed" };
    currentRequest.status = next;
    currentRequest.timeline.push({ status: next, at: new Date().toISOString(), label: labels[next] });
    updated = currentRequest;
    localStorage.setItem("mr_last_amb_request", JSON.stringify(updated));
  } else {
    currentRequest = updated;
  }
  renderTracking(currentRequest);
  if (currentRequest.status === "CLOSED") MR.toast("✅ Emergency closed. Get well soon!", "success");
});

/* ============ Live tracking map (simulated movement — no real GPS feed in MVP) ============ */
const AmbMap = {
  map: null,
  ambMarker: null,
  routeLine: null,
  start: null,
  pickup: null,
  dest: null,
  pos: null,
  target: null,
  timer: null,

  init(req) {
    this.start = {
      lat: req.ambulance.lat != null ? req.ambulance.lat : 28.605,
      lng: req.ambulance.lng != null ? req.ambulance.lng : 77.245
    };
    this.pickup = req.pickup || { lat: 28.6139, lng: 77.209 };
    this.dest = this.nearestHospital(this.pickup);

    if (!this.map) {
      this.map = L.map("amb-map");
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(this.map);
    }

    // Pickup marker (pulsing red)
    const pickupIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#e63946;border:3px solid #fff;box-shadow:0 0 0 6px rgba(230,57,70,.3),0 2px 8px rgba(0,0,0,.4)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker([this.pickup.lat, this.pickup.lng], { icon: pickupIcon })
      .addTo(this.map)
      .bindPopup("📍 Pickup point");

    // Destination hospital marker
    L.marker([this.dest.lat, this.dest.lng])
      .addTo(this.map)
      .bindPopup(`🏥 ${this.dest.name}`);

    // Dashed route: unit → pickup → hospital
    if (this.routeLine) this.routeLine.remove();
    this.routeLine = L.polyline(
      [
        [this.start.lat, this.start.lng],
        [this.pickup.lat, this.pickup.lng],
        [this.dest.lat, this.dest.lng]
      ],
      { color: "#2a9d8f", weight: 3, dashArray: "8 10", opacity: 0.85 }
    ).addTo(this.map);

    // Ambulance marker
    const ambIcon = L.divIcon({
      className: "",
      html: `<div style="width:34px;height:34px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,.35),0 0 0 4px rgba(230,57,70,.25)">🚑</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    if (this.ambMarker) this.ambMarker.remove();
    this.pos = { ...this.start };
    this.ambMarker = L.marker([this.pos.lat, this.pos.lng], { icon: ambIcon })
      .addTo(this.map)
      .bindPopup(`🚑 ${req.ambulance.code} — ${req.ambulance.driver}`);

    this.map.fitBounds(this.routeLine.getBounds().pad(0.2));

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 250);
  },

  nearestHospital(loc) {
    return HOSPITALS.filter((h) => h.emergency)
      .map((h) => ({ ...h, d: MR.distanceKm(loc.lat, loc.lng, h.lat, h.lng) }))
      .sort((a, b) => a.d - b.d)[0];
  },

  // Where the ambulance should head for, per status.
  statusTarget(status) {
    if (status === "ASSIGNED") return this.lerp(this.start, this.pickup, 0.35);
    if (status === "EN_ROUTE") return { ...this.pickup };
    if (status === "ARRIVED") return this.lerp(this.pickup, this.dest, 0.6);
    if (status === "HOSPITAL_REACHED" || status === "CLOSED") return { ...this.dest };
    return { ...this.pickup };
  },

  setStatus(status) {
    this.status = status;
    this.target = this.statusTarget(status);
    this.updateEta(status);
  },

  lerp(a, b, t) {
    return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
  },

  tick() {
    if (!this.target || !this.ambMarker) return;
    this.pos = this.lerp(this.pos, this.target, 0.06);
    this.ambMarker.setLatLng([this.pos.lat, this.pos.lng]);
    this.updateEta(this.status);
  },

  updateEta(status) {
    const el = document.getElementById("amb-eta");
    if (!el || !this.target) return;
    const pin = "position:absolute;top:.7rem;left:.7rem;z-index:500;box-shadow:var(--shadow)";
    if (status === "CLOSED" || status === "HOSPITAL_REACHED") {
      el.textContent = "✅ Trip complete";
      el.className = "badge badge-green";
      el.style.cssText = pin;
      return;
    }
    const km = MR.distanceKm(this.pos.lat, this.pos.lng, this.target.lat, this.target.lng);
    const mins = Math.max(1, Math.round((km / 40) * 60));
    el.textContent = `🛰️ Live: ${km.toFixed(1)} km away • ETA ~${mins} min`;
    el.className = "badge badge-red";
    el.style.cssText = pin;
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const last = JSON.parse(localStorage.getItem("mr_last_amb_request") || "null");
  if (last && last.status !== "CLOSED") {
    currentRequest = last;
    showTracking(last);
  }

  let fleet = await MR.api("/ambulance");
  const zone = document.getElementById("fleet-list");
  zone.innerHTML = fleet && fleet.length
    ? fleet
        .map(
          (a) => `
          <div class="list-item">
            <div><b>${a.code}</b> — ${a.type}<div style="font-size:.8rem;color:var(--muted)">Driver: ${a.driver} • 📞 ${a.phone}</div></div>
            <span class="badge badge-green">AVAILABLE</span>
          </div>`
        )
        .join("")
    : `<p style="color:var(--muted);font-size:.9rem">Fleet info unavailable offline — request will still be simulated.</p>`;
});
