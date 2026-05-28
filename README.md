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

## API Endpoints (Phases 1–7 Live Endpoints)

| Route | Status | Description |
|-------|--------|-------------|
| `GET /api/health` | ✅ Live | Server Health Check |
| `POST /api/auth/register` | ✅ Live | Register new User |
| `POST /api/auth/login` | ✅ Live | Login User |
| `PUT /api/doctors/profile/onboard` | ✅ Live | Doctor Onboarding & Documents Upload |
| `GET /api/doctors/profile/me` | ✅ Live | Get Auth Doctor Profile |
| `GET /api/discover` | ✅ Live | Paginated Discovery Listing |
| `GET /api/discover/nearby` | ✅ Live | Geospatial Proximity Recommendations |
| `GET /api/discover/search` | ✅ Live | Full-Text Doctor Search |
| `GET /api/discover/:id` | ✅ Live | Doctor Public Profile |
| `POST /api/availability/slots` | ✅ Live | Doctor: Create Availability Slot |
| `GET /api/availability/slots/mine` | ✅ Live | Doctor: Get Own Slots |
| `PUT /api/availability/slots/:slotId` | ✅ Live | Doctor: Update Slot |
| `DELETE /api/availability/slots/:slotId` | ✅ Live | Doctor: Delete Slot |
| `GET /api/availability/:doctorId/available` | ✅ Live | Public: Get Doctor Free Slots |
| `POST /api/appointments/book` | ✅ Live | Patient: Book Appointment Slot |
| `GET /api/appointments/mine` | ✅ Live | Patient: Get Own Bookings |
| `GET /api/appointments/doctor/mine` | ✅ Live | Doctor: Get Patient Bookings |
| `PATCH /api/appointments/:id/cancel` | ✅ Live | Patient/Doctor/Admin: Cancel Booking |
| `PATCH /api/appointments/:id/complete` | ✅ Live | Doctor: Mark Booking Completed |
| `GET /api/appointments/admin/all` | ✅ Live | Admin: Get All Bookings & Earnings |
| `POST /api/payments/create-order` | ✅ Live | Patient: Initiate payment & create Razorpay order |
| `POST /api/payments/verify` | ✅ Live | Patient: Cryptographically verify signature |
| `GET /api/payments/mine` | ✅ Live | Patient: Get payment history receipts |
| `GET /api/payments/admin/all` | ✅ Live | Admin: Get all paid payments & revenue metrics |
| `POST /api/reviews` | ✅ Live | Patient: Submit a review for a completed appointment |
| `GET /api/reviews/doctor/:doctorId` | ✅ Live | Public: Get visible reviews for a doctor |
| `GET /api/reviews/mine` | ✅ Live | Patient: Get own review history |
| `GET /api/reviews/admin/all` | ✅ Live | Admin: Get all reviews with pagination |
| `PATCH /api/reviews/:id/visibility` | ✅ Live | Admin: Toggle review visibility |

---

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Foundation & Scaffolding | ✅ Complete |
| Phase 2 | Authentication & Authorization | ✅ Complete |
| Phase 3 | Doctor Onboarding & Profiles | ✅ Complete |
| Phase 4 | Doctor Discovery & Search | ✅ Complete |
| Phase 5 | Booking System (Slots & Appointments) | ✅ Complete |
| Phase 6 | Payments (Razorpay) | ✅ Complete |
| Phase 7 | Reviews & Ratings | ✅ Complete |
| Phase 8 | AI Integration | Upcoming |

---

*Built with engineering care during MVP sprint — Theralign v0.1.0*
