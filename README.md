# Mandi Mitra (मंडी मित्र) — Full-Stack Integrated Project

> **SIH 2026** | Complete Integrated Next.js Frontend + Express REST API Backend + Cloud Firestore Database

---

## 1. Project Overview

`mandi-mitra-fullstack` is the standalone, fully integrated monorepo connecting:
1. **Frontend**: Next.js App Router (React 19, TailwindCSS, Framer Motion)
2. **Backend**: Node.js + Express REST API with Firebase Admin SDK
3. **Database**: Google Cloud Firestore (`mandi-mitr-9db67`)

---

## 2. Directory Structure

```
mandi-mitra-fullstack/
├── frontend/                     ← Integrated Next.js App
│   ├── src/
│   │   ├── app/                  ← All pages (homepage, centers, dashboard, queue, payments, history, admin)
│   │   ├── components/           ← AuthGuard, Navbar, Footer
│   │   ├── context/
│   │   │   └── AuthContext.tsx   ← Integrated session & OTP authentication
│   │   ├── lib/
│   │   │   ├── api-client.ts     ← Centralized API Client (Authorization Bearer & Envelope handling)
│   │   │   ├── i18n.tsx          ← Dual language support (Hindi / English)
│   │   │   └── mock-data.ts      ← UI Types & Fallbacks
│   └── .env.local                ← NEXT_PUBLIC_API_URL=http://localhost:5000/api
├── backend/                      ← Express API Server
│   ├── api/index.js              ← Vercel Serverless Entrypoint
│   ├── src/
│   │   ├── app.js                ← Express App (CORS, body parsing, routes, error handling)
│   │   ├── server.js             ← Dev Server Entrypoint (PORT 5000)
│   │   ├── config/               ← Env & Firebase Admin SDK Initialization
│   │   ├── middleware/           ← Auth, Admin Role, Center Scope & Error Middleware
│   │   ├── routes/               ← 10 API sub-routers
│   │   ├── services/             ← Business Logic & Atomic Firestore Transactions
│   │   └── utils/                ← Geo (Haversine), QR & Envelope response helpers
│   ├── tests/
│   │   └── integration.test.js   ← 65-Point Integration Test Suite
│   ├── serviceAccountKey.json    ← Firebase Credentials (GCP)
│   └── .env                      ← Backend Environment Configuration
├── package.json                  ← Monorepo Scripts (dev:fullstack, dev:backend, dev:frontend)
└── README.md                     ← Documentation & Setup Guide
```

---

## 3. Quick Start

### Step 1: Install Dependencies
```bash
# In project root:
npm run dev:fullstack
```

Or start frontend & backend individually:
```bash
# Terminal 1 — Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2 — Start Frontend App (Port 3000)
npm run dev:frontend
```

---

## 4. API & Data Flow

```
Next.js Frontend (Port 3000)
      │  HTTP Requests with Bearer Token
      ▼
Express Backend API (Port 5000)
      │  Firebase Admin SDK
      ▼
Cloud Firestore (mandi-mitr-9db67)
```

### Connected API Endpoints:
- `POST /api/auth/send-otp` & `POST /api/auth/verify-otp` (Login / Registration)
- `POST /api/auth/mock-token` (Development mode token generation)
- `GET /api/farmers/me` (Profile loading)
- `GET /api/crops` & `GET /api/testimonials` (Home & reference data)
- `GET /api/centers` (Center list with dynamic Haversine distance)
- `GET /api/centers/:id/slots` (Grouped slots for morning/afternoon/evening)
- `POST /api/bookings` (Atomic slot reservation transaction)
- `GET /api/bookings/my` & `GET /api/bookings/:id/queue-status` (Dashboard & Queue ticker)
- `POST /api/bookings/:id/cancel` (Idempotent cancellation transaction)
- `GET /api/procurements/my` (Completed harvest records & Mandi Parchis)
- `GET /api/payments/my` (DBT ledger & total earned)
- `GET /api/admin/metrics`, `GET /api/admin/centers/:id/roster`, `POST /api/admin/centers/:id/call-next` (Officer console)

---

## 5. Verification & Testing

### Backend Test Suite:
```bash
npm run test:backend
```
Output: **65 passed, 0 failed** ✅

### Original Projects Status:
- `C:\Users\Sujal\OneDrive\Desktop\SIH\mandi-mitra` — **UNTOUCHED**
- `C:\Users\Sujal\OneDrive\Desktop\SIH\mandi-mitra-backend` — **UNTOUCHED**
- `C:\Users\Sujal\OneDrive\Desktop\SIH\mandi-mitra-database` — **UNTOUCHED**
