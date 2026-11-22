# TransitChain — Complete Multimodal Smart Transportation Platform

TransitChain is a production-grade, door-to-door, multimodal smart transportation platform that combines **City Buses (TGSRTC)**, **Metro Rail (HMRL)**, and **Walking Connections** with high-precision time-dependent routing, Pareto multi-objective ranking, interactive Leaflet maps, digital ticket booking via provider adapters, real-time tracking with WebSockets, nearby places discovery, an AI support chatbot, an admin portal, and autonomous MAPE-K self-healing monitoring.

---

## 🚀 Live Running Services

| Service | Technology | Port / Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | React.js, Vite, Tailwind CSS, Leaflet | `http://127.0.0.1:5173` | **ONLINE** |
| **Backend REST API** | Node.js, Express.js, Socket.IO, JWT | `http://127.0.0.1:5000` | **ONLINE** |
| **Optimization Service** | Python, FastAPI, NetworkX, Pydantic | `http://127.0.0.1:8000` | **ONLINE** |
| **Primary Database** | MongoDB Server v8.2 | `mongodb://127.0.0.1:27017/transitchain` | **ONLINE** |

---

## 🎯 Canonical Scenario: Indira Nagar–Gachibowli to KPHB Colony

When a user plans a commute from **Indira Nagar - Gachibowli** to **KPHB Colony, Hyderabad**:
1. Identifies the user's origin & destination coordinates.
2. Discovers nearby transit hubs (Indira Nagar bus stop, Raidurg Metro station, KPHB Colony Metro & Bus stops).
3. Evaluates real time-dependent timetables and service frequencies.
4. Calculates both direct bus routes (**TGSRTC 195W**) and multimodal combinations (**Feeder 113 + HMRL Blue Line + Ameerpet Interchange + Red Line**).
5. Computes realistic walking connections between transfer points (e.g. Raidurg Bus to Metro: 130m / 2 min; Ameerpet interchange: 90s).
6. Computes waiting buffers and accurate door-to-door travel times.
7. Evaluates Pareto dominance across (duration, walking distance, transfers, fare, waiting).
8. Ranks the most practical journeys with full step-by-step instructions.
9. Renders the interactive Leaflet map with colored polylines and stop markers.
10. Enables 1-click digital booking with instant PNR and QR code generation.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, Vite 5, JavaScript (No TypeScript), Tailwind CSS, React Router v6, Leaflet & OpenStreetMap, Lucide React, Socket.IO Client, Axios.
- **Backend API**: Node.js v24, Express.js, JavaScript ES Modules, MongoDB 8.2, Mongoose ODM, JWT Auth, Nodemailer, Socket.IO, Helmet, Morgan, Express-Rate-Limit.
- **Optimization Service**: Python 3.11, FastAPI, Pydantic v2, NetworkX, Uvicorn.
- **Transit Feeds**: TGSRTC Hyderabad Bus Network & HMRL Hyderabad Metro Rail GTFS Schedule specifications.

---

## 📁 Monorepo Project Structure

```
transitchain/
├── frontend/                     # React + Vite client
│   ├── src/
│   │   ├── components/           # Navbar, Footer, JourneyCard, JourneyMap, SupportChatbotModal
│   │   ├── context/              # AuthContext (JWT session management)
│   │   ├── pages/                # Landing, Search, JourneyDetail, Bookings, Tracking, Places, Auth, Admin
│   │   ├── services/             # Axios API client (auth, journeys, bookings, tracking, places, chat, admin)
│   │   ├── App.jsx               # Protected & public route definitions
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # Node.js Express API & Socket.IO server
│   ├── config/                   # db.js, env.js
│   ├── models/                   # User, Transport (Provider, Stop, Route, Trip), Gtfs, Operations
│   ├── controllers/              # authController, transportController, journeyController, bookingController, etc.
│   ├── routes/                   # authRoutes, transportRoutes, journeyRoutes, bookingRoutes, adminRoutes
│   ├── middleware/               # authenticateToken, requireAdmin, errorHandler
│   ├── integrations/             # BaseProviderAdapter, TgsrtcAdapter, HmrlAdapter, ProviderAdapterFactory
│   ├── utils/                    # mailer.js (secure Gmail OTP & sandbox fallback), logger.js, response.js
│   ├── scripts/                  # seed.js (initial Hyderabad users, feeds, routes, stops)
│   ├── tests/                    # api.test.js (15 tests), e2e.test.js (14 tests)
│   ├── app.js
│   └── server.js
│
├── optimization-service/         # Python FastAPI routing engine
│   ├── app/
│   │   ├── main.py
│   │   ├── api/                  # routes.py (/health, /journeys/search, /graph/validate, /metrics)
│   │   ├── core/                 # config.py
│   │   ├── models/               # schemas.py
│   │   ├── services/             # schedule_store.py (in-memory timetable index)
│   │   ├── algorithms/           # time_dependent_search.py, pareto_optimizer.py, walking_connector.py
│   │   ├── graph/                # multimodal_graph.py
│   │   ├── utils/                # time_utils.py (GTFS 24:00+ handling, seconds normalization)
│   │   └── tests/                # test_routing.py (5 pytest suites)
│   ├── requirements.txt
│   └── .env.example
│
├── shared/                       # Shared contracts and schemas
├── docs/                         # In-depth architectural & deployment guides
├── scripts/                      # Startup & maintenance scripts
└── package.json                  # Monorepo orchestration scripts
```

---

## ⚡ Windows PowerShell Quickstart Commands

To run all services from PowerShell:

```powershell
# 1. Start MongoDB
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\Users\leela\.gemini\antigravity\scratch\transitchain\data\db" --bind_ip 127.0.0.1 --port 27017

# 2. Start Python Optimization Service (Port 8000)
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\optimization-service"
uvicorn app.main:app --host 127.0.0.1 --port 8000

# 3. Start Node.js Backend Server (Port 5000)
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\backend"
node scripts/seed.js # (Seed verified demo users & Hyderabad GTFS data)
node server.js

# 4. Start React Frontend (Port 5173)
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\frontend"
npm run dev
```

---


## 🧪 Automated Test Results Summary

- **Backend API Tests** (`node --test tests/api.test.js`): **15 / 15 Passed** (100%)
- **End-to-End Workflow Tests** (`node --test tests/e2e.test.js`): **14 / 14 Passed** (100%)
- **Python Optimization Routing Tests** (`pytest app/tests/`): **5 / 5 Passed** (100%)
- **Total Automated Test Suites**: **34 / 34 Passed (0 Failures)**
