const EMERGENCY_TYPES = ["Accident", "Heart Emergency", "Blood Loss", "Burn Injury", "Stroke", "Other Emergency"];
const RESCUE_NUMBER = "+919335870885";
const RESCUE_DISPLAY = "+91 93358 70885";

function getContacts() {
  return JSON.parse(localStorage.getItem("mr_contacts") || "[]");
}

function saveContacts(contacts) {
  localStorage.setItem("mr_contacts", JSON.stringify(contacts));
}

let sirenCtx = null;
let sirenNodes = null;

function startSiren() {
  try {
    sirenCtx = sirenCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (sirenCtx.state === "suspended") sirenCtx.resume();
    const gain = sirenCtx.createGain();
    gain.gain.value = 0.06;
    gain.connect(sirenCtx.destination);
    const osc1 = sirenCtx.createOscillator();
    const osc2 = sirenCtx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 650;
    osc2.frequency.value = 520;
    const lfo = sirenCtx.createOscillator();
    const lfoGain = sirenCtx.createGain();
    lfo.frequency.value = 2.4;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    osc1.connect(gain);
    osc2.connect(gain);
    osc1.start();
    osc2.start();
    lfo.start();
    sirenNodes = { gain, osc1, osc2, lfo };
  } catch {}
}

function stopSiren() {
  if (!sirenNodes) return;
  try {
    sirenNodes.gain.gain.setTargetAtTime(0, sirenCtx.currentTime, 0.1);
    setTimeout(() => {
      try {
        sirenNodes.osc1.stop();
        sirenNodes.osc2.stop();
        sirenNodes.lfo.stop();
      } catch {}
      sirenNodes = null;
    }, 400);
  } catch {}
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function dialRescue() {
  if (window.CallUI) {
    CallUI.open("MediRescue Rescue Line", RESCUE_DISPLAY);
  } else {
    window.location.href = "tel:" + RESCUE_NUMBER;
  }
}

function mapsLink(loc) {
  return loc ? `https://maps.google.com/?q=${loc.lat},${loc.lng}` : "Location unavailable";
}

function buildAlertText(record) {
  return `🚨 EMERGENCY SOS 🚨\nI need urgent help!\n\nEmergency ID: ${record.id}\nType: ${record.type}\nPriority: ${record.severity}\n📍 My live location: ${mapsLink(record.location)}\nRescue Line: ${RESCUE_DISPLAY}\n— sent via MediRescue AI`;
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
  if (btn.classList.contains("triggered")) {
    dialRescue();
    return;
  }
  btn.disabled = true;
  statusBig.textContent = "🚨 SOS ACTIVATED!";
  statusSub.textContent = `📡 Capturing location • 📞 Connecting to rescue line ${RESCUE_DISPLAY}`;
  vibrate([300, 120, 300, 120, 600]);
  startSiren();

  dialRescue();

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
  MR.toast(`📞 Rescue line ${RESCUE_DISPLAY} dialing…`, "error");
  btn.disabled = false;
}

function showEmergency(record, contacts) {
  const btn = document.getElementById("sos-btn");
  btn.classList.add("triggered");
  btn.innerHTML = "✅<small>SOS ACTIVE</small>";
  document.getElementById("sos-status-big").textContent = `Emergency ${record.id} is ACTIVE`;
  document.getElementById("sos-status-sub").textContent =
    `📞 Calling ${RESCUE_DISPLAY} • ` +
    (contacts.length ? `${contacts.length} contact(s) alerted` : "No emergency contacts saved — add them below!") +
    ` • Priority: ${record.severity}`;

  const tl = document.getElementById("sos-timeline");
  tl.innerHTML = `
    <div class="timeline-item done"><div class="t-label">📞 Rescue line dialed (${RESCUE_DISPLAY})</div><div class="t-time">${new Date(record.createdAt).toLocaleTimeString()}</div></div>
    <div class="timeline-item done"><div class="t-label">📍 Location captured</div><div class="t-time">${new Date(record.createdAt).toLocaleTimeString()}</div></div>
    <div class="timeline-item done"><div class="t-label">🚨 Emergency record created (${record.id})</div><div class="t-time">${record.severity} priority</div></div>
    <div class="timeline-item done"><div class="t-label">👨‍👩‍👦 Contacts alert workflow triggered</div><div class="t-time">${(record.contactsNotified || []).length} notified</div></div>
    <div class="timeline-item"><div class="t-label">🚑 Ambulance (request from Ambulance page)</div><div class="t-time">pending</div></div>`;

  const actions = document.getElementById("post-sos-actions");
  actions.style.display = "flex";

  const waZone = document.getElementById("wa-alerts");
  waZone.style.display = "flex";
  const text = encodeURIComponent(buildAlertText(record));
  waZone.innerHTML =
    (contacts.length
      ? contacts
          .map(
            (c) =>
              `<a class="btn btn-sm btn-teal" target="_blank" rel="noopener" href="https://wa.me/${String(c.phone).replace(/[^0-9]/g, "")}?text=${text}">💬 WhatsApp ${c.name}</a>`
          )
          .join("")
      : `<span style="font-size:.85rem;color:var(--muted)">Add contacts below for one-tap WhatsApp alerts.</span>`)+
    `<a class="btn btn-sm btn-ghost" href="sms:?&body=${text}">✉️ SMS Location</a>
     <button class="btn btn-sm btn-primary" id="stop-siren-btn" type="button">🔇 Stop Siren</button>
     <button class="btn btn-sm btn-navy" id="recall-btn" type="button">📞 Redial ${RESCUE_DISPLAY}</button>`;
  document.getElementById("stop-siren-btn").addEventListener("click", stopSiren);
  document.getElementById("recall-btn").addEventListener("click", dialRescue);

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
    <div class="emc-row"><span class="k">Rescue Line</span><span class="v">${RESCUE_DISPLAY}</span></div>
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

  const callBanner = document.getElementById("rescue-call-banner");
  if (callBanner) {
    callBanner.href = "tel:" + RESCUE_NUMBER;
    callBanner.textContent = `📞 Live Call — Rescue Line ${RESCUE_DISPLAY}`;
    callBanner.addEventListener("click", (e) => {
      e.preventDefault();
      dialRescue();
    });
  }

  const videoBtn = document.getElementById("video-call-btn");
  if (videoBtn) {
    videoBtn.addEventListener("click", () => {
      if (window.CallUI && window.CallUI.openVideo) {
        CallUI.openVideo("MediRescue Rescue Line", RESCUE_DISPLAY);
      } else {
        MR.toast("🎥 Video calling not supported on this page", "warn");
      }
    });
  }

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
