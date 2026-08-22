let cityFilter = "All";
let lastHospitals = [];
let lastUserLoc = null;

const Maps = {
  map: null,
  markers: [],
  userMarker: null,

  init(elementId, center = [28.6139, 77.209], zoom = 11) {
    this.map = L.map(elementId).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(this.map);
    return this.map;
  },

  setUser(lat, lng) {
    if (!this.map) return;
    if (this.userMarker) this.userMarker.remove();
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#e63946;border:3px solid #fff;box-shadow:0 0 0 6px rgba(230,57,70,.3),0 2px 8px rgba(0,0,0,.4)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    this.userMarker = L.marker([lat, lng], { icon }).addTo(this.map).bindPopup("📍 You are here");
    this.map.setView([lat, lng], 12);
  },

  plotHospitals(hospitals) {
    if (!this.map) return;
    this.markers.forEach((m) => m.remove());
    this.markers = hospitals.map((h) =>
      L.marker([h.lat, h.lng])
        .addTo(this.map)
        .bindPopup(`<b>${h.name}</b><br>${h.city || ""} — ${h.type}<br>${h.emergency ? "🚨 Emergency available" : "No emergency"}<br>${h.distanceKm != null ? h.distanceKm + " km away" : ""}`)
    );
  }
};

function applyCityFilter(hospitals) {
  return cityFilter === "All" ? hospitals : hospitals.filter((h) => h.city === cityFilter);
}

async function loadHospitals() {
  let userLoc = null;
  try {
    userLoc = await MR.getUserLocation();
  } catch {
    MR.toast("📍 Location denied — showing demo area (New Delhi)", "warn");
    userLoc = { lat: 28.6139, lng: 77.209 };
  }
  lastUserLoc = userLoc;

  Maps.setUser(userLoc.lat, userLoc.lng);
  document.getElementById("loc-status").textContent = `📍 Your location: ${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}`;

  let hospitals = await MR.api(`/hospitals?lat=${userLoc.lat}&lng=${userLoc.lng}&radius=60`);
  if (!hospitals || !hospitals.length) {
    hospitals = HOSPITALS
      .map((h) => ({ ...h, distanceKm: MR.distanceKm(userLoc.lat, userLoc.lng, h.lat, h.lng) }))
      .sort((a, b) => (b.emergency === true) - (a.emergency === true) || a.distanceKm - b.distanceKm);
  }

  lastHospitals = hospitals;
  const visible = applyCityFilter(hospitals);
  Maps.plotHospitals(visible);
  renderHospitalList(visible, userLoc);
}

function renderHospitalList(hospitals) {
  const list = document.getElementById("hospital-list");
  document.getElementById("hospital-count").textContent = `${hospitals.length} hospitals found`;
  list.innerHTML = hospitals
    .map(
      (h) => `
    <div class="card card-hover">
      <div style="display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start">
        <div>
          <h3 style="font-size:1.05rem">🏥 ${h.name}</h3>
          <p style="color:var(--muted);font-size:.86rem">${h.address || ""}</p>
        </div>
        ${h.emergency ? '<span class="badge badge-red">🚨 Emergency</span>' : '<span class="badge badge-navy">OPD Only</span>'}
      </div>
      <div class="chips" style="margin:.8rem 0">
        <span class="chip selected" style="cursor:default">📏 ${h.distanceKm != null ? h.distanceKm + " km" : "—"}</span>
        <span class="chip" style="cursor:default">🏷️ ${h.type}</span>
        ${h.city ? `<span class="chip" style="cursor:default">📍 ${h.city}</span>` : ""}
      </div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${MR.directionsUrl(h.lat, h.lng)}">🧭 Get Directions</a>
        ${h.phone ? `<a class="btn btn-sm btn-teal" href="tel:${h.phone}">📞 Call</a>` : ""}
        <a class="btn btn-sm btn-ghost" href="ambulance.html?hospital=${h.id}">🚑 Send Ambulance</a>
      </div>
    </div>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("map")) return;
  Maps.init("map");
  loadHospitals();
  const refreshBtn = document.getElementById("refresh-loc");
  if (refreshBtn) refreshBtn.addEventListener("click", loadHospitals);

  document.querySelectorAll("#city-chips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll("#city-chips .chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      cityFilter = chip.dataset.city;
      if (lastHospitals.length) {
        const visible = applyCityFilter(lastHospitals);
        Maps.plotHospitals(visible);
        renderHospitalList(visible);
      }
    })
  );
});
