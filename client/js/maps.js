const FALLBACK_HOSPITALS = [
  { id: "h1", name: "Apollo Hospital", type: "Private Multispeciality", lat: 28.5384, lng: 77.2843, emergency: true, phone: "+91-11-71791090", address: "Sarita Vihar, New Delhi" },
  { id: "h2", name: "AIIMS New Delhi", type: "Government Institute", lat: 28.5672, lng: 77.21, emergency: true, phone: "+91-11-26588500", address: "Ansari Nagar, New Delhi" },
  { id: "h3", name: "Safdarjung Hospital", type: "Government", lat: 28.5686, lng: 77.2073, emergency: true, phone: "+91-11-26165060", address: "Safdarjung Enclave, New Delhi" },
  { id: "h4", name: "Fortis Heart Institute", type: "Private Cardiac", lat: 28.5646, lng: 77.1637, emergency: true, phone: "+91-11-45822222", address: "Okhla Road, New Delhi" },
  { id: "h5", name: "Max Super Speciality", type: "Private Multispeciality", lat: 28.5525, lng: 77.2585, emergency: true, phone: "+91-11-26515050", address: "Saket, New Delhi" },
  { id: "h6", name: "BLK-Max Hospital", type: "Private Multispeciality", lat: 28.6435, lng: 77.1805, emergency: true, phone: "+91-11-30403040", address: "Pusa Road, New Delhi" },
  { id: "h7", name: "Lady Hardinge Medical College", type: "Government", lat: 28.6285, lng: 77.2016, emergency: true, phone: "+91-11-23408100", address: "Connaught Place, New Delhi" },
  { id: "h8", name: "City Care Clinic", type: "Private Clinic", lat: 28.6139, lng: 77.229, emergency: false, phone: "+91-11-40001000", address: "Barakhamba Road, New Delhi" }
];

const Maps = {
  map: null,
  markers: [],
  userMarker: null,

  init(elementId, center = [28.6139, 77.209], zoom = 12) {
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
    this.map.setView([lat, lng], 13);
  },

  plotHospitals(hospitals) {
    if (!this.map) return;
    this.markers.forEach((m) => m.remove());
    this.markers = hospitals.map((h) =>
      L.marker([h.lat, h.lng])
        .addTo(this.map)
        .bindPopup(`<b>${h.name}</b><br>${h.type}<br>${h.emergency ? "🚨 Emergency available" : "No emergency"}<br>${h.distanceKm != null ? h.distanceKm + " km away" : ""}`)
    );
  }
};

async function loadHospitals() {
  let userLoc = null;
  try {
    userLoc = await MR.getUserLocation();
  } catch {
    MR.toast("📍 Location denied — showing demo area (New Delhi)", "warn");
    userLoc = { lat: 28.6139, lng: 77.209 };
  }

  Maps.setUser(userLoc.lat, userLoc.lng);
  document.getElementById("loc-status").textContent = `📍 Your location: ${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}`;

  let hospitals = await MR.api(`/hospitals?lat=${userLoc.lat}&lng=${userLoc.lng}&radius=50`);
  if (!hospitals || !hospitals.length) {
    hospitals = FALLBACK_HOSPITALS
      .map((h) => ({ ...h, distanceKm: MR.distanceKm(userLoc.lat, userLoc.lng, h.lat, h.lng) }))
      .sort((a, b) => (b.emergency === true) - (a.emergency === true) || a.distanceKm - b.distanceKm);
  }

  Maps.plotHospitals(hospitals);
  renderHospitalList(hospitals, userLoc);
}

function renderHospitalList(hospitals, userLoc) {
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
      </div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${MR.directionsUrl(h.lat, h.lng)}">🧭 Get Directions</a>
        <a class="btn btn-sm btn-teal" href="tel:${h.phone}">📞 Call</a>
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
});
