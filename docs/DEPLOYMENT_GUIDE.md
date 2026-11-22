# TransitChain — Deployment & Operations Guide

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v24.x tested)
- **Python**: v3.10 or higher (v3.11.x tested)
- **MongoDB Server**: v6.0 or higher (v8.2.x tested)
- **Git**

## 2. Windows PowerShell Deployment Instructions

### Step 1: Database Setup
Ensure MongoDB is running locally:
```powershell
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\Users\leela\.gemini\antigravity\scratch\transitchain\data\db" --bind_ip 127.0.0.1 --port 27017
```

### Step 2: Optimization Service Setup
```powershell
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\optimization-service"
python -m pip install -r requirements.txt
python -m pytest app/tests/ -v
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Step 3: Backend Server Setup
```powershell
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\backend"
npm install
node scripts/seed.js
node --test tests/api.test.js
node --test tests/e2e.test.js
node server.js
```

### Step 4: Frontend Web Setup
```powershell
cd "C:\Users\leela\.gemini\antigravity\scratch\transitchain\frontend"
npm install
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 3. Production Deployment & Containerization

### Docker Compose
Each service can be run independently or via Docker Compose:
- **Optimization Service**: `python:3.11-slim`, port 8000
- **Node.js API**: `node:20-alpine`, port 5000
- **Frontend**: Nginx static hosting for `frontend/dist`, port 80/443
- **MongoDB**: `mongo:7.0` container with persistent volume.

---

## 4. External Integrations & API Credentials Reference

| Integration | Purpose | Status in Dev / Sandbox | Production Requirement |
| :--- | :--- | :--- | :--- |
| **Gmail SMTP** | Email OTP Delivery | Fallback to secure development console delivery | `SMTP_USER` & Google App Password |
| **TGSRTC Adapter** | Hyderabad Bus Booking | Built-in verified schedule & test sandbox adapter | Official TGSRTC API Partner Key |
| **HMRL Adapter** | Hyderabad Metro QR Tickets | Built-in verified schedule & test sandbox adapter | Official HMRL / L&T Metro API Credentials |
| **OpenStreetMap** | Maps & Tiles | Live standard tile server (`tile.openstreetmap.org`) | Self-hosted tile server or Mapbox token for >1M hits |
| **Socket.IO** | Real-time Telemetry | Live WebSocket server on port 5000 | Redis adapter for multi-instance scaling |
