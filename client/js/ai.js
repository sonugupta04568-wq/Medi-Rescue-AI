const AI_RULES = [
  { category: "Severe Bleeding", keywords: ["bleed", "bleeding", "blood loss", "khoon", "wound", "zakhm"], priority: "CRITICAL",
    steps: ["Apply firm, continuous pressure with a clean cloth.", "Keep the injured part raised above heart level if possible.", "Do not remove soaked cloth — add layers on top.", "Keep the person warm and still."],
    followUp: "Is the bleeding heavy and not stopping with pressure?" },
  { category: "Cardiac / Chest Pain", keywords: ["chest pain", "heart attack", "cardiac", "seene mein dard", "dil ka dora", "angina"], priority: "CRITICAL",
    steps: ["Call emergency services (112/108) immediately.", "Make the person sit half-reclined and keep them calm.", "Loosen tight clothing. Do not give food or water.", "If prescribed nitroglycerin exists, help them take it."],
    followUp: "Is there sweating, nausea, or pain spreading to the arm/jaw?" },
  { category: "Breathing Difficulty", keywords: ["breathing", "breathless", "can't breathe", "saans", "choking", "asthma"], priority: "CRITICAL",
    steps: ["Help the person sit upright, leaning slightly forward.", "Loosen tight clothing around neck and chest.", "Assist with a prescribed inhaler if available.", "Move to fresh air if smoke or gas is present."],
    followUp: "Are the lips or fingertips turning blue?" },
  { category: "Unconsciousness", keywords: ["unconscious", "fainted", "behosh", "not responding", "collapsed", "passed out"], priority: "CRITICAL",
    steps: ["Check breathing immediately. If absent, start CPR if trained.", "If breathing, place the person on their side (recovery position).", "Do not put anything in their mouth or give water.", "Monitor breathing until help arrives."],
    followUp: "Is the person breathing normally right now?" },
  { category: "Burn Injury", keywords: ["burn", "burnt", "jala", "scald", "fire injury"], priority: "HIGH",
    steps: ["Cool the burn under gently running water for 10–20 minutes.", "Do NOT apply ice, toothpaste, oil or ointments.", "Remove rings/tight items near the burn before swelling.", "Cover loosely with a clean, dry cloth."],
    followUp: "Is the burn larger than the person's palm, or on face/hands?" },
  { category: "Stroke", keywords: ["stroke", "paralysis", "lakwa", "face droop", "slurred speech"], priority: "CRITICAL",
    steps: ["Note the exact time symptoms started.", "Run FAST check: Face drooping, Arm weakness, Speech difficulty, Time to call.", "Do NOT give food, water or medicines.", "Lay on their side with head slightly raised; call emergency now."],
    followUp: "Did the symptoms start within the last 4 hours?" },
  { category: "Road Accident / Trauma", keywords: ["accident", "road accident", "crash", "hadsa", "hit by", "fell from", "fracture", "haddi tuti"], priority: "CRITICAL",
    steps: ["Ensure scene safety first — do not become a second victim.", "Do NOT move the victim unless there is fire/traffic danger.", "Control visible bleeding with firm pressure.", "Call an ambulance immediately; keep the victim warm and still."],
    followUp: "Is the victim conscious and breathing?" },
  { category: "Poisoning / Overdose", keywords: ["poison", "overdose", "zeher", "swallowed chemical"], priority: "CRITICAL",
    steps: ["Call emergency services and poison control immediately.", "Do NOT induce vomiting.", "Keep the container/strip to show medical staff.", "If unconscious but breathing, use recovery position."],
    followUp: "Do you know what substance was taken and when?" }
];

const AI_FALLBACK = {
  category: "General Emergency",
  priority: "MEDIUM",
  steps: ["Stay calm and move to a safe place.", "Assess: Is the person conscious? Breathing? Bleeding?", "For any life-threatening sign, press SOS or call 112/108 now.", "Describe the situation in more detail for better guidance."],
  followUp: "Can you describe the main symptom or what happened?"
};

function aiDetect(text) {
  const t = text.toLowerCase();
  const rule = AI_RULES.find((r) => r.keywords.some((k) => t.includes(k)));
  const intensifier = /(severe|badly|heavy|unconscious|not breathing|bahut|zyada|gambhir)/.test(t);
  const base = rule || { ...AI_FALLBACK };
  const priority = rule ? (intensifier && base.priority === "HIGH" ? "CRITICAL" : base.priority) : intensifier ? "HIGH" : base.priority;
  return { ...base, priority };
}

const QUICK_CHIPS = [
  "My friend is bleeding badly",
  "There is a road accident and the person needs urgent help",
  "Chest pain since 10 minutes",
  "Dad is having difficulty breathing",
  "My friend fainted and is not responding"
];

let chatBusy = false;

function pushMessage(html, who) {
  const zone = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = html;
  zone.appendChild(div);
  zone.scrollTop = zone.scrollHeight;
  return div;
}

async function sendMessage(text) {
  if (!text.trim() || chatBusy) return;
  chatBusy = true;
  pushMessage(escapeHtml(text), "user");
  const typing = pushMessage(`<span class="typing"><span></span><span></span><span></span></span>`, "bot");

  let data = await MR.api("/ai/chat", { method: "POST", body: JSON.stringify({ message: text }) });
  if (!data) {
    const local = aiDetect(text);
    data = {
      reply: `I understand this may be a ${local.category.toLowerCase()} situation. Here is immediate guidance while help is arranged.`,
      category: local.category,
      priority: local.priority,
      steps: local.steps,
      followUp: local.followUp
    };
  }

  typing.remove();
  const stepsHtml = data.steps.map((s) => `<li>${s}</li>`).join("");
  pushMessage(
    `${data.reply}
     <ul>${stepsHtml}</ul>
     <p style="margin-top:.5rem"><b>❓ ${data.followUp}</b></p>
     <div class="msg-meta">
       ${MR.priorityBadge(data.priority)}
       <span class="badge badge-navy">${data.category}</span>
     </div>
     <div class="msg-meta">
       <a class="btn btn-sm btn-primary" href="emergency.html">🚨 SOS</a>
       <a class="btn btn-sm btn-navy" href="ambulance.html">🚑 Ambulance</a>
       <a class="btn btn-sm btn-teal" href="hospitals.html">🏥 Hospitals</a>
       <a class="btn btn-sm btn-ghost" href="tel:112">📞 Call 112</a>
     </div>`,
    "bot"
  );
  chatBusy = false;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("chat-messages")) return;

  pushMessage(
    `👋 Hello! I'm your <b>MediRescue AI Assistant</b>. Describe the emergency in <b>Hindi or English</b>, and I'll give immediate first-aid guidance and an urgency recommendation.
     <div class="msg-meta"><span class="badge badge-amber">Guidance only — not a diagnosis</span></div>`,
    "bot"
  );

  const chipsZone = document.getElementById("quick-chips");
  chipsZone.innerHTML = QUICK_CHIPS.map((c) => `<button class="chip">${c}</button>`).join("");
  chipsZone.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => sendMessage(chip.textContent)));

  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    sendMessage(input.value);
    input.value = "";
  });
});
