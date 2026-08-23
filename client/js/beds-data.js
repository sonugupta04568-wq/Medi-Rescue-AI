/* Demo bed availability — mirrors server generator so offline mode matches (hackathon MVP data).
   Requires hospitals-data.js (HOSPITALS) to be loaded first. */
const BED_CATS = ["general", "icu", "oxygen", "ventilator"];

function genBeds(hospitals) {
  return hospitals.map((h, i) => {
    const scale = h.emergency ? 1 : 0.3;
    const cat = (total, availPct) => {
      const t = Math.round(total * scale);
      const jitter = ((i * 7) % 5) - 2;
      return { total: t, available: Math.max(0, Math.min(t, Math.round(t * availPct + jitter))) };
    };
    return {
      hospitalId: h.id,
      general: cat(80, 0.35),
      icu: cat(20, 0.25),
      oxygen: cat(30, 0.3),
      ventilator: cat(10, 0.2)
    };
  });
}

let LOCAL_BEDS = genBeds(HOSPITALS);

/* Offline "live" feel: one random bed count changes every 12s (same as server). */
setInterval(() => {
  if (!LOCAL_BEDS.length) return;
  const b = LOCAL_BEDS[Math.floor(Math.random() * LOCAL_BEDS.length)];
  const cat = BED_CATS[Math.floor(Math.random() * BED_CATS.length)];
  const delta = Math.random() < 0.5 ? -1 : 1;
  b[cat].available = Math.max(0, Math.min(b[cat].total, b[cat].available + delta));
}, 12000);
