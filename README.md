# CyberSleuthes 🛡️

**AI-Powered Cyber Threat Intelligence & Investigation Platform**

A production-quality, full-stack MERN application designed for SOC analysts to investigate suspicious emails, track cyber threats, and visualize attack infrastructure.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Install dependencies

```powershell
# Root
cmd /c "npm install"

# Server
cd server; cmd /c "npm install"

# Client  
cd ..\client; cmd /c "npm install"
```

### 2. Configure environment

```powershell
copy server\.env.example server\.env
# Edit server\.env with your values (defaults work out of the box)
```

### 3. Seed the database

```powershell
cd server
cmd /c "node seed/seed.js"
```

### 4. Start the application

```powershell
# From root directory
cmd /c "npm run dev"
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🔑 Demo Credentials

| Role    | Email                          | Password    |
|---------|-------------------------------|-------------|
| Admin   | admin@cybersleuthes.com       | Demo@2026   |
| Analyst | analyst@cybersleuthes.com     | Demo@2026   |

---

## 🗂️ Features

| Feature | Description |
|---|---|
| **SOC Dashboard** | Real-time threat overview, world map, alert feed |
| **Email Analysis** | Upload `.eml` files, parse headers, extract IOCs |
| **Threat Graph** | Force-directed graph of attack infrastructure |
| **IOC Database** | Search/filter 36+ indicators with geo data |
| **Campaigns** | Track multi-case threat actor campaigns |
| **AI Assistant** | Context-aware threat analysis chat (demo mode) |
| **Reports** | Auto-generated PDF-ready intelligence reports |
| **Alerts** | Real-time Socket.io alert system |
| **Settings** | Profile, security, notifications, integrations |

---

## 🏗️ Architecture

```
cybersleuthes/
├── server/                   # Express + Socket.io backend
│   ├── models/               # 10 Mongoose models
│   ├── routes/               # 8 API route files
│   ├── middleware/           # Auth + error handling
│   ├── utils/                # Parser, geo, AI, scoring
│   ├── sockets/              # Socket.io live events
│   └── seed/                 # Database seeder
│
└── client/                   # Vite + React frontend
    └── src/
        ├── pages/            # 17 pages
        ├── components/       # Reusable UI components
        ├── stores/           # Zustand state stores
        ├── services/         # API + Socket clients
        ├── layouts/          # AppLayout
        └── utils/            # Risk/color utilities
```

---

## 🛠️ Tech Stack

### Backend
- **Express.js** — REST API
- **Mongoose** — MongoDB ORM
- **Socket.io** — Real-time events
- **JWT** — Authentication
- **multer + mailparser** — Email processing
- **bcryptjs** — Password hashing

### Frontend
- **React 18** + **Vite** — SPA
- **Tailwind CSS** — Styling
- **Zustand** — State management
- **react-force-graph-2d** — Threat graph
- **react-simple-maps** — World infrastructure map
- **framer-motion** — Animations
- **recharts** — Charts
- **react-markdown** — Report rendering

---

## 🌍 Color Scheme

| Token     | Hex       | Usage |
|-----------|-----------|-------|
| `bg`      | `#0A0E1A` | Background |
| `card`    | `#10141F` | Cards |
| `border`  | `#1E2433` | Borders |
| `muted`   | `#8A93AB` | Secondary text |
| `accent`  | `#6366F1` | Primary accent (Indigo) |
| `danger`  | `#EF4444` | High threat |
| `critical`| `#FF3B30` | Critical threat |
| `warning` | `#F59E0B` | Medium threat |
| `info`    | `#22D3EE` | Informational |
| `success` | `#22C55E` | Safe / low risk |

---

## 📁 Seed Data

The seed script creates:
- 👤 **2 users** (admin + analyst)
- 📋 **5 campaigns** (NIGHTFALL, SHADOWNET, GHOSTPHISH, IRONVEIL, REDSTORM)
- 📁 **10 investigations** (CASE-2026-001 through CASE-2026-010)
- 🎯 **35+ IOCs** (domains, IPs, URLs, hashes, ASNs)
- 🚨 **20 alerts** (various severities)
- 📧 **5 analyzed emails**
- 🕸️ **Graph edges** (attack infrastructure connections)
- 📅 **Timeline events** (per investigation)
- 📄 **2 sample reports**
