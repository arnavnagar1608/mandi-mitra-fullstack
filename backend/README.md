# Mandi Mitra — Backend API

> **SIH 2026** | Production REST API for the Mandi Mitra (मंडी मित्र) Agricultural Procurement System

---

## Project Structure

```
mandi-mitra-backend/
├── api/
│   └── index.js              ← Vercel serverless entrypoint
├── scripts/
│   └── create-indexes.js     ← Firestore index management
├── src/
│   ├── app.js                ← Express app (CORS, routes, error handler)
│   ├── server.js             ← Local dev server (PORT 5000)
│   ├── config/
│   │   ├── env.js            ← Environment config
│   │   └── firebase.js       ← Firebase Admin SDK init (3-tier)
│   ├── middleware/
│   │   ├── auth.js           ← Firebase token verification + mock-token (dev only)
│   │   ├── role.js           ← Admin role enforcement (reads Firestore)
│   │   ├── centerScope.js    ← Center officer scoping
│   │   └── errorHandler.js   ← Centralized error pipeline
│   ├── utils/
│   │   ├── response.js       ← successResponse / errorResponse helpers
│   │   ├── geo.js            ← Haversine distance formula
│   │   └── qr.js             ← QR payload generator
│   ├── services/             ← Business logic (Firestore access)
│   │   ├── authService.js
│   │   ├── farmerService.js
│   │   ├── centerService.js
│   │   ├── slotService.js
│   │   ├── bookingService.js
│   │   ├── procurementService.js
│   │   ├── paymentService.js
│   │   ├── cropService.js
│   │   ├── testimonialService.js
│   │   └── adminService.js
│   ├── controllers/          ← Request handlers
│   └── routes/               ← Express routers
│       └── index.js          ← Master router
├── tests/
│   └── integration.test.js   ← 65-point integration test suite
├── .env                      ← Local dev secrets (never commit)
├── .env.example              ← Template for new devs
├── .gitignore
├── package.json
├── serviceAccountKey.json    ← Firebase credentials (never commit)
└── vercel.json               ← Vercel deployment config
```

---

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill env file
cp .env.example .env
# Fill in: FIREBASE_PROJECT_ID, etc.

# 3. Place serviceAccountKey.json in project root

# 4. Start the server
npm start
# → http://localhost:5000/api/health

# 5. Run tests (server must be running)
npm test
```

---

## API Reference

All responses use the envelope format:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/send-otp` | — | Send OTP (mock/SMS) |
| POST | `/api/auth/verify-otp` | — | Verify OTP, returns Firebase token |
| POST | `/api/auth/mock-token` | — | **Dev only** — instant mock token |

### Farmers
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/farmers/me` | 🔒 Farmer | Get own profile |
| POST | `/api/farmers/register` | 🔒 Farmer | Register new farmer (transaction-safe) |
| PATCH | `/api/farmers/me` | 🔒 Farmer | Update profile (immutable fields protected) |
| GET | `/api/farmers/me/notifications` | 🔒 Farmer | Get notifications |
| PATCH | `/api/farmers/me/notifications/:id/read` | 🔒 Farmer | Mark notification read |

### Centers
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/centers` | — | List all centers with live Haversine distance |
| GET | `/api/centers/:centerId` | — | Get single center |
| GET | `/api/centers/:centerId/queue` | — | Live queue telemetry |
| GET | `/api/centers/:centerId/slots` | — | Grouped slots (morning/afternoon/evening) |

### Slots
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/slots` | — | List slots (filter by centerId, date, period) |
| GET | `/api/slots/:slotId` | — | Get single slot |

### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | 🔒 Farmer | Create booking (atomic transaction) |
| GET | `/api/bookings/my` | 🔒 Farmer | List own bookings |
| GET | `/api/bookings/:bookingId` | 🔒 Farmer | Get booking by ID |
| POST | `/api/bookings/:bookingId/cancel` | 🔒 Farmer | Cancel booking (idempotent, transactional) |
| GET | `/api/bookings/:bookingId/queue-status` | 🔒 Farmer | Real-time queue position + 8-stage status |

### Procurements
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/procurements/my` | 🔒 Farmer | List own procurements |
| GET | `/api/procurements/:id` | 🔒 Farmer | Get procurement |
| PATCH | `/api/procurements/:id/status` | 🔒 Admin | Advance 8-stage status |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/payments/my` | 🔒 Farmer | Payment summary + total earned (DBT ledger) |
| GET | `/api/payments/:paymentId` | 🔒 Farmer | Single payment |

### Crops & Testimonials
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/crops` | — | All crops with MSP rates |
| GET | `/api/crops/:cropId` | — | Single crop |
| GET | `/api/testimonials` | — | Approved testimonials |

### Admin
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/metrics` | 🔒 super_admin | Dashboard KPIs |
| GET | `/api/admin/centers/:centerId/roster` | 🔒 Admin | Live center roster |
| POST | `/api/admin/centers/:centerId/call-next` | 🔒 Admin | Call next token (transactional) |
| GET | `/api/admin/centers/:centerId/analytics` | 🔒 Admin | 30-day analytics |
| PATCH | `/api/admin/bookings/:bookingId/status` | 🔒 Admin | Update queue entry status |

---

## Safety Requirements (SIH Compliance)

### 1. OTP — Dev vs Production
- `SMS_PROVIDER=mock` → OTP is always `1234` (default), `simulatedOtp` returned **only in dev**
- `SMS_PROVIDER=fast2sms` → Real SMS sent, `simulatedOtp` never exposed
- Production: `simulatedOtp` field is stripped from response

### 2. Mock Token — Production Disabled
```
POST /api/auth/mock-token
```
Returns **403 Forbidden** when `NODE_ENV=production`. Guaranteed by:
- `src/middleware/auth.js` — rejects `mock-token-*` with 403 in production
- `src/controllers/authController.js` — blocks the endpoint itself in production

### 3. Booking Cancellation — Idempotent & Transactional
- Repeated cancel requests on an already-cancelled booking return `200 { alreadyCancelled: true }` — slot count is **not** decremented again
- Attempting to cancel a `completed` / `serving` booking returns `409 CANNOT_CANCEL`
- `bookedCount` decrement happens **only inside a Firestore transaction** after confirming `status === 'confirmed'`

### 4. Vercel Deployment
See [Deploying to Vercel](#deploying-to-vercel) below.

---

## Deploying to Vercel

### Step 1 — Push to GitHub
```bash
git init
git remote add origin https://github.com/your-username/mandi-mitra-backend.git
git add .
git commit -m "feat: complete backend implementation"
git push -u origin main
```

### Step 2 — Import on Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Vercel auto-detects `vercel.json`

### Step 3 — Set Environment Variables on Vercel Dashboard
```
NODE_ENV=production
FIREBASE_PROJECT_ID=mandi-mitr-9db67
FIREBASE_CLIENT_EMAIL=<from serviceAccountKey.json>
FIREBASE_PRIVATE_KEY=<from serviceAccountKey.json — include full PEM with \n>
SMS_PROVIDER=mock
CORS_ORIGIN=https://mandi-mitra.vercel.app
```

### Step 4 — Test the deployed API
```bash
curl https://your-deployment.vercel.app/api/health
# Should return: {"success":true,"data":{"status":"ok","env":"production",...}}

# mock-token endpoint must be blocked in production:
curl -X POST https://your-deployment.vercel.app/api/auth/mock-token -H "Content-Type: application/json" -d '{"uid":"f1"}'
# Must return 403
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |
| `FIREBASE_PROJECT_ID` | Yes | `mandi-mitr-9db67` |
| `FIREBASE_CLIENT_EMAIL` | Prod only | Service account email |
| `FIREBASE_PRIVATE_KEY` | Prod only | Service account private key (PEM) |
| `SMS_PROVIDER` | No | `mock` (default) or `fast2sms` |
| `MOCK_OTP_DEFAULT` | No | Default mock OTP (default: `1234`) |
| `CORS_ORIGIN` | No | Allowed origin in production |

---

## Firestore Collections Used

| Collection | Purpose |
|-----------|---------|
| `farmers` | Farmer profiles |
| `farmers/{uid}/notifications` | Per-farmer notifications |
| `procurement_centers` | Center details + telemetry |
| `procurement_centers/{id}/live_queue` | Real-time queue state |
| `slots` | Time-period slots with capacity |
| `daily_counters` | Sequential token numbers per center per day |
| `bookings` | Appointment records |
| `procurements` | 8-stage procurement workflow |
| `payments` | DBT payment records |
| `crops` | Reference data (MSP rates) |
| `testimonials` | Farmer testimonials |
| `admin_users` | Admin role assignments |
| `unique_phones` | Phone uniqueness locks |
| `unique_farmer_ids` | Farmer ID uniqueness locks |

---

*Mandi Mitra Backend — SIH 2026 | Node.js + Express + Firebase Admin SDK*
