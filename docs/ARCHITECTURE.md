# TransitChain — Architecture Documentation

## 1. System Overview

TransitChain is organized as a decoupled, multi-tier multimodal mobility platform:

```
[ User Browser / Client ]
           │
           ▼
[ React + Vite Frontend (Port 5173) ]
           │  REST & Socket.IO
           ▼
[ Node.js + Express Backend API (Port 5000) ] ◄──► [ MongoDB 8.2 (Port 27017) ]
           │  Internal Fast HTTP (Sub-25ms)
           ▼
[ Python FastAPI Optimization Service (Port 8000) ]
```

## 2. Component Responsibilities

### 2.1 React Frontend
- Handles all presentation, user interaction, input validation, and map rendering.
- Consumes RESTful APIs using Axios with Bearer token authentication.
- Leverages Leaflet & OpenStreetMap for accurate geometry visualization without paying commercial map SDK fees.
- Connects to Socket.IO for real-time telemetry updates.

### 2.2 Node.js Express Backend
- Primary orchestration engine, user authentication, role-based authorization.
- Data persistence for users, bookings, favorites, history, audit logs, and GTFS catalog metadata.
- Provider Adapter architecture for booking handoffs and cancellations.
- Ingestion of live vehicle coordinates.
- Autonomous MAPE-K feedback monitor.

### 2.3 Python FastAPI Optimization Engine
- Houses graph algorithms and high-performance time-dependent route calculation.
- Evaluates Pareto frontiers across 5 objectives:
  1. Total Duration
  2. Walking Distance
  3. Transfer Count
  4. Known Fare (₹)
  5. Waiting Time
- Connects cross-feed GTFS datasets (TGSRTC bus and HMRL metro) using verified physical transfer links.
- Uses origin-first timetable lookups to bypass heavy whole-network queries.

## 3. Data Integrity & Security Standards
- Password hashing with bcrypt (10 rounds).
- Short-lived JWT access tokens + secure refresh tokens.
- Email OTP verification with 10-minute expiry and attempt limits.
- Zero fake data: trips, schedules, stops, and fares are calculated from actual timetable representations.

## 4. Autonomous Self-Evolving MAPE-K Architecture

TransitChain incorporates a closed-loop autonomic feedback engine (`mapekEngine.js`) following the IBM MAPE-K reference model:

```
    ┌──────────────────────────────────────────────┐
    │          Knowledge Base (Persistent)         │
    │  - Learned Pareto Heuristic Weights          │
    │  - Evolution Fitness Scores (0-100%)         │
    │  - Cycle History & Adaptation Ledger         │
    └───────▲──────────────▲──────────────▲────────┘
            │              │              │
      [1. MONITOR]   [2. ANALYZE]    [3. PLAN] ──► [4. EXECUTE]
       Telemetry        Symptom      Strategy        Actuation
       Sensors        Detection     Formulation     & Cache Sync
```

1. **Monitor (Telemetry & Sensory Intake)**:
   - Live query SLA latencies (MongoDB ping, FastAPI response time, Pareto search avg).
   - Feed freshness (TGSRTC and HMRL active flags).
   - Fleet delay tracking from vehicles and tracking events.
   - Process heap and memory RSS telemetry.
2. **Analyze (Symptom Detection & SLA Validation)**:
   - Validates live metrics against strict SLA bounds (e.g. search latency < 45ms, feeds >= 2, delay < 180s).
   - Computes system fitness score (0–100%) and categorizes risk (`low`, `moderate`, `high`, `critical`).
3. **Plan (Self-Evolution & Strategy Formulation)**:
   - Formulates dynamic self-adaptation strategies without human intervention.
   - Adjusts Pareto multi-objective weights dynamically:
     - `walkPenaltyWeight` (1.0x – 2.5x)
     - `transferBufferSec` (60s – 300s)
     - `congestionFactor` (1.0x – 2.2x)
     - `fareSensitivity` (0.7x – 1.5x)
4. **Execute (Safe Actuation & Synchronization)**:
   - Applies evolutionary parameters in real-time.
   - Clears stale cache entries and updates `SystemHealth` / `MapekKnowledge` records.
   - Emits real-time WebSocket events (`mapek:cycle_update`) to NOC admin screens.

## 5. Enterprise Admin & NOC Operations Suite

- **Executive Command Center**: High-impact KPI grid, active services health matrix, canonical corridor visualizer.
- **User Directory & RBAC**: Commuter directory, role promotion/demotion (`admin` vs `passenger`), OTP status toggle, and account deletion.
- **Fleet Telemetry & Transit Control**: Live GPS positions for TGSRTC buses and HMRL metro trains, speed monitoring, delay simulation, and network-wide advisory broadcasts.
- **Bookings & Financial NOC**: Gross GMV analytics, provider breakdowns (TGSRTC vs HMRL), PNR search, and 1-click admin refund overrides.
- **GTFS Feeds & Network**: Version control, feed validation, atomic rollback, and transfer link integrity.
- **Security & Audit Logs**: Searchable operational events, actor email tracking, and JSON payload inspector.

