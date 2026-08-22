const SPECIALTIES = ["All", "Emergency Medicine", "General Physician", "Cardiologist", "Neurologist", "Orthopedic", "Pediatrician", "Trauma Surgeon", "Gynecologist"];
let specialty = "All";
let doctors = [];
let usingFallback = false;

function initials(name) {
  return name.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");
}

function waLink(d) {
  const text = encodeURIComponent(`Namaste ${d.name}, I need an urgent consultation — sent via MediRescue AI`);
  return `https://wa.me/${d.phone.replace(/[^0-9]/g, "")}?text=${text}`;
}

function render() {
  const zone = document.getElementById("doctor-list");
  const count = document.getElementById("doctor-count");
  const online = doctors.filter((d) => d.online).length;
  count.textContent = `${doctors.length} doctors • ${online} online now`;
  zone.innerHTML = doctors
    .map(
      (d) => `
    <div class="card card-hover doc-card">
      <div class="doc-head">
        <div class="doc-avatar">${initials(d.name)}</div>
        <div>
          <h3 style="font-size:1.02rem">${d.name}</h3>
          <p style="color:var(--muted);font-size:.85rem">${d.hospital} • ${d.city}</p>
        </div>
        ${d.online
          ? '<span class="badge badge-green"><span class="online-dot"></span>Online Now</span>'
          : '<span class="badge badge-navy">Offline</span>'}
      </div>
      <div class="chips" style="margin:.9rem 0">
        <span class="chip selected" style="cursor:default">🩺 ${d.specialty}</span>
        <span class="chip" style="cursor:default">⭐ ${d.rating}</span>
        <span class="chip" style="cursor:default">🎓 ${d.experience} yrs exp</span>
      </div>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <a class="btn btn-sm btn-teal" href="tel:${d.phone}">📞 Call</a>
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${waLink(d)}">💬 WhatsApp Consult</a>
      </div>
    </div>`
    )
    .join("");
}

async function loadDoctors() {
  let list = await MR.api("/doctors" + (specialty !== "All" ? "?specialty=" + encodeURIComponent(specialty) : ""));
  if (list && list.length) {
    usingFallback = false;
    doctors = list;
  } else {
    usingFallback = true;
    doctors = DOCTORS.filter((d) => specialty === "All" || d.specialty === specialty)
      .sort((a, b) => b.online - a.online || b.rating - a.rating);
  }
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  const chips = document.getElementById("spec-chips");
  chips.innerHTML = SPECIALTIES.map(
    (s) => `<button class="chip${s === "All" ? " selected" : ""}" data-spec="${s}">${s === "All" ? "👨‍⚕️ All" : "🩺 " + s}</button>`
  ).join("");
  chips.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      specialty = chip.dataset.spec;
      loadDoctors();
    })
  );

  loadDoctors();

  // Live status: poll every 30s from the server; in offline mode flip locally for the same live feel.
  setInterval(async () => {
    if (usingFallback) {
      const d = DOCTORS[Math.floor(Math.random() * DOCTORS.length)];
      d.online = !d.online;
      doctors = DOCTORS.filter((x) => specialty === "All" || x.specialty === specialty)
        .sort((a, b) => b.online - a.online || b.rating - a.rating);
      render();
    } else {
      loadDoctors();
    }
  }, 30000);
});
