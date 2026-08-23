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

/* Offline freeing-soon forecast — same logic as the server. */
const BedEvents = {
  events: [],
  seq: 0,
  addRandom() {
    if (!LOCAL_BEDS.length) return;
    if (this.events.filter((e) => e.status === "upcoming").length >= 8) return;
    const b = LOCAL_BEDS[Math.floor(Math.random() * LOCAL_BEDS.length)];
    const cat = BED_CATS[Math.floor(Math.random() * BED_CATS.length)];
    const room = b[cat].total - b[cat].available;
    if (room <= 0) return;
    const count = Math.min(room, 1 + Math.floor(Math.random() * 2));
    this.events.push({
      id: "LBE-" + ++this.seq,
      hospitalId: b.hospitalId,
      category: cat,
      count,
      freesAt: new Date(Date.now() + (2 + Math.floor(Math.random() * 7)) * 60000).toISOString(),
      status: "upcoming"
    });
  },
  tick() {
    const now = Date.now();
    this.events.forEach((e) => {
      if (e.status === "upcoming" && new Date(e.freesAt).getTime() <= now) {
        const b = LOCAL_BEDS.find((x) => x.hospitalId === e.hospitalId);
        if (b) b[e.category].available = Math.min(b[e.category].total, b[e.category].available + e.count);
        e.status = "applied";
        e.appliedAt = new Date().toISOString();
      }
    });
    const applied = this.events.filter((e) => e.status === "applied");
    if (applied.length > 10) {
      const remove = new Set(applied.slice(0, applied.length - 10).map((e) => e.id));
      this.events = this.events.filter((e) => !remove.has(e.id));
    }
  },
  get() {
    const hosp = (id) => HOSPITALS.find((h) => h.id === id) || {};
    return {
      upcoming: this.events
        .filter((e) => e.status === "upcoming")
        .sort((a, b) => a.freesAt.localeCompare(b.freesAt))
        .map((e) => ({ ...e, hospitalName: hosp(e.hospitalId).name, city: hosp(e.hospitalId).city })),
      recent: this.events
        .filter((e) => e.status === "applied")
        .sort((a, b) => (b.appliedAt || "").localeCompare(a.appliedAt || ""))
        .slice(0, 6)
        .map((e) => ({ ...e, hospitalName: hosp(e.hospitalId).name }))
    };
  }
};

for (let i = 0; i < 6; i++) BedEvents.addRandom();
setInterval(() => BedEvents.addRandom(), 20000);
setInterval(() => BedEvents.tick(), 5000);
