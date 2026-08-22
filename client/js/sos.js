const EMERGENCY_TYPES = ["Accident", "Heart Emergency", "Blood Loss", "Burn Injury", "Stroke", "Other Emergency"];

function getContacts() {
  return JSON.parse(localStorage.getItem("mr_contacts") || "[]");
}

function saveContacts(contacts) {
  localStorage.setItem("mr_contacts", JSON.stringify(contacts));
}

function renderContacts() {
  const wrap = document.getElementById("contacts-list");
  if (!wrap) return;
  const contacts = getContacts();
  if (!contacts.length) {
    wrap.innerHTML = `<p style="color:var(--muted);font-size:.9rem">No contacts yet. Add one — they will be alerted when you press SOS.</p>`;
    return;
  }
  wrap.innerHTML = contacts
    .map(
      (c, i) => `
    <div class="contact-item">
      <div>
        <div class="c-name">👤 ${c.name} <span class="badge badge-navy">${c.relation || "Contact"}</span></div>
        <div class="c-meta">📞 ${c.phone}</div>
      </div>
      <button class="btn btn-sm btn-ghost" data-del="${i}">✕</button>
    </div>`
    )
    .join("");
  wrap.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const contacts = getContacts();
      contacts.splice(Number(btn.dataset.del), 1);
      saveContacts(contacts);
      renderContacts();
    })
  );
}

function selectedSymptoms() {
  return [...document.querySelectorAll(".symptom-check input:checked")].map((c) => c.value);
}

function classifyPriority(symptoms) {
  const critical = ["Unconsciousness", "Difficulty breathing", "Chest pain"];
  const high = ["Severe bleeding", "Major accident", "Severe burn"];
  let score = 0;
  symptoms.forEach((s) => {
    if (critical.includes(s)) score += 2;
    else if (high.includes(s)) score += 1.5;
    else score += 0.5;
  });
  if (score >= 3.5) return "CRITICAL";
  if (score >= 2) return "HIGH";
  if (score >= 1) return "MEDIUM";
  return symptoms.length ? "MEDIUM" : "LOW";
}

async function triggerSOS() {
  const btn = document.getElementById("sos-btn");
  const statusBig = document.getElementById("sos-status-big");
  const statusSub = document.getElementById("sos-status-sub");
  btn.disabled = true;
  statusBig.textContent = "📡 Detecting location…";
  statusSub.textContent = "Please allow location access";

  let loc = null;
  try {
    loc = await MR.getUserLocation();
    document.getElementById("loc-pill").textContent = `📍 ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
  } catch {
    MR.toast("📍 Location denied — SOS created without GPS", "warn");
  }

  statusBig.textContent = "🚨 Creating emergency record…";
  const type = document.getElementById("sos-type").value;
  const symptoms = selectedSymptoms();
  const severity = classifyPriority(symptoms);
  const contacts = getContacts();

  const payload = {
    type,
    severity,
    location: loc,
    notes: symptoms.join(", "),
    contactsNotified: contacts.map((c) => ({ name: c.name, phone: c.phone })),
    userId: MR.user ? MR.user.email : null
  };

  let record = await MR.api("/emergency/create", { method: "POST", body: JSON.stringify(payload) });
  if (!record) {
    record = {
      id: "EMG-" + Date.now(),
      ...payload,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      timeline: [{ status: "ACTIVE", at: new Date().toISOString(), label: "SOS triggered (offline mode)" }]
    };
    const local = JSON.parse(localStorage.getItem("mr_local_emergencies") || "[]");
    local.unshift(record);
    localStorage.setItem("mr_local_emergencies", JSON.stringify(local));
  }

  localStorage.setItem("mr_last_emergency", JSON.stringify(record));
  showEmergency(record, contacts);
  MR.toast("🚨 SOS activated! Contacts alert workflow triggered.", "error");
  btn.disabled = false;
}

function showEmergency(record, contacts) {
  const btn = document.getElementById("sos-btn");
  btn.classList.add("triggered");
  btn.innerHTML = "✅<small>SOS ACTIVE</small>";
  document.getElementById("sos-status-big").textContent = `Emergency ${record.id} is ACTIVE`;
  document.getElementById("sos-status-sub").textContent =
    (contacts.length ? `${contacts.length} contact(s) alerted with your live location` : "No emergency contacts saved — add them now!") +
    ` • Priority: ${record.severity}`;

  const tl = document.getElementById("sos-timeline");
  tl.innerHTML = `
    <div class="timeline-item done"><div class="t-label">📍 Location captured</div><div class="t-time">${new Date(record.createdAt).toLocaleTimeString()}</div></div>
    <div class="timeline-item done"><div class="t-label">🚨 Emergency record created (${record.id})</div><div class="t-time">${record.severity} priority</div></div>
    <div class="timeline-item done"><div class="t-label">👨‍👩‍👦 Contacts alert workflow triggered</div><div class="t-time">${(record.contactsNotified || []).length} notified</div></div>
    <div class="timeline-item"><div class="t-label">🚑 Ambulance (request from Ambulance page)</div><div class="t-time">pending</div></div>`;

  const actions = document.getElementById("post-sos-actions");
  actions.style.display = "flex";

  const banner = document.getElementById("priority-banner");
  banner.className = "priority-banner " + record.severity.toLowerCase();
  banner.innerHTML = `<span>${{ CRITICAL: "🔴 CRITICAL PRIORITY", HIGH: "🟠 HIGH PRIORITY", MEDIUM: "🟡 MEDIUM PRIORITY", LOW: "🟢 LOW PRIORITY" }[record.severity]}</span><span style="font-weight:500;font-size:.85rem">Emergency Priority Recommendation</span>`;
  banner.style.display = "flex";
}

function renderEmergencyCard() {
  const card = document.getElementById("emc-card");
  if (!card) return;
  const profile = JSON.parse(localStorage.getItem("mr_profile") || "{}");
  const name = profile.name || (MR.user && MR.user.name) || "Guest User";
  card.innerHTML = `
    <div class="emc-head">
      <span class="title">━━ MEDIRESCUE ID ━━</span>
      <span class="emc-id">${"MR-" + Math.abs(hashCode(name + (profile.bloodGroup || ""))).toString(16).toUpperCase()}</span>
    </div>
    <div class="emc-row"><span class="k">Name</span><span class="v">${name}</span></div>
    <div class="emc-row"><span class="k">Age</span><span class="v">${profile.age || "—"}</span></div>
    <div class="emc-row"><span class="k">Blood Group</span><span class="v">${profile.bloodGroup || "—"}</span></div>
    <div class="emc-row"><span class="k">Allergies</span><span class="v">${profile.allergies || "None recorded"}</span></div>
    <div class="emc-row"><span class="k">Emergency Notes</span><span class="v">${profile.emergencyNotes || "—"}</span></div>
    <div class="emc-row"><span class="k">Contacts</span><span class="v">${getContacts().length} saved</span></div>`;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("sos-btn")) return;

  const typeSel = document.getElementById("sos-type");
  typeSel.innerHTML = EMERGENCY_TYPES.map((t) => `<option>${t}</option>`).join("");

  document.querySelectorAll(".symptom-check input").forEach((cb) =>
    cb.addEventListener("change", () => {
      cb.closest(".symptom-check").classList.toggle("checked", cb.checked);
      const p = classifyPriority(selectedSymptoms());
      const preview = document.getElementById("priority-preview");
      preview.innerHTML = p === "LOW" ? "" : MR.priorityBadge(p);
    })
  );

  document.getElementById("sos-btn").addEventListener("click", triggerSOS);

  document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const c = {
      name: document.getElementById("ct-name").value.trim(),
      phone: document.getElementById("ct-phone").value.trim(),
      relation: document.getElementById("ct-relation").value.trim()
    };
    if (!c.name || !c.phone) return;
    const contacts = getContacts();
    contacts.push(c);
    saveContacts(contacts);
    e.target.reset();
    renderContacts();
    MR.toast("👤 Contact added", "success");
  });

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = {
      name: document.getElementById("pf-name").value.trim(),
      age: document.getElementById("pf-age").value,
      bloodGroup: document.getElementById("pf-blood").value,
      allergies: document.getElementById("pf-allergies").value.trim(),
      emergencyNotes: document.getElementById("pf-notes").value.trim()
    };
    localStorage.setItem("mr_profile", JSON.stringify(profile));
    renderEmergencyCard();
    MR.toast("💳 Digital Emergency Card updated", "success");
  });

  const last = JSON.parse(localStorage.getItem("mr_last_emergency") || "null");
  if (last && last.status === "ACTIVE") showEmergency(last, getContacts());

  loadProfileForm();
  renderContacts();
  renderEmergencyCard();
});

function loadProfileForm() {
  const profile = JSON.parse(localStorage.getItem("mr_profile") || "{}");
  if (profile.name) document.getElementById("pf-name").value = profile.name;
  if (profile.age) document.getElementById("pf-age").value = profile.age;
  if (profile.bloodGroup) document.getElementById("pf-blood").value = profile.bloodGroup;
  if (profile.allergies) document.getElementById("pf-allergies").value = profile.allergies;
  if (profile.emergencyNotes) document.getElementById("pf-notes").value = profile.emergencyNotes;
}
