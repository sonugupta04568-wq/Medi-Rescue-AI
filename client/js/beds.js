const BED_META = {
  general: { label: "🛏️ General" },
  icu: { label: "🏥 ICU" },
  oxygen: { label: "🫁 Oxygen" },
  ventilator: { label: "💨 Ventilator" }
};
let cityFilter = "All";
let beds = [];
let usingFallback = false;
let lastUpdated = null;

function bedStatus(cat) {
  if (cat.total === 0) return { cls: "badge-navy", text: "N/A" };
  const pct = cat.available / cat.total;
  if (pct === 0) return { cls: "badge-critical", text: "Full" };
  if (pct < 0.15) return { cls: "badge-amber", text: "Limited" };
  return { cls: "badge-green", text: "Available" };
}

function catRow(key, cat) {
  const pct = cat.total ? Math.round((cat.available / cat.total) * 100) : 0;
  const st = bedStatus(cat);
  return `
    <div class="bed-row">
      <span class="bed-label">${BED_META[key].label}</span>
      <div class="bed-bar"><div class="bed-bar-fill ${st.cls === "badge-green" ? "ok" : st.cls === "badge-amber" ? "warn" : "full"}" style="width:${pct}%"></div></div>
      <span class="bed-count">${cat.available} / ${cat.total}</span>
      <span class="badge ${st.cls}">${st.text}</span>
    </div>`;
}

function totalAvailable() {
  return beds.reduce((s, b) => s + b.general.available + b.icu.available + b.oxygen.available + b.ventilator.available, 0);
}

function renderSummary() {
  const zone = document.getElementById("beds-summary");
  const sum = { general: 0, icu: 0, oxygen: 0, ventilator: 0 };
  beds.forEach((b) => BED_CATS.forEach((k) => (sum[k] += b[k].available)));
  zone.innerHTML = `
    <div class="card stat-card"><div class="stat-icon red">🛏️</div><div><div class="stat-value">${sum.general}</div><div class="stat-label">General Beds Free</div></div></div>
    <div class="card stat-card"><div class="stat-icon navy">🏥</div><div><div class="stat-value">${sum.icu}</div><div class="stat-label">ICU Beds Free</div></div></div>
    <div class="card stat-card"><div class="stat-icon teal">🫁</div><div><div class="stat-value">${sum.oxygen}</div><div class="stat-label">Oxygen Beds Free</div></div></div>
    <div class="card stat-card"><div class="stat-icon amber">💨</div><div><div class="stat-value">${sum.ventilator}</div><div class="stat-label">Ventilators Free</div></div></div>`;
}

function render() {
  renderSummary();
  const zone = document.getElementById("beds-list");
  document.getElementById("beds-count").textContent =
    `${beds.length} hospitals • ${totalAvailable()} beds free • updated ${MR.timeAgo(lastUpdated)}`;
  zone.innerHTML = beds
    .map(
      (b) => `
    <div class="card card-hover">
      <div style="display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;flex-wrap:wrap">
        <div>
          <h3 style="font-size:1.02rem">🏥 ${b.name}</h3>
          <p style="color:var(--muted);font-size:.85rem">${b.city}${b.emergency ? " • 🚨 Emergency" : ""}</p>
        </div>
        <span class="badge badge-green"><span class="online-dot"></span>Live</span>
      </div>
      <div style="margin-top:.9rem;display:grid;gap:.45rem">
        ${catRow("general", b.general)}
        ${catRow("icu", b.icu)}
        ${catRow("oxygen", b.oxygen)}
        ${catRow("ventilator", b.ventilator)}
      </div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
        ${b.phone ? `<a class="btn btn-sm btn-teal" href="tel:${b.phone}">📞 Call Hospital</a>` : ""}
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${MR.directionsUrl(b.lat, b.lng)}">🧭 Directions</a>
        <a class="btn btn-sm btn-ghost" href="ambulance.html">🚑 Send Ambulance</a>
      </div>
    </div>`
    )
    .join("");
}

async function loadBeds() {
  let list = await MR.api("/beds" + (cityFilter !== "All" ? "?city=" + encodeURIComponent(cityFilter) : ""));
  if (list && list.length) {
    usingFallback = false;
    beds = list;
  } else {
    usingFallback = true;
    beds = LOCAL_BEDS.map((b) => {
      const h = HOSPITALS.find((x) => x.id === b.hospitalId) || {};
      return { ...b, name: h.name, city: h.city, emergency: h.emergency, phone: h.phone, lat: h.lat, lng: h.lng };
    })
      .filter((b) => cityFilter === "All" || b.city === cityFilter)
      .sort((a, b) => b.general.available + b.icu.available - (a.general.available + a.icu.available));
  }
  lastUpdated = new Date().toISOString();
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#bed-city-chips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll("#bed-city-chips .chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      cityFilter = chip.dataset.city;
      loadBeds();
    })
  );

  loadBeds();

  // Live updates: poll every 25s (server fluctuates counts every 12s); offline mode uses LOCAL_BEDS directly.
  setInterval(() => {
    if (usingFallback) render();
    else loadBeds();
  }, 25000);
});
