const HOSPITALS = [
  // ---- Delhi ----
  { id: "h1", name: "Indraprastha Apollo Hospitals", city: "Delhi", type: "Private Multispeciality", lat: 28.5384, lng: 77.2843, emergency: true, phone: "+91-11-71791090", address: "Sarita Vihar, New Delhi" },
  { id: "h2", name: "AIIMS New Delhi", city: "Delhi", type: "Government Institute", lat: 28.5672, lng: 77.2100, emergency: true, phone: "+91-11-26588500", address: "Ansari Nagar, New Delhi" },
  { id: "h3", name: "Safdarjung Hospital", city: "Delhi", type: "Government", lat: 28.5686, lng: 77.2073, emergency: true, phone: "+91-11-26165060", address: "Safdarjung Enclave, New Delhi" },
  { id: "h4", name: "Fortis Flt. Lt. Rajan Dhall Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.5206, lng: 77.1573, emergency: true, address: "Vasant Kunj, New Delhi" },
  { id: "h5", name: "Max Super Speciality Hospital, Saket", city: "Delhi", type: "Private Multispeciality", lat: 28.5525, lng: 77.2585, emergency: true, phone: "+91-11-26515050", address: "Saket, New Delhi" },
  { id: "h6", name: "BLK-Max Super Speciality Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.6435, lng: 77.1805, emergency: true, phone: "+91-11-30403040", address: "Pusa Road, New Delhi" },
  { id: "h7", name: "Lady Hardinge Medical College", city: "Delhi", type: "Government", lat: 28.6285, lng: 77.2016, emergency: true, phone: "+91-11-23408100", address: "Connaught Place, New Delhi" },
  { id: "h9", name: "Fortis Hospital, Shalimar Bagh", city: "Delhi", type: "Private Multispeciality", lat: 28.7188, lng: 77.1601, emergency: true, address: "Shalimar Bagh, New Delhi" },
  { id: "h10", name: "Fortis Heart Institute", city: "Delhi", type: "Private Cardiac", lat: 28.5646, lng: 77.1637, emergency: true, phone: "+91-11-45822222", address: "Okhla Road, New Delhi" },
  { id: "h11", name: "Moolchand Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.5661, lng: 77.2344, emergency: true, address: "Lajpat Nagar, New Delhi" },
  { id: "h12", name: "Venkateshwar Super Speciality Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.5922, lng: 77.0491, emergency: true, address: "Dwarka, New Delhi" },
  { id: "h13", name: "Aakash Healthcare Super Speciality Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.5872, lng: 77.0457, emergency: true, address: "Dwarka Sector 3, New Delhi" },
  { id: "h14", name: "CK Birla Hospital", city: "Delhi", type: "Private Multispeciality", lat: 28.6729, lng: 77.1306, emergency: true, address: "Punjabi Bagh, New Delhi" },
  { id: "h15", name: "Sri Balaji Action Medical Institute", city: "Delhi", type: "Private Multispeciality", lat: 28.6703, lng: 77.1015, emergency: true, address: "Paschim Vihar, New Delhi" },
  { id: "h16", name: "Lok Nayak Hospital", city: "Delhi", type: "Government", lat: 28.6395, lng: 77.2465, emergency: true, address: "Delhi Gate, New Delhi" },
  { id: "h17", name: "G.B. Pant Hospital", city: "Delhi", type: "Government", lat: 28.6402, lng: 77.2447, emergency: true, address: "Jawaharlal Nehru Marg, New Delhi" },
  { id: "h18", name: "Guru Teg Bahadur Hospital", city: "Delhi", type: "Government", lat: 28.6815, lng: 77.3010, emergency: true, address: "Dilshad Garden, New Delhi" },
  { id: "h19", name: "Deen Dayal Upadhyay Hospital", city: "Delhi", type: "Government", lat: 28.6280, lng: 77.1110, emergency: true, address: "Hari Nagar, New Delhi" },
  { id: "h8", name: "City Care Clinic", city: "Delhi", type: "Private Clinic", lat: 28.6139, lng: 77.2290, emergency: false, address: "Barakhamba Road, New Delhi" },

  // ---- Noida ----
  { id: "n1", name: "Felix Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5880, lng: 77.3760, emergency: true, address: "Sector 76, Noida" },
  { id: "n2", name: "Jaypee Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5200, lng: 77.3260, emergency: true, address: "Sector 128, Noida" },
  { id: "n3", name: "Kailash Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5735, lng: 77.3210, emergency: true, address: "Sector 27, Noida" },
  { id: "n4", name: "Metro Hospital & Heart Institute", city: "Noida", type: "Private Cardiac", lat: 28.5810, lng: 77.3320, emergency: true, address: "Sector 11, Noida" },
  { id: "n5", name: "Fortis Hospital, Noida", city: "Noida", type: "Private Multispeciality", lat: 28.6270, lng: 77.3710, emergency: true, address: "Sector 62, Noida" },
  { id: "n6", name: "Yatharth Super Speciality Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5140, lng: 77.3830, emergency: true, address: "Sector 110, Noida" },
  { id: "n7", name: "Sharda Hospital", city: "Noida", type: "Private Teaching Hospital", lat: 28.4740, lng: 77.4930, emergency: true, address: "Knowledge Park III, Greater Noida" },
  { id: "n8", name: "Cloudnine Hospital", city: "Noida", type: "Private Maternity & Child", lat: 28.5730, lng: 77.3620, emergency: true, address: "Sector 51, Noida" },
  { id: "n9", name: "Neo Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5745, lng: 77.3570, emergency: true, address: "Sector 50, Noida" },
  { id: "n10", name: "Prayag Hospital", city: "Noida", type: "Private Multispeciality", lat: 28.5720, lng: 77.3460, emergency: true, address: "Sector 41, Noida" }
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

/* Demo doctor directory — fictional names & demo numbers (hackathon MVP data). */
const DOCTORS = [
  { id: "d1", name: "Dr. Aarav Mehta", specialty: "Cardiologist", hospital: "Indraprastha Apollo Hospitals", city: "Delhi", experience: 14, rating: 4.8, online: true, phone: "+91-9811000101" },
  { id: "d2", name: "Dr. Priya Sharma", specialty: "General Physician", hospital: "Max Super Speciality, Saket", city: "Delhi", experience: 9, rating: 4.7, online: true, phone: "+91-9811000102" },
  { id: "d3", name: "Dr. Rajeev Verma", specialty: "Neurologist", hospital: "AIIMS New Delhi", city: "Delhi", experience: 18, rating: 4.9, online: false, phone: "+91-9811000103" },
  { id: "d4", name: "Dr. Kavita Nair", specialty: "Emergency Medicine", hospital: "AIIMS New Delhi", city: "Delhi", experience: 11, rating: 4.8, online: true, phone: "+91-9811000104" },
  { id: "d5", name: "Dr. Sunil Joshi", specialty: "Orthopedic", hospital: "BLK-Max Super Speciality", city: "Delhi", experience: 12, rating: 4.6, online: false, phone: "+91-9811000105" },
  { id: "d6", name: "Dr. Meera Krishnan", specialty: "Pediatrician", hospital: "Fortis Shalimar Bagh", city: "Delhi", experience: 10, rating: 4.7, online: true, phone: "+91-9811000106" },
  { id: "d7", name: "Dr. Arvind Kumar", specialty: "Trauma Surgeon", hospital: "Lok Nayak Hospital", city: "Delhi", experience: 16, rating: 4.8, online: false, phone: "+91-9811000107" },
  { id: "d8", name: "Dr. Sunita Rao", specialty: "Gynecologist", hospital: "Moolchand Hospital", city: "Delhi", experience: 13, rating: 4.5, online: true, phone: "+91-9811000108" },
  { id: "d9", name: "Dr. Vikram Malhotra", specialty: "Cardiologist", hospital: "Fortis Hospital, Noida", city: "Noida", experience: 15, rating: 4.7, online: true, phone: "+91-9811000109" },
  { id: "d10", name: "Dr. Anjali Gupta", specialty: "General Physician", hospital: "Felix Hospital", city: "Noida", experience: 8, rating: 4.6, online: false, phone: "+91-9811000110" },
  { id: "d11", name: "Dr. Rohan Bansal", specialty: "Neurologist", hospital: "Jaypee Hospital", city: "Noida", experience: 12, rating: 4.7, online: true, phone: "+91-9811000111" },
  { id: "d12", name: "Dr. Farah Khan", specialty: "Pediatrician", hospital: "Kailash Hospital", city: "Noida", experience: 9, rating: 4.5, online: false, phone: "+91-9811000112" },
  { id: "d13", name: "Dr. Neha Singh", specialty: "Emergency Medicine", hospital: "Max Super Speciality, Saket", city: "Delhi", experience: 7, rating: 4.4, online: true, phone: "+91-9811000113" },
  { id: "d14", name: "Dr. Imran Sheikh", specialty: "Orthopedic", hospital: "Yatharth Super Speciality", city: "Noida", experience: 11, rating: 4.6, online: true, phone: "+91-9811000114" }
];

module.exports = { HOSPITALS, BLOOD_BANKS, AMBULANCES, DOCTORS };
