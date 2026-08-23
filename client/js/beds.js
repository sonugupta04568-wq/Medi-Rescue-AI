const BED_META = {
  general: { label: "🛏️ General", one: "General bed" },
  icu: { label: "🏥 ICU", one: "ICU bed" },
  oxygen: { label: "🫁 Oxygen", one: "Oxygen bed" },
  ventilator: { label: "💨 Ventilator", one: "Ventilator" }
};
let cityFilter = "All";
let categoryFilter = "all";
let beds = [];
let events = { upcoming: [], recent: [] };
let usingFallback = false;
let lastUpdated = null;
let lastAvail = {}; // { hospitalId: { general: n, icu: n, ... } }
let flashSet = new Set(); // "hospitalId:cat" keys that changed since last render
const feed = []; // live activity items

function bedStatus(cat) {
  if (cat.total === 0) return { cls: "badge-navy", text: "N/A" };
  const pct = cat.available / cat.total;
  if (pct === 0) return { cls: "badge-critical", text: "Full" };
  if (pct < 0.15) return { cls: "badge-amber", text: "Limited" };
  return { cls: "badge-green", text: "Available" };
}

function catRow(hospitalId, key, cat) {
  const pct = cat.total ? Math.round((cat.available / cat.total) * 100) : 0;
  const st = bedStatus(cat);
  const flash = flashSet.has(hospitalId + ":" + key);
  const flashCls = flash ? (lastAvail[hospitalId] && cat.available > (lastAvail[hospitalId][key] ?? cat.available) ? "flash-up" : "flash-down") : "";
  return `
    <div class="bed-row">
      <button type="button" class="bed-label clickable" data-opencat="${key}" title="${BED_META[key].one} view kholo">${BED_META[key].label} ↗</button>
      <div class="bed-bar"><div class="bed-bar-fill ${st.cls === "badge-green" ? "ok" : st.cls === "badge-amber" ? "warn" : "full"}" style="width:${pct}%"></div></div>
      <span class="bed-count ${flashCls}">${cat.available} / ${cat.total}</span>
      <span class="badge ${st.cls}">${st.text}</span>
    </div>`;
}

function categoryCard(b, k) {
  const cat = b[k];
  const pct = cat.total ? Math.round((cat.available / cat.total) * 100) : 0;
  const st = bedStatus(cat);
  const ev = events.upcoming.find((e) => e.hospitalId === b.hospitalId && e.category === k);
  return `
    <div class="card card-hover">
      <div style="display:flex;justify-content:space-between;gap:.8rem;align-items:flex-start;flex-wrap:wrap">
        <div>
          <h3 style="font-size:1.02rem">🏥 ${b.name}</h3>
          <p style="color:var(--muted);font-size:.85rem">${b.city}${b.emergency ? " • 🚨 Emergency" : ""}</p>
        </div>
        <span class="badge badge-green"><span class="online-dot"></span>Live</span>
      </div>
      <div class="cat-big-row">
        <span class="cat-big">${cat.available}<small> / ${cat.total} ${BED_META[k].one}s</small></span>
        <span class="badge ${st.cls}">${st.text}</span>
      </div>
      <div class="bed-bar bed-bar-lg"><div class="bed-bar-fill ${st.cls === "badge-green" ? "ok" : st.cls === "badge-amber" ? "warn" : "full"}" style="width:${pct}%"></div></div>
      ${ev ? `<p class="cat-soon">⏱️ +${ev.count} more freeing in <b class="event-sub" data-freesat="${ev.freesAt}">${fmtCountdown(ev.freesAt)}</b></p>` : ""}
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.9rem">
        ${b.phone ? `<a class="btn btn-sm btn-teal" href="tel:${b.phone}">📞 Call Hospital</a>` : ""}
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${MR.directionsUrl(b.lat, b.lng)}">🧭 Directions</a>
        <a class="btn btn-sm btn-ghost" href="ambulance.html">🚑 Send Ambulance</a>
      </div>
    </div>`;
}

function totalAvailable() {
  return beds.reduce((s, b) => s + b.general.available + b.icu.available + b.oxygen.available + b.ventilator.available, 0);
}

function fmtCountdown(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "now";
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
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

function renderEvents() {
  const zone = document.getElementById("beds-events");
  if (!events.upcoming.length) {
    zone.innerHTML = `<p style="color:var(--muted);font-size:.9rem">Koi scheduled discharge abhi nahi — naya forecast 20 sec me aata hai.</p>`;
    return;
  }
  zone.innerHTML = events.upcoming
    .map(
      (e) => `
      <div class="card event-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">
          <span class="badge badge-green">+${e.count} ${BED_META[e.category].one}${e.count > 1 ? "s" : ""}</span>
          <span class="event-countdown" data-freesat="${e.freesAt}">${fmtCountdown(e.freesAt)}</span>
        </div>
        <h3 style="font-size:.98rem;margin-top:.6rem">🏥 ${e.hospitalName}</h3>
        <p style="color:var(--muted);font-size:.82rem">${e.city || ""} • frees in <span class="event-sub" data-freesat="${e.freesAt}">${fmtCountdown(e.freesAt)}</span></p>
      </div>`
    )
    .join("");
}

function renderFeed() {
  const zone = document.getElementById("beds-feed");
  if (!feed.length) {
    zone.innerHTML = `<div class="timeline-item"><div class="t-label">Waiting for live changes…</div><div class="t-time">bed numbers update every few seconds</div></div>`;
    return;
  }
  zone.innerHTML = feed
    .slice(0, 6)
    .map(
      (f) => `
      <div class="timeline-item ${f.dir === "up" ? "done" : ""}">
        <div class="t-label">${f.dir === "up" ? "🟢" : "🔴"} ${f.text}</div>
        <div class="t-time">${f.time}</div>
      </div>`
    )
    .join("");
}

function render() {
  renderSummary();
  renderEvents();
  renderFeed();
  const zone = document.getElementById("beds-list");
  document.getElementById("beds-count").textContent =
    `${beds.length} hospitals • ${totalAvailable()} beds free • updated ${MR.timeAgo(lastUpdated)}`;
  if (categoryFilter !== "all") {
    const k = categoryFilter;
    const sorted = [...beds].sort((a, b) => b[k].available - a[k].available);
    zone.innerHTML = sorted.map((b) => categoryCard(b, k)).join("");
    return;
  }
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
        ${catRow(b.hospitalId, "general", b.general)}
        ${catRow(b.hospitalId, "icu", b.icu)}
        ${catRow(b.hospitalId, "oxygen", b.oxygen)}
        ${catRow(b.hospitalId, "ventilator", b.ventilator)}
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

function diffAndFeed() {
  flashSet = new Set();
  const next = {};
  beds.forEach((b) => {
    next[b.hospitalId] = {};
    BED_CATS.forEach((k) => (next[b.hospitalId][k] = b[k].available));
    const prev = lastAvail[b.hospitalId];
    if (!prev) return;
    BED_CATS.forEach((k) => {
      if (b[k].available !== prev[k]) {
        flashSet.add(b.hospitalId + ":" + k);
        const n = Math.abs(b[k].available - prev[k]);
        feed.unshift({
          dir: b[k].available > prev[k] ? "up" : "down",
          text: `${n} ${BED_META[k].one}${n > 1 ? "s" : ""} ${b[k].available > prev[k] ? "freed" : "occupied"} at ${b.name}`,
          time: new Date().toLocaleTimeString()
        });
      }
    });
  });
  if (feed.length > 12) feed.length = 12;
  lastAvail = next;
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
  diffAndFeed();
  lastUpdated = new Date().toISOString();
  render();
}

async function loadEvents() {
  let ev = usingFallback ? null : await MR.api("/beds/events");
  if (!ev) ev = BedEvents.get();
  events = ev;
  renderEvents();
}

function setCategory(cat) {
  categoryFilter = cat;
  document.querySelectorAll("#bed-cat-chips .chip").forEach((c) => c.classList.toggle("selected", c.dataset.cat === cat));
  render();
  const head = document.getElementById("beds-list");
  if (head) head.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#bed-cat-chips .chip").forEach((chip) =>
    chip.addEventListener("click", () => setCategory(chip.dataset.cat))
  );

  // Bed-type labels inside hospital cards are clickable → open that category's view
  document.getElementById("beds-list").addEventListener("click", (e) => {
    const el = e.target.closest("[data-opencat]");
    if (el) setCategory(el.dataset.opencat);
  });

  document.querySelectorAll("#bed-city-chips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll("#bed-city-chips .chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      cityFilter = chip.dataset.city;
      lastAvail = {};
      feed.length = 0;
      loadBeds();
    })
  );

  loadBeds();
  loadEvents();

  // Live movement: poll beds every 10s (loadBeds handles server + local modes), events every 20s; countdowns tick every second.
  setInterval(loadBeds, 10000);
  setInterval(loadEvents, 20000);
  setInterval(() => {
    document.querySelectorAll(".event-countdown, .event-sub").forEach((el) => {
      el.textContent = fmtCountdown(el.dataset.freesat);
    });
  }, 1000);
});
