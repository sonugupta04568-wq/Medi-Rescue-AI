const HOSPITALS = [
  { id: "h1", name: "Apollo Hospital", type: "Private Multispeciality", lat: 28.5384, lng: 77.2843, emergency: true, phone: "+91-11-71791090", address: "Sarita Vihar, New Delhi" },
  { id: "h2", name: "AIIMS New Delhi", type: "Government Institute", lat: 28.5672, lng: 77.21, emergency: true, phone: "+91-11-26588500", address: "Ansari Nagar, New Delhi" },
  { id: "h3", name: "Safdarjung Hospital", type: "Government", lat: 28.5686, lng: 77.2073, emergency: true, phone: "+91-11-26165060", address: "Safdarjung Enclave, New Delhi" },
  { id: "h4", name: "Fortis Heart Institute", type: "Private Cardiac", lat: 28.5646, lng: 77.1637, emergency: true, phone: "+91-11-45822222", address: "Okhla Road, New Delhi" },
  { id: "h5", name: "Max Super Speciality", type: "Private Multispeciality", lat: 28.5525, lng: 77.2585, emergency: true, phone: "+91-11-26515050", address: "Saket, New Delhi" },
  { id: "h6", name: "BLK-Max Hospital", type: "Private Multispeciality", lat: 28.6435, lng: 77.1805, emergency: true, phone: "+91-11-30403040", address: "Pusa Road, New Delhi" },
  { id: "h7", name: "Lady Hardinge Medical College", type: "Government", lat: 28.6285, lng: 77.2016, emergency: true, phone: "+91-11-23408100", address: "Connaught Place, New Delhi" },
  { id: "h8", name: "City Care Clinic", type: "Private Clinic", lat: 28.6139, lng: 77.229, emergency: false, phone: "+91-11-40001000", address: "Barakhamba Road, New Delhi" }
];

const BLOOD_BANKS = [
  { id: "b1", name: "AIIMS Blood Centre", lat: 28.5672, lng: 77.21, phone: "+91-11-26588500", stock: { "A+": "available", "A-": "limited", "B+": "available", "B-": "contact", "O+": "available", "O-": "limited", "AB+": "available", "AB-": "contact" } },
  { id: "b2", name: "Red Cross Blood Bank", lat: 28.6428, lng: 77.2222, phone: "+91-11-23711553", stock: { "A+": "limited", "A-": "contact", "B+": "available", "B-": "limited", "O+": "available", "O-": "contact", "AB+": "limited", "AB-": "contact" } },
  { id: "b3", name: "Apollo Blood Bank", lat: 28.5384, lng: 77.2843, phone: "+91-11-71791090", stock: { "A+": "available", "A-": "limited", "B+": "limited", "B-": "available", "O+": "limited", "O-": "available", "AB+": "available", "AB-": "limited" } },
  { id: "b4", name: "Rotary Blood Bank", lat: 28.5504, lng: 77.1904, phone: "+91-11-41613636", stock: { "A+": "contact", "A-": "contact", "B+": "available", "B-": "limited", "O+": "available", "O-": "limited", "AB+": "contact", "AB-": "contact" } }
];

const AMBULANCES = [
  { id: "a1", code: "MR-101", type: "Basic", driver: "Ramesh Kumar", phone: "+91-9810010101", lat: 28.615, lng: 77.21, status: "AVAILABLE" },
  { id: "a2", code: "MR-205", type: "ALS", driver: "Sunil Yadav", phone: "+91-9810020202", lat: 28.605, lng: 77.245, status: "AVAILABLE" },
  { id: "a3", code: "MR-307", type: "BLS", driver: "Arjun Singh", phone: "+91-9810030303", lat: 28.63, lng: 77.19, status: "AVAILABLE" },
  { id: "a4", code: "MR-412", type: "Neonatal", driver: "Pooja Sharma", phone: "+91-9810040404", lat: 28.59, lng: 77.225, status: "AVAILABLE" },
  { id: "a5", code: "MR-509", type: "Basic", driver: "Mohd. Faizan", phone: "+91-9810050505", lat: 28.57, lng: 77.26, status: "AVAILABLE" }
];

module.exports = { HOSPITALS, BLOOD_BANKS, AMBULANCES };
