/* Homepage: live predicted beds — free-bed summary + freeing-soon countdowns.
   Requires hospitals-data.js and beds-data.js loaded first. */
const BED_META_HOME = {
  general: { label: "🛏️ General", one: "General bed" },
  icu: { label: "🏥 ICU", one: "ICU bed" },
  oxygen: { label: "🫁 Oxygen", one: "Oxygen bed" },
  ventilator: { label: "💨 Ventilator", one: "Ventilator" }
};

function fmtCountdownHome(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "now";
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

let homeBeds = [];
let homeFallback = false;

function renderHomeBeds(events) {
  const sum = { general: 0, icu: 0, oxygen: 0, ventilator: 0 };
  homeBeds.forEach((b) => BED_CATS.forEach((k) => (sum[k] += b[k].available)));
  const total = sum.general + sum.icu + sum.oxygen + sum.ventilator;

  document.getElementById("home-beds-summary").innerHTML = `
    <span class="chip selected" style="cursor:default">🟢 ${total} beds free now</span>
    <span class="chip" style="cursor:default">🛏️ ${sum.general} General</span>
    <span class="chip" style="cursor:default">🏥 ${sum.icu} ICU</span>
    <span class="chip" style="cursor:default">🫁 ${sum.oxygen} Oxygen</span>
    <span class="chip" style="cursor:default">💨 ${sum.ventilator} Ventilators</span>`;

  const zone = document.getElementById("home-beds-events");
  if (!events.upcoming.length) {
    zone.innerHTML = `<p style="color:var(--muted);font-size:.9rem">Naya predicted discharge 20 sec me aata hai…</p>`;
    return;
  }
  zone.innerHTML = events.upcoming
    .slice(0, 3)
    .map(
      (e) => `
      <div class="card event-card" style="box-shadow:none;background:var(--subtle)">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem">
          <span class="badge badge-green">+${e.count} ${BED_META_HOME[e.category].one}${e.count > 1 ? "s" : ""}</span>
          <span class="event-countdown" data-freesat="${e.freesAt}">${fmtCountdownHome(e.freesAt)}</span>
        </div>
        <h3 style="font-size:.95rem;margin-top:.6rem">🏥 ${e.hospitalName}</h3>
        <p style="color:var(--muted);font-size:.8rem">${e.city || ""} • frees in <span class="event-sub" data-freesat="${e.freesAt}">${fmtCountdownHome(e.freesAt)}</span></p>
      </div>`
    )
    .join("");
}

async function loadHomeBeds() {
  let list = await MR.api("/beds");
  if (list && list.length) {
    homeFallback = false;
    homeBeds = list;
  } else {
    homeFallback = true;
    homeBeds = LOCAL_BEDS.map((b) => {
      const h = HOSPITALS.find((x) => x.id === b.hospitalId) || {};
      return { ...b, name: h.name, city: h.city };
    });
  }
  let ev = homeFallback ? null : await MR.api("/beds/events");
  if (!ev) ev = BedEvents.get();
  renderHomeBeds(ev);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("home-beds-events")) return;
  loadHomeBeds();
  setInterval(loadHomeBeds, 25000);
  setInterval(() => {
    document.querySelectorAll("#home-beds-events .event-countdown, #home-beds-events .event-sub").forEach((el) => {
      el.textContent = fmtCountdownHome(el.dataset.freesat);
    });
  }, 1000);
});
