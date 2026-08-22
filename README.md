# 🚑 MediRescue AI — Smart Emergency Healthcare & Response Platform

> **"Fast Help. Smart Decisions. Saved Lives."**

MediRescue AI ek single platform hai jo **SOS, location sharing, ambulance request, hospital finder, blood availability aur AI emergency guidance** provide karta hai.

⚠️ **Disclaimer:** MediRescue AI doctors ya official emergency services ko replace nahi karta. Life-threatening emergency mein turant official emergency services (112 / 108 / 102) contact karein.

---

## 🎨 Prime Color Palette

| Role | Color | Hex |
|---|---|---|
| **Primary (Prime)** | Rescue Red | `#E63946` |
| Primary Dark | Deep Crimson | `#B02A35` |
| Secondary | Navy Blue | `#1D3557` |
| Accent | Medical Teal | `#2A9D8F` |
| Warning | Amber | `#F4A261` |
| Background | Cloud White | `#F4F7FB` |

---

## 🧩 Modules (Hackathon MVP)

1. ✅ **Smart SOS System** — GPS capture → Emergency record → Contacts alert workflow
2. ✅ **Nearby Hospital Finder** — Live map, distance, directions, emergency availability
3. ✅ **Ambulance Request System** — Request → Assign → Driver details → Live status tracking
4. ✅ **Blood Bank Finder** — Blood group availability (demo data)
5. ✅ **AI Emergency Assistant** — Intent detection → Guidance → Priority recommendation (Hindi + English)
6. ✅ **Emergency Severity Classification** — LOW / MEDIUM / HIGH / CRITICAL
7. ✅ **Digital Emergency Card** — Name, blood group, allergies, contacts
8. ✅ **Dashboard** — Active emergencies, resolved, ambulance requests stats

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JS, Leaflet.js (OpenStreetMap — no API key needed)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (optional — app auto-falls back to in-memory store for demo)
- **Auth:** JWT + bcrypt

---

## 🚀 Run Locally

```bash
npm install
npm start
```

Open: **http://localhost:5000**

- MongoDB optional hai. `MONGODB_URI` .env mein daalein to data persist hoga, warna in-memory demo mode chalega.
- Maps ke liye internet chahiye (OpenStreetMap tiles).

### Optional `.env`

```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster/medirescue
JWT_SECRET=change-me
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/emergency/create` | Create SOS emergency |
| GET | `/api/emergency` | List emergencies |
| GET | `/api/emergency/:id` | Emergency detail |
| PATCH | `/api/emergency/:id/status` | Update status |
| GET | `/api/hospitals?lat&lng&radius` | Nearby hospitals (sorted by distance) |
| GET | `/api/blood?group=O%2B` | Blood availability |
| GET | `/api/ambulances` | Available ambulances |
| POST | `/api/ambulance/request` | Request ambulance |
| PATCH | `/api/ambulance/request/:id/status` | Advance tracking status |
| POST | `/api/ai/chat` | AI emergency triage chat |
| GET | `/api/stats` | Dashboard stats |

---

## 🏆 Judge Demo Script

1. Open app → Login (ya demo mode)
2. **🚨 SOS** dabao → Location captured → Emergency created → Contacts alerted
3. Nearest hospitals dekho → Directions
4. Ambulance request → Assigned → Tracking
5. AI se pucho: *"There is a road accident and the person needs urgent help"*
6. Guidance + CRITICAL priority dikhega
7. Dashboard par stats: Active / Resolved / Ambulance requests

---

## 🔮 Future Scope

Voice SOS • Live GPS ambulance tracking • ABDM/ABHA integration • FHIR interoperability • Wearable/sensor accident detection • Multilingual AI
