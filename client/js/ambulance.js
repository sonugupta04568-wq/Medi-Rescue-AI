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
