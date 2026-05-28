# Theralign — Engineering Devlog

This development log tracks the engineering decisions, implementations, and architectural rationales for each development phase of Theralign.

---

## 📁 Phase 1: Foundation, Architecture & Project Scaffolding

### What We Did
1. **Monorepo Directory Structure**: Established a decoupled `client/` (React + Vite) and `server/` (Node + Express) layout with zero tight coupling.
2. **Frontend Styling & System**: Initialized Vite React and configured Tailwind CSS with a customized design token system (brand blues, custom button/card borders, Harmonious slate typography, and clear response states).
3. **Robust Backend Core**: Configured the runtime in `server.js` and application logic in `app.js` using global security middlewares (`helmet`, `cors`, body parsers, and `morgan` logging).
4. **Resilient Database Layer**: Established an Atlas MongoDB Mongoose connection module with automatic events logs and strict operational exit checks on connection failure.
5. **Centralized Environment Configuration**: Created a startup validator (`config/env.js`) that verifies all mandatory system keys (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`) are present at boot time, throwing explanatory warnings for missing keys.
6. **Unified Utilities Stack**: Crafted standardized success/error response formats, an async error wrapper (`asyncHandler`), custom `AppError` subclasses, and console loggers.
7. **Deployment Scaffolding**: Deployed backend stubs to Render (`/api/health` live) and frontend routers to Vercel, integrating proper CORS rules and configuring `vercel.json` rewrites to prevent client-side routing 404s.

### Why We Did It
- **Decoupled Architecture**: Keeps services independent, enabling isolated scaling and simple deployments to Vercel and Render while keeping codebase management clean in a single repository.
- **Fail-Fast Configuration**: Centralizing environment loading and database connections means configuration discrepancies trigger loud errors on boot rather than cryptic runtime failures inside user controllers.
- **Utility Standardization**: Implementing `apiResponse` and `asyncHandler` eliminates try-catch boilerplate in controllers, guaranteeing a consistent JSON output pattern across all endpoints.
- **Design Tokens Consistency**: Standardizing colors and boundaries at the Tailwind layer ensures all dynamically generated AI layouts maintain a premium, cohesive product aesthetic.

---

## 🔐 Phase 2: Authentication, Role System & Protected Routes

### What We Did
1. **Unified User Schema**: Crafted a single Mongoose `User` collection containing email unique indexing, role-based definitions (`patient`, `doctor`, `admin`), and password exclusions (`select: false`).
2. **Model-Level Security**: Integrated Mongoose `pre('save')` hashing via `bcryptjs` and instance helper methods (`comparePassword` and `generateAuthToken`).
3. **Layered Auth Logic**: Designed an `auth.service.js` containing business login/register validations, decoupled from thin controller handlers in `auth.controller.js`.
4. **Middleware Guard Stack**: Coded identity-verifying `requireAuth` and permission-enforcing `requireRole` middlewares, with specific error handlers catching JWT signatures and token expiration errors.
5. **State & Interceptors**: Implemented a performance-optimized Zustand `authStore` to hydrate credentials from `localStorage`, with automated Axios interceptors injecting Bearer tokens on outgoing calls and executing global redirects to `/login` on `401 Unauthorized` responses.
6. **Authentication Views**: Built visually premium `LoginPage` and `RegisterPage` interfaces containing client validations, loading state disabled buttons, and interactive password toggles.
7. **Seeded Administration**: Configured an idempotent script (`seedAdmin.js`) that programmatically boots a secure default platform admin account on database connection.

### Why We Did It
- **Single User Collection**: A unified collection with role flags simplifies login lookups and eliminates session query complexity compared to maintaining separate Patient/Doctor/Admin tables.
- **Model-Level Hashing**: Placing cryptography inside Mongoose `pre` hooks guarantees that passwords are never stored as plain text regardless of which code path initiates user creation.
- **Decoupled Identity Middleware**: Separating identity validation (`requireAuth`) from role authorization (`requireRole`) creates highly composable route protection throughout the backend.
- **Zustand Selective Render**: Unlike standard React Context, which forces a full-tree re-render on state changes, Zustand's slice subscriptions keep navigation headers and dashboard panels responsive.
- **Axios Interceptor Automation**: Automating token injection at the HTTP instance layer prevents developers from manually formatting headers for every API request, reducing client-side code complexity.

---

## 🩺 Phase 3: Doctor Onboarding, File Uploads & Profile Verification

### What We Did
1. **`DoctorProfile` Schema**: Implemented the detailed professional profile schema linked 1-to-1 with `User` models, storing credentials, registration indexes, and spatial locations.
2. **Geospatial Location Index**: Registered a `2dsphere` index on `clinicLocation` structured in MongoDB GeoJSON format (`[longitude, latitude]`).
3. **Cloud Storage Pipeline**: Initialized Cloudinary SDK integrations and created a custom `multer` middleware with a temporary local disk staging buffer (`server/tmp/uploads/`).
4. **Disk Safety Cleanup**: Coded an upload service that automatically deletes local temporary files in a `finally` block using `fs.promises.unlink()`, ensuring disk cleanliness regardless of upload success or failure.
5. **Onboarding Services & Routes**: Built backend onboarding controllers that accept multipart payloads, cast form numbers, serialize array strings, and immediately demote verified doctors to `'pending'` status if critical credentials are updated.
6. **Verification Dialogs & Queues**: Implemented backend admin queues and PATCH controllers (`/verify` and `/reject`) enforcing a 15+ character validation comment on rejection.
7. **Unified File Upload Widget**: Built `FileUploadZone.jsx` supporting drag-and-drop actions, local object URL image previews, document symbol displays, size error catches, and automatic lifecycle revocations.
8. **Onboarding Stepper Wizard**: Created `DoctorProfileEditor.jsx` guiding doctors through a 3-step wizard (Professional, Clinic & Fees, Uploads) incorporating browser GPS coordinates fetching.
9. **Visual Banners & Panel**: Built contextual yellow (pending), red (rejected with feedback), green (verified), or blue (unsubmitted) banners on the doctor dashboard, and designed the `AdminDoctorVerification.jsx` console with applicant inspection drawers.

### Why We Did It
- **GeoJSON & 2dsphere indexing**: Structuring coordinates in GeoJSON format allows the platform to utilize MongoDB's `$near` operator, enabling proximity-based physiotherapist discovery in Phase 4.
- **Ephemeral Upload Pipelines**: Because modern cloud hosts use transient filesystems that discard files on boot, storing files off-site in Cloudinary is a mandatory production requirement.
- **diskStorage Staging & Unlinks**: Multer buffers files to local disk temporarily to avoid loading large binary streams into server RAM. Unlinking files in a guaranteed `finally` block prevents server crashes caused by memory or disk leaks.
- **Actionable Rejection loops**: Enforcing a strict textual comment requirement on admin profile rejections guarantees doctors receive clear instructions on how to rectify discrepancies, establishing a self-healing onboarding loop.
