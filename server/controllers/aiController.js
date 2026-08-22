const RULES = [
  {
    category: "Severe Bleeding",
    keywords: ["bleed", "bleeding", "blood loss", "khoon", "ragda", "wound", "cut deeply", "zakhm"],
    priority: "CRITICAL",
    steps: [
      "Apply firm, continuous pressure with a clean cloth on the wound.",
      "Keep the injured part raised above heart level if possible.",
      "Do not remove soaked cloth — add more layers on top.",
      "Keep the person warm and still."
    ],
    followUp: "Is the bleeding heavy and not stopping with pressure?"
  },
  {
    category: "Cardiac / Chest Pain",
    keywords: ["chest pain", "heart attack", "cardiac", "seene mein dard", "dil ka dora", "heart", "angina"],
    priority: "CRITICAL",
    steps: [
      "Call emergency services (112/108) immediately — this can be life-threatening.",
      "Make the person sit down, half-reclined, and keep them calm.",
      "Loosen tight clothing.",
      "Do not give food or water. If prescribed nitroglycerin exists, help them take it."
    ],
    followUp: "Is there sweating, nausea, or pain spreading to the arm/jaw?"
  },
  {
    category: "Breathing Difficulty",
    keywords: ["breathing", "breathless", "can't breathe", "saans", "choking", "asthma", "suffocating"],
    priority: "CRITICAL",
    steps: [
      "Help the person sit upright — leaning slightly forward helps breathing.",
      "Loosen tight clothing around neck and chest.",
      "If an inhaler is prescribed, assist them in using it.",
      "Move to fresh air if smoke or gas is present."
    ],
    followUp: "Are the lips or fingertips turning blue?"
  },
  {
    category: "Unconsciousness",
    keywords: ["unconscious", "fainted", "behosh", "not responding", "collapsed", "passed out", "no pulse"],
    priority: "CRITICAL",
    steps: [
      "Check breathing immediately. If not breathing, start CPR if trained and call for help.",
      "If breathing, place the person on their side (recovery position).",
      "Do not put anything in their mouth or give water.",
      "Stay with them and monitor breathing until help arrives."
    ],
    followUp: "Is the person breathing normally right now?"
  },
  {
    category: "Burn Injury",
    keywords: ["burn", "burnt", "jala", "scald", "fire injury", "aag"],
    priority: "HIGH",
    steps: [
      "Cool the burn under gently running water for 10–20 minutes.",
      "Do NOT apply ice, toothpaste, oil, or ointments.",
      "Remove rings/tight items near the burn before swelling starts.",
      "Cover loosely with a clean, dry cloth."
    ],
    followUp: "Is the burn larger than the person's palm, or on face/hands?"
  },
  {
    category: "Stroke",
    keywords: ["stroke", "paralysis", "lakwa", "face droop", "slurred speech", "brain attack", "chakkar behosh bolne"],
    priority: "CRITICAL",
    steps: [
      "Note the exact time symptoms started — treatment depends on it.",
      "Run the FAST check: Face drooping, Arm weakness, Speech difficulty, Time to call.",
      "Do NOT give food, water, or medicines.",
      "Lay the person on their side with head slightly raised; call emergency now."
    ],
    followUp: "Did the symptoms start within the last 4 hours?"
  },
  {
    category: "Road Accident / Trauma",
    keywords: ["accident", "road accident", "crash", "hadsa", "hit by", "fell from", "trauma", "fracture", "haddi tuti"],
    priority: "CRITICAL",
    steps: [
      "Ensure scene safety first — do not become a second victim.",
      "Do NOT move the victim unless there is fire/traffic danger (possible spine injury).",
      "Control visible bleeding with firm pressure.",
      "Call an ambulance immediately; keep the victim warm and still."
    ],
    followUp: "Is the victim conscious and breathing?"
  },
  {
    category: "Poisoning / Overdose",
    keywords: ["poison", "overdose", "zeher", "swallowed chemical", "pills overdose"],
    priority: "CRITICAL",
    steps: [
      "Call emergency services and poison control immediately.",
      "Do NOT induce vomiting.",
      "Keep the container/strip to show medical staff.",
      "If unconscious but breathing, use recovery position."
    ],
    followUp: "Do you know what substance was taken and when?"
  }
];

const FALLBACK = {
  category: "General Emergency",
  priority: "MEDIUM",
  steps: [
    "Stay calm and move to a safe place.",
    "Assess: Is the person conscious? Breathing? Bleeding?",
    "For any life-threatening sign, press SOS or call 112/108 now.",
    "Describe the situation in more detail so I can guide you better."
  ],
  followUp: "Can you describe the main symptom or what happened?"
};

function detect(text) {
  const t = text.toLowerCase();
  const rule = RULES.find((r) => r.keywords.some((k) => t.includes(k)));
  const base = rule || { ...FALLBACK };
  const intensifier = /(severe|badly|heavy|unconscious|not breathing|bahut|zyada|gambhir)/.test(t);
  const priority = rule ? (intensifier && base.priority === "HIGH" ? "CRITICAL" : base.priority) : intensifier ? "HIGH" : base.priority;
  return { ...base, priority };
}

exports.chat = (req, res) => {
  const message = String(req.body.message || "").slice(0, 1000);
  if (!message.trim()) return res.status(400).json({ error: "message is required" });
  const result = detect(message);
  res.json({
    reply: `I understand this may be a ${result.category.toLowerCase()} situation. Here is immediate guidance while help is arranged.`,
    category: result.category,
    priority: result.priority,
    steps: result.steps,
    followUp: result.followUp,
    disclaimer: "MediRescue AI does not replace doctors or emergency services. In a life-threatening emergency, contact official emergency services immediately."
  });
};
