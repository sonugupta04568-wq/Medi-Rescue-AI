const { HOSPITALS, BLOOD_BANKS, AMBULANCES } = require("./data/seed");
const { isConnected } = require("./config/db");
const User = require("./models/User");
const Emergency = require("./models/Emergency");

const users = new Map();
const emergencies = new Map();
const ambulanceRequests = new Map();
const ambulances = AMBULANCES.map((a) => ({ ...a }));
let emergencySeq = 1000;

function nextEmergencyId() {
  emergencySeq += 1;
  return `EMG-${emergencySeq}`;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function saveUser(user) {
  if (isConnected()) {
    const doc = await User.create(user);
    return doc.toObject();
  }
  users.set(user.email, { ...user });
  return { ...user };
}

async function findUser(email) {
  if (isConnected()) {
    const doc = await User.findOne({ email }).lean();
    return doc || null;
  }
  return users.get(email) || null;
}

async function createEmergency(data) {
  const record = {
    id: nextEmergencyId(),
    userId: data.userId || null,
    type: data.type || "Other Emergency",
    severity: data.severity || "HIGH",
    location: data.location || null,
    address: data.address || "",
    notes: data.notes || "",
    contactsNotified: data.contactsNotified || [],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    timeline: [{ status: "ACTIVE", at: new Date().toISOString(), label: "SOS triggered, location captured" }]
  };
  if (isConnected()) {
    const doc = await Emergency.create(record);
    return doc.toObject();
  }
  emergencies.set(record.id, record);
  return record;
}

async function getEmergency(id) {
  if (isConnected()) return Emergency.findOne({ id }).lean();
  return emergencies.get(id) || null;
}

async function listEmergencies(limit = 20) {
  if (isConnected()) {
    const docs = await Emergency.find().sort({ createdAt: -1 }).limit(limit).lean();
    return docs;
  }
  return [...emergencies.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

async function updateEmergencyStatus(id, status, label) {
  let record = await getEmergency(id);
  if (!record) return null;
  record.status = status;
  record.timeline.push({ status, at: new Date().toISOString(), label: label || `Status → ${status}` });
  if (isConnected()) {
    await Emergency.updateOne({ id }, { $set: { status: record.status }, $push: { timeline: record.timeline[record.timeline.length - 1] } });
  } else {
    emergencies.set(id, record);
  }
  return record;
}

function listHospitals(lat, lng, radiusKm = 25) {
  const hasLoc = typeof lat === "number" && typeof lng === "number";
  return HOSPITALS.map((h) => ({
    ...h,
    distanceKm: hasLoc ? +haversine(lat, lng, h.lat, h.lng).toFixed(2) : null
  }))
    .filter((h) => !hasLoc || h.distanceKm <= radiusKm)
    .sort((a, b) => (b.emergency === true) - (a.emergency === true) || (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
}

function listBlood(group) {
  return BLOOD_BANKS.map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    lat: b.lat,
    lng: b.lng,
    availability: group ? b.stock[group] || "contact" : undefined,
    stock: b.stock
  })).sort((a, z) => {
    const rank = { available: 0, limited: 1, contact: 2 };
    return (rank[a.availability] ?? 3) - (rank[z.availability] ?? 3);
  });
}

function listAmbulances() {
  return ambulances.filter((a) => a.status === "AVAILABLE");
}

function createAmbulanceRequest(data) {
  const pool = ambulances.filter((a) => a.status === "AVAILABLE" && (!data.type || a.type === data.type));
  const unit = pool[0] || ambulances.find((a) => a.status === "AVAILABLE");
  if (!unit) return null;
  unit.status = "DISPATCHED";
  const request = {
    id: `REQ-${Date.now()}`,
    ambulance: { ...unit },
    emergencyType: data.emergencyType || "Other Emergency",
    pickup: data.pickup || null,
    destinationHospitalId: data.hospitalId || null,
    status: "ASSIGNED",
    etaMinutes: Math.max(4, Math.round(((unit.lat - (data.pickup?.lat || 28.61)) ** 2 + (unit.lng - (data.pickup?.lng || 77.21)) ** 2) ** 0.5 * 60)) || 8,
    createdAt: new Date().toISOString(),
    timeline: [{ status: "ASSIGNED", at: new Date().toISOString(), label: `${unit.code} assigned — driver ${unit.driver}` }]
  };
  ambulanceRequests.set(request.id, request);
  return request;
}

function getAmbulanceRequest(id) {
  return ambulanceRequests.get(id) || null;
}

const FLOW = ["ASSIGNED", "EN_ROUTE", "ARRIVED", "HOSPITAL_REACHED", "CLOSED"];

function advanceAmbulanceRequest(id) {
  const req = getAmbulanceRequest(id);
  if (!req) return null;
  const idx = FLOW.indexOf(req.status);
  if (idx === -1 || idx === FLOW.length - 1) return req;
  const next = FLOW[idx + 1];
  req.status = next;
  const labels = {
    EN_ROUTE: "Ambulance en route to pickup",
    ARRIVED: "Ambulance arrived at pickup",
    HOSPITAL_REACHED: "Patient reached hospital",
    CLOSED: "Emergency closed"
  };
  req.timeline.push({ status: next, at: new Date().toISOString(), label: labels[next] });
  if (next === "CLOSED") {
    const unit = ambulances.find((a) => a.id === req.ambulance.id);
    if (unit) unit.status = "AVAILABLE";
  }
  return req;
}

function getStats() {
  const all = [...emergencies.values()];
  return {
    activeEmergencies: all.filter((e) => e.status !== "RESOLVED" && e.status !== "CLOSED").length,
    resolved: all.filter((e) => e.status === "RESOLVED" || e.status === "CLOSED").length,
    totalEmergencies: all.length,
    ambulanceRequests: ambulanceRequests.size,
    hospitals: HOSPITALS.length,
    bloodBanks: BLOOD_BANKS.length,
    availableAmbulances: ambulances.filter((a) => a.status === "AVAILABLE").length
  };
}

module.exports = {
  saveUser,
  findUser,
  createEmergency,
  getEmergency,
  listEmergencies,
  updateEmergencyStatus,
  listHospitals,
  listBlood,
  listAmbulances,
  createAmbulanceRequest,
  getAmbulanceRequest,
  advanceAmbulanceRequest,
  getStats,
  haversine
};
