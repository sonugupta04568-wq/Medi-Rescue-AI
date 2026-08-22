# 🚑 MediRescue AI — Smart Emergency Healthcare & Response Platform

<div align="center">

![MediRescue AI](https://img.shields.io/badge/🚑_MediRescue_AI-Emergency_Platform-E63946?style=for-the-badge&labelColor=1D3557)

**"Fast Help. Smart Decisions. Saved Lives."**

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-Click_Here-2A9D8F?style=for-the-badge)](https://sonugupta04568-wq.github.io/Medi-Rescue-AI/client/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-1D3557?style=for-the-badge&logo=github)](https://github.com/sonugupta04568-wq/Medi-Rescue-AI)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 🔗 Live Project

> ### 🌐 **https://sonugupta04568-wq.github.io/Medi-Rescue-AI/client/**

| | |
|---|---|
| **Demo Login** | `demo@medirescue.ai` / `demo123` *(ya "Quick Demo Login" button)* |
| **📞 Rescue Line** | `+91 93358 70885` — SOS click par direct auto-call |
| **Mode** | GitHub Pages par frontend **offline demo mode** mein chalta hai (backend optional) |

---

## ⚠️ Disclaimer

> MediRescue AI doctors ya official emergency services ko replace **nahi** karta. Ye guidance aur triage support tool hai — medical diagnosis nahi. Life-threatening emergency mein turant **112 / 108 / 102** dial karein.

---

## 🧭 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Solution & User Journey](#-solution--user-journey)
3. [Modules & Features](#-modules--features)
4. [Tech Stack](#-tech-stack)
5. [System Architecture](#-system-architecture)
6. [Prime Color Palette](#-prime-color-palette)
7. [Run Locally](#-run-locally-full-stack)
8. [API Documentation](#-api-documentation)
9. [Judge Demo Script](#-judge-demo-script-)
10. [Project Structure](#-project-structure)
11. [Future Roadmap](#-future-roadmap-)

---

## ❗ Problem Statement

Emergency ke time har second matter karta hai — lekin aaj bhi users ko multiple problems face karni padti hain:

| # | Problem |
|---|---------|
| 😰 | Nearest hospital ka pata nahi hota |
| 🚑 | Ambulance quickly find/book karna mushkil hai |
| 🩸 | Blood availability ki information scattered hai |
| 👨‍👩‍👦 | Emergency contacts ko location manually bhejni padti hai |
| 🏥 | Patient ki medical info responders ke paas nahi hoti |
| 🤯 | Panic mein sahi action decide karne mein time lagta hai |

**MediRescue AI in sab ka ek single-platform solution hai.**

---

## ✨ Solution & User Journey

```
🚨 EMERGENCY OCCURS
        ↓
 User opens MediRescue AI
        ↓
 Presses SOS Button (1 click)
        ↓
 📞 DIRECT CALL → Rescue Line (+91 93358 70885)
        ↓
 Current GPS Location Captured
        ↓
 Emergency Record Created + Siren + Vibration
        ↓
 Contacts Alerted (WhatsApp/SMS with live location)
        ↓
 Nearby Hospitals Displayed (sorted by distance)
        ↓
 Ambulance Request Generated → Assigned → Tracked
        ↓
 AI Emergency Assistant Provides Guidance
        ↓
 Live Status Tracking → Hospital Reached → Closed
```

---

## 🧩 Modules & Features

### 1. 🚨 Smart SOS System ⭐ *(Flagship)*
- **One-click direct auto-dial** to rescue line `+91 93358 70885` (`tel:` protocol)
- Instant GPS capture via `navigator.geolocation`
- Emergency record creation with unique ID (`EMG-XXXX`)
- 🔊 **Emergency siren** (Web Audio API — works offline)
- 📳 **Vibration feedback** pattern
- 💬 **One-tap WhatsApp alerts** per contact with Google Maps live location
- ✉️ SMS fallback with full emergency details
- Pulsing SOS button + animated rescue-line banner

### 2. 🏥 Nearby Hospital Finder
- Live Leaflet map (OpenStreetMap — **no API key needed**)
- Distance-sorted hospitals, emergency availability badges
- One-tap: Directions (Google Maps), Call, Send Ambulance
- Auto-fallback demo data if location denied

### 3. 🚑 Ambulance Request System
- Ambulance types: Basic / BLS / ALS / Neonatal
- GPS pickup location → request → unit assigned
- Driver details card + call button
- 5-step live tracking: `ASSIGNED → EN_ROUTE → ARRIVED → HOSPITAL_REACHED → CLOSED`

### 4. 🩸 Blood Bank Finder
- Blood group selector chips (A+ → AB−)
- Availability status: ✅ Available / ⚠️ Limited / 📞 Contact Required
- Sorted results, call bank, directions
- Emergency donor request broadcast

### 5. 🤖 AI Emergency Assistant
- Understands **Hindi + English** ("khoon beh raha hai" ✓)
- Intent detection across 8 emergency categories
- Safe first-aid steps + follow-up questions
- Priority badge: LOW → MEDIUM → HIGH → CRITICAL
- Quick action buttons: SOS / Ambulance / Hospitals / Call 112

### 6. 🧠 Emergency Severity Classification
- Symptom checkboxes → weighted scoring engine
- Output labeled as **"Emergency Priority Recommendation"** (not diagnosis)

### 7. 👤 Digital Emergency Card
- Name, age, blood group, allergies, notes, rescue line, contacts
- Unique MediRescue ID generation

### 8. 📊 Operations Dashboard
- Live stats: Active emergencies, Resolved, Ambulance requests, Hospitals
- Recent emergencies feed + fleet status

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Maps** | Leaflet.js + OpenStreetMap (zero API keys) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas *(optional — auto in-memory fallback)* |
| **Auth** | JWT + bcryptjs |
| **AI Engine** | Rule-based triage NLU (offline-capable, EN/HI) |
| **Deployment** | GitHub Pages (frontend) |

---

## 🏗 System Architecture

```
                    ┌───────────────┐
                    │     USER      │
                    └───────┬───────┘
                            │
                            ▼
                 ┌────────────────────┐
                 │   MEDIRESCUE AI    │
                 │    FRONTEND UI     │
                 └─────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
     SOS SYSTEM       MAP SERVICE      AI ASSISTANT
   (call+siren+GPS)   (Leaflet/OSM)   (triage engine)
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                   ┌──────────────┐
                   │ NODE.JS API  │
                   │   EXPRESS    │
                   └──────┬───────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          MongoDB     Distance     Notification
          (optional)   Engine      (WhatsApp/SMS/tel:)
```

**Smart Degradation:** Backend unavailable? App automatically switches to **offline demo mode** (localStorage) — perfect for judges with zero setup.

---

## 🎨 Prime Color Palette

<div align="center">

| 🟥 | 🟦 | 🟩 | 🟧 | ⬜ |
|---|---|---|---|---|
| **`#E63946`** | `#1D3557` | `#2A9D8F` | `#F4A261` | `#F4F7FB` |
| **Prime — Rescue Red** | Secondary — Navy | Accent — Medical Teal | Warning — Amber | Background — Cloud |

</div>

---

## 🚀 Run Locally (Full Stack)

```bash
git clone https://github.com/sonugupta04568-wq/Medi-Rescue-AI.git
cd Medi-Rescue-AI
npm install
npm start
```

Open: **http://localhost:5000**

| Mode | Kaise chalega |
|---|---|
| **Full stack** | `npm start` → APIs + MongoDB (agar URI diya ho) |
| **Frontend-only** | `client/index.html` directly browser mein — offline demo mode |
| **MongoDB off** | Koi problem nahi — in-memory store automatically use hota hai |

### Optional `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster/medirescue
JWT_SECRET=change-me-in-production
```

> 📱 Mobile par SOS test karne ke liye phone se `http://<your-pc-ip>:5000/emergency.html` kholein — tel: auto-call dialer khulega.

---

## 🔌 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user (JWT response) |
| POST | `/api/auth/login` | Login user |
| POST | `/api/emergency/create` | Create SOS emergency |
| GET | `/api/emergency` | List emergencies |
| GET | `/api/emergency/:id` | Emergency detail |
| PATCH | `/api/emergency/:id/status` | Update status |
| GET | `/api/hospitals?lat&lng&radius` | Nearby hospitals (emergency-first sort) |
| GET | `/api/blood?group=O%2B` | Blood availability by group |
| GET | `/api/ambulances` | Available fleet |
| POST | `/api/ambulance/request` | Request ambulance (auto-assign) |
| PATCH | `/api/ambulance/request/:id/status` | Advance tracking status |
| POST | `/api/ai/chat` | AI emergency triage chat |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/health` | Health check |

---

## 🏆 Judge Demo Script 🎤

> **Story:** *"Imagine a person meets with a road accident…"*

| Step | Action | Kya dikhega |
|---|---|---|
| 1️⃣ | Open app → Demo Login | Dashboard with stats |
| 2️⃣ | **🚨 SOS** dabao | 🔊 Siren + 📞 auto-dial + 📍 location + timeline updates |
| 3️⃣ | WhatsApp contact alert tap | Pre-filled message with Google Maps location |
| 4️⃣ | Hospitals page | Nearest emergency-ready hospital + directions |
| 5️⃣ | Ambulance request | Unit assigned → driver details → tracking stepper |
| 6️⃣ | AI Assistant: *"There is a road accident and the person needs urgent help"* | CRITICAL priority + first-aid steps |
| 7️⃣ | Dashboard | Active / Resolved / Ambulance stats |

---

## 📁 Project Structure

```
MediRescue-AI/
│
├── client/
│   ├── index.html            Landing page
│   ├── login.html            Auth (JWT + offline fallback)
│   ├── dashboard.html        Ops dashboard
│   ├── emergency.html        🚨 Smart SOS
│   ├── hospitals.html        🏥 Map finder
│   ├── ambulance.html        🚑 Request + tracking
│   ├── blood-bank.html       🩸 Availability
│   ├── assistant.html        🤖 AI chat
│   ├── css/                  Design system (prime color palette)
│   └── js/                   app · auth · maps · sos · ai
│
├── server/
│   ├── server.js             Express app + static hosting
│   ├── store.js              Data layer (MongoDB ⇄ in-memory)
│   ├── config/db.js          Optional Mongo connection
│   ├── data/seed.js          Demo hospitals/blood banks/fleet
│   ├── models/               Mongoose schemas
│   ├── routes/               REST endpoints
│   └── controllers/          Business logic
│
└── package.json
```

---

## 🔮 Future Roadmap 🚀

| Version | Features |
|---|---|
| **v2** | Voice SOS · Live GPS ambulance tracking · Sensor-based accident detection · Multilingual AI expansion |
| **v3** | ABDM/ABHA integration · FHIR interoperability · Verified provider dashboards · Consent-based health data exchange · Wearable integration |

---

<div align="center">

### Made with ❤️ for hackathon judges who value every second

**⭐ Star the repo if you believe fast help saves lives!**

[🌐 Live Demo](https://sonugupta04568-wq.github.io/Medi-Rescue-AI/client/) • [📦 Repository](https://github.com/sonugupta04568-wq/Medi-Rescue-AI) • 📞 Rescue Line: +91 93358 70885

</div>
