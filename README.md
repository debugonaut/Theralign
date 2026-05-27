# Theralign

> A modern SaaS physiotherapist discovery and appointment booking platform.

Theralign connects patients with verified physiotherapy professionals. Patients can discover nearby physiotherapists, browse profiles with ratings and reviews, book appointments, and complete secure payments — all in one seamless experience.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT + bcrypt |
| **Payments** | Razorpay |
| **Storage** | Cloudinary |
| **Deployment** | Vercel (client) + Render (server) |

---

## Project Structure

```
theralign/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── api/                   # Axios instance
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Button, Card, Badge, Navbar, etc.
│   │   │   └── layout/            # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── pages/                 # Route-level pages
│   │   │   ├── public/            # Landing, Login, Register, Doctor listing
│   │   │   ├── patient/           # Patient dashboard pages
│   │   │   ├── doctor/            # Doctor dashboard pages
│   │   │   └── admin/             # Admin dashboard pages
│   │   ├── routes/                # AppRoutes.jsx — single source of truth
│   │   └── styles/                # index.css + Tailwind
│   ├── .env.example
│   ├── tailwind.config.js
│   └── vercel.json
│
└── server/                        # Node.js + Express backend
    ├── src/
    │   ├── config/                # DB connection, env validation
    │   ├── middleware/            # Auth, error handlers
    │   ├── routes/                # Route stubs (6 resource groups)
    │   ├── utils/                 # apiResponse, asyncHandler, AppError, logger, constants
    │   └── ...
    ├── app.js                     # Express app configuration
    ├── server.js                  # Server entry point
    └── .env.example
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env and fill in MONGODB_URI, JWT_SECRET, CLIENT_URL
npm run dev
```

Server runs at: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

### Frontend

```bash
cd client
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000
npm run dev
```

Client runs at: `http://localhost:5173`

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Min 32-character JWT signing key |
| `CLIENT_URL` | ✅ Yes | Frontend URL for CORS allowlist |
| `PORT` | Optional | Defaults to 5000 |
| `CLOUDINARY_*` | Optional | Phase 3 — File uploads |
| `RAZORPAY_*` | Optional | Phase 6 — Payments |
| `OPENAI_API_KEY` | Optional | Phase 8 — AI features |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ Yes | Backend API base URL |
| `VITE_RAZORPAY_KEY_ID` | Optional | Phase 6 — Public Razorpay key |

---

## Deployment

### Frontend → Vercel
- Root directory: `client`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` in Vercel environment variables

### Backend → Render
- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`
- Add all server environment variables in Render dashboard

---

## API Endpoints (Phase 1 Stubs)

| Route | Status |
|-------|--------|
| `GET /api/health` | ✅ Live |
| `GET /api/auth/test` | ✅ Stub |
| `GET /api/doctors/test` | ✅ Stub |
| `GET /api/bookings/test` | ✅ Stub |
| `GET /api/payments/test` | ✅ Stub |
| `GET /api/reviews/test` | ✅ Stub |
| `GET /api/admin/test` | ✅ Stub |

---

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Foundation & Scaffolding | ✅ Complete |
| Phase 2 | Authentication & Authorization | 🔜 Next |
| Phase 3 | Doctor Onboarding & Profiles | Upcoming |
| Phase 4 | Doctor Discovery & Search | Upcoming |
| Phase 5 | Booking System | Upcoming |
| Phase 6 | Payments (Razorpay) | Upcoming |
| Phase 7 | Admin Dashboard | Upcoming |
| Phase 8 | AI Integration | Upcoming |

---

*Built with engineering care during MVP sprint — Theralign v0.1.0*
