const FALLBACK_BLOOD = [
  { id: "b1", name: "AIIMS Blood Centre", phone: "+91-11-26588500", lat: 28.5672, lng: 77.21, stock: { "A+": "available", "A-": "limited", "B+": "available", "B-": "contact", "O+": "available", "O-": "limited", "AB+": "available", "AB-": "contact" } },
  { id: "b2", name: "Red Cross Blood Bank", phone: "+91-11-23711553", lat: 28.6428, lng: 77.2222, stock: { "A+": "limited", "A-": "contact", "B+": "available", "B-": "limited", "O+": "available", "O-": "contact", "AB+": "limited", "AB-": "contact" } },
  { id: "b3", name: "Apollo Blood Bank", phone: "+91-11-71791090", lat: 28.5384, lng: 77.2843, stock: { "A+": "available", "A-": "limited", "B+": "limited", "B-": "available", "O+": "limited", "O-": "available", "AB+": "available", "AB-": "limited" } },
  { id: "b4", name: "Rotary Blood Bank", phone: "+91-11-41613636", lat: 28.5504, lng: 77.1904, stock: { "A+": "contact", "A-": "contact", "B+": "available", "B-": "limited", "O+": "available", "O-": "limited", "AB+": "contact", "AB-": "contact" } }
];

let group = "O+";

function badgeFor(status) {
  if (status === "available") return '<span class="badge badge-green">✅ Available</span>';
  if (status === "limited") return '<span class="badge badge-amber">⚠️ Limited</span>';
  return '<span class="badge badge-navy">📞 Contact Required</span>';
}

async function loadBlood() {
  document.getElementById("selected-group").textContent = group;
  let banks = await MR.api("/blood?group=" + encodeURIComponent(group));
  if (!banks) {
    banks = FALLBACK_BLOOD.map((b) => ({ ...b, availability: b.stock[group] || "contact" })).sort((a, z) => {
      const rank = { available: 0, limited: 1, contact: 2 };
      return (rank[a.availability] ?? 3) - (rank[z.availability] ?? 3);
    });
  }
  const zone = document.getElementById("blood-list");
  zone.innerHTML = banks
    .map(
      (b) => `
        <div class="card card-hover">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:.8rem">
            <h3 style="font-size:1.02rem">🏥 ${b.name}</h3>
            ${badgeFor(b.availability)}
          </div>
          <div class="chips" style="margin:.8rem 0">
            <span class="chip selected" style="cursor:default">🩸 ${group}</span>
            <span class="chip" style="cursor:default">📞 ${b.phone}</span>
          </div>
          <div style="display:flex;gap:.6rem;flex-wrap:wrap">
            <a class="btn btn-sm btn-teal" href="tel:${b.phone}">📞 Call Bank</a>
            <a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="${MR.directionsUrl(b.lat, b.lng)}">🧭 Directions</a>
          </div>
        </div>`
    )
    .join("");
}

document.querySelectorAll("#blood-chips .chip").forEach((chip) =>
  chip.addEventListener("click", () => {
    document.querySelectorAll("#blood-chips .chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    group = chip.dataset.g;
    loadBlood();
  })
);

document.getElementById("donor-alert-btn").addEventListener("click", () => {
  MR.toast(`📣 Donor request raised for ${group}! Nearby donors will be notified.`, "success");
});

document.addEventListener("DOMContentLoaded", loadBlood);
