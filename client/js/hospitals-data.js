/* Shared hospital dataset — Delhi + Noida (demo MVP data; verify locally before relying on it).
   Phones are included only where an official board number is already known — otherwise the
   Call button is hidden rather than showing a guessed number. */
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
