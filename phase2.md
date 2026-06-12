# PhysioConnect — Phase 2 Complete Prompt Set
## Authentication, Role System & Protected Routes

---

# PROMPT 2.1 — User Schema & Role-Based Data Model

## Objective
Design and implement the complete Mongoose `User` model that serves as the identity foundation for all three platform roles: `patient`, `doctor`, and `admin`. This schema must enforce role constraints, handle password hashing at the model level, and include all fields required by the authentication system. Every other schema in the platform will reference this model.

## Architecture Reasoning
The User model is the single most important schema in the entire platform because every major entity — appointments, reviews, payments, doctor profiles — references a User document. Getting this schema wrong in Phase 2 means painful migrations in later phases.

The decision to use a **single User collection with a role discriminator** (rather than separate Patient/Doctor/Admin collections) is deliberate for this MVP. It simplifies authentication — one login endpoint serves all roles. Role-specific data (clinic address, specialization, etc.) lives in a separate `DoctorProfile` model linked by reference, keeping the User schema clean and focused on identity concerns only.

Password hashing is handled via a Mongoose `pre('save')` hook rather than in the controller or service. This ensures passwords are NEVER stored in plain text regardless of which code path creates the user — a subtle but important security guarantee.

## Implementation Scope Boundaries
- Implement `models/User.model.js` completely
- Implement instance methods: `comparePassword`, `generateAuthToken`
- Implement the `pre('save')` hook for password hashing
- Do NOT implement DoctorProfile model yet (Phase 3)
- Do NOT implement any controller or route logic yet
- Do NOT seed any users yet

## Exact Schema Specification

```
User Schema Fields:

name:
  type: String
  required: true
  trim: true
  minLength: 2
  maxLength: 50

email:
  type: String
  required: true
  unique: true
  lowercase: true
  trim: true
  match: email regex pattern

password:
  type: String
  required: true
  minLength: 8
  select: false   ← CRITICAL: never returned in queries by default

role:
  type: String
  enum: [ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN]
  default: ROLES.PATIENT
  required: true

profileImage:
  type: String
  default: null   ← Cloudinary URL, set in Phase 3

phone:
  type: String
  trim: true
  default: null

isActive:
  type: Boolean
  default: true   ← Admin can deactivate accounts

timestamps: true  ← Adds createdAt and updatedAt automatically
```

## Instance Methods Required

**`comparePassword(candidatePassword)`:**
```
Async method.
Uses bcrypt.compare(candidatePassword, this.password)
Returns boolean.
Called during login to verify submitted password against hash.
Must explicitly select password field since select: false hides it by default.
```

**`generateAuthToken()`:**
```
Synchronous method.
Uses jwt.sign({ id: this._id, role: this.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
Returns signed JWT string.
Payload intentionally minimal — only id and role needed for auth decisions.
```

## `pre('save')` Hook Specification
```
Runs before every save operation.
Check: if (!this.isModified('password')) return next()
Why: prevents re-hashing an already-hashed password on unrelated updates
Hash: bcrypt.hash(this.password, 12)
Salt rounds: 12 — strong enough for production, acceptable performance
```

## Index Configuration
```
email: unique index (already created by unique: true in schema)
role: regular index — frequently queried in admin operations
isActive: regular index — frequently filtered in listings
```

## Validation Checkpoints
- [ ] Creating a user without `email` throws a Mongoose ValidationError
- [ ] Creating two users with the same email throws a duplicate key error (code 11000)
- [ ] Querying `User.findOne({ email })` does NOT return `password` field (select: false)
- [ ] Querying `User.findOne({ email }).select('+password')` DOES return password
- [ ] `user.comparePassword('wrongpassword')` returns `false`
- [ ] `user.comparePassword('correctpassword')` returns `true`
- [ ] `user.generateAuthToken()` returns a JWT string decodable with the correct secret
- [ ] Updating `user.name` and saving does NOT re-hash the password

## Common Mistakes to Avoid
- **Do NOT** hash the password in the controller — the `pre('save')` hook guarantees it happens at the model level regardless of code path
- **Do NOT** omit `select: false` on the password field — returning password hashes in API responses is a serious security vulnerability
- **Do NOT** store the full user object in the JWT payload — only `id` and `role`; larger payloads slow every authenticated request
- **Do NOT** use salt rounds below 10 in production — 12 is the recommended balance
- **Do NOT** forget `isModified('password')` check in the pre-save hook — without it, every profile update re-hashes the password unnecessarily

## Interview Explanation Points
- "Password hashing lives in the `pre('save')` hook rather than the service layer because the model is the last line of defense. If any code path creates or updates a user, the password will be hashed regardless — it's a guarantee, not a convention."
- "I set `select: false` on the password field so it's excluded from all queries by default. The one place we need it — login verification — explicitly opts in with `.select('+password')`."
- "The JWT payload only contains `id` and `role` because the token is sent with every authenticated request. Larger payloads mean more bandwidth per request. The server can always look up additional user data using the `id` if needed."
- "I chose a single User collection with a role field over separate collections because it simplifies authentication — one endpoint, one model, one token structure for all three roles."

## What NOT to Implement Yet
- DoctorProfile schema (Phase 3)
- Admin-specific fields
- Email verification
- Password reset flows
- OAuth or social login

---

# PROMPT 2.2 — Authentication Service Layer

## Objective
Implement the complete `auth.service.js` containing all business logic for registration, login, and user retrieval. This service layer sits between the controller (HTTP concerns) and the model (data concerns). All authentication business rules live here — not in controllers, not in models.

## Architecture Reasoning
The service layer is the most important architectural boundary in the backend. Controllers should only handle request parsing and response formatting. Services contain the actual business logic. This separation means the authentication logic is testable in isolation, reusable across multiple controllers if needed, and cleanly separated from HTTP framework concerns.

This prompt implements the service layer BEFORE the controller so the business logic is defined first, then wrapped in HTTP handlers. This order prevents the common mistake of writing business logic inside controllers and then struggling to extract it later.

## Implementation Scope Boundaries
- Implement `services/auth.service.js` completely
- Implement `services/user.service.js` for user retrieval utilities
- Do NOT implement the controller yet (Prompt 2.3)
- Do NOT implement middleware yet (Prompt 2.4)
- Reference the User model — it must exist from Prompt 2.1

## `auth.service.js` Function Specifications

**`registerUser({ name, email, password, role })`:**
```
1. Check if user with email already exists
   → If yes: throw new AppError('Email already registered', 409)
2. Create new User document with provided fields
   → password hashing handled by pre-save hook automatically
3. Generate auth token using user.generateAuthToken()
4. Return: { user: sanitizedUser, token }

sanitizedUser = user object WITHOUT password field
Use user.toObject() then delete sanitizedUser.password for safety
```

**`loginUser({ email, password })`:**
```
1. Find user by email, explicitly select password field:
   User.findOne({ email }).select('+password')
2. If user not found: throw new AppError('Invalid credentials', 401)
   Note: generic message — do NOT reveal whether email exists or not
3. If user.isActive is false: throw new AppError('Account has been deactivated', 403)
4. Compare password: await user.comparePassword(password)
5. If password wrong: throw new AppError('Invalid credentials', 401)
   Note: same generic message — prevents email enumeration attacks
6. Generate token: user.generateAuthToken()
7. Return: { user: sanitizedUser, token }
```

**`getUserById(userId)`:**
```
1. Find user by ID: User.findById(userId)
2. If not found: throw new AppError('User not found', 404)
3. Return user document (password excluded by default via select: false)
```

## `user.service.js` Function Specifications

**`getAllUsers({ role, page, limit })`:**
```
Used by admin in Phase 9.
Build query object: role ? { role } : {}
Apply pagination: .skip((page-1) * limit).limit(limit)
Return: { users, total, page, totalPages }
```

**`deactivateUser(userId)`:**
```
Used by admin.
Update user.isActive = false
Return updated user
```

## Security Rules Enforced in Service Layer
```
1. Never return password in any response
2. Use identical error messages for "user not found" and "wrong password" — prevents email enumeration
3. Check isActive before issuing token — deactivated users cannot log in
4. Role is set during registration — not changeable by the user themselves
```

## Validation Checkpoints
- [ ] `registerUser` with duplicate email throws `AppError` with status 409
- [ ] `loginUser` with wrong password returns same error message as wrong email
- [ ] `loginUser` with deactivated account returns 403
- [ ] No password field appears in any return value from any service function
- [ ] `getUserById` with invalid ObjectId format is handled (Mongoose CastError → caught by global error handler)

## Common Mistakes to Avoid
- **Do NOT** put `User.findOne` calls directly in controllers — that's a service responsibility
- **Do NOT** use different error messages for "user not found" vs "wrong password" — this is an email enumeration vulnerability
- **Do NOT** allow `role` to be set from `req.body` without validation — a patient should not be able to register as admin by modifying the request

## Interview Explanation Points
- "The service layer contains all business logic so controllers remain thin HTTP wrappers. If I later need to expose authentication via a different protocol or trigger registration from a different flow, the logic is reusable without touching HTTP-specific code."
- "I use identical error messages for invalid email and invalid password. Distinct messages would allow attackers to enumerate valid email addresses by observing which error they receive — a real-world security concern."

---

# PROMPT 2.3 — Authentication Controller & Route Configuration

## Objective
Implement `auth.controller.js` with thin controller functions that delegate entirely to the auth service. Configure `auth.routes.js` with all authentication endpoints. Add input validation middleware to all routes. Wire everything together in `app.js`.

## Architecture Reasoning
Controllers are the HTTP translation layer — they parse requests, call services, and format responses. They should contain zero business logic. A controller function should be readable in under 10 lines. If a controller is longer, business logic has leaked into it and should be moved to the service.

## Implementation Scope Boundaries
- Implement all controller functions for auth
- Configure all auth routes with validation
- Add `express-validator` validation chains
- Do NOT implement auth middleware yet (Prompt 2.4)
- Do NOT implement role-based guards yet

## Route Definitions

```
POST /api/auth/register
  Body: { name, email, password, role }
  Response: { success: true, message: 'Registration successful', data: { user, token } }
  Status: 201

POST /api/auth/login
  Body: { email, password }
  Response: { success: true, message: 'Login successful', data: { user, token } }
  Status: 200

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { success: true, data: { user } }
  Status: 200
  Note: requires auth middleware — implement after Prompt 2.4
```

## Controller Function Specifications

**`register(req, res)`:**
```javascript
Wrapped in asyncHandler.
1. Extract { name, email, password, role } from req.body
2. Call authService.registerUser({ name, email, password, role })
3. Return successResponse(res, 201, 'Registration successful', result)
```

**`login(req, res)`:**
```javascript
Wrapped in asyncHandler.
1. Extract { email, password } from req.body
2. Call authService.loginUser({ email, password })
3. Return successResponse(res, 200, 'Login successful', result)
```

**`getMe(req, res)`:**
```javascript
Wrapped in asyncHandler.
1. req.user is populated by auth middleware (Prompt 2.4)
2. Call userService.getUserById(req.user.id)
3. Return successResponse(res, 200, 'User retrieved', { user })
```

## Validation Chains (express-validator)

**Register validation:**
```
name: notEmpty, isLength({ min: 2, max: 50 })
email: notEmpty, isEmail, normalizeEmail
password: notEmpty, isLength({ min: 8 }), 
          matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)  ← at least 1 uppercase, 1 lowercase, 1 digit
role: optional, isIn(['patient', 'doctor'])
      Note: 'admin' role CANNOT be self-registered — must be seeded manually
```

**Login validation:**
```
email: notEmpty, isEmail
password: notEmpty
```

**Validation result handler (reusable middleware):**
```javascript
// middleware/validate.middleware.js
import { validationResult } from 'express-validator'

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errorResponse(res, 422, 'Validation failed', errors.array())
  }
  next()
}
```

## Route File Structure

```javascript
// routes/auth.routes.js
router.post('/register', registerValidation, validate, register)
router.post('/login', loginValidation, validate, login)
router.get('/me', requireAuth, getMe)   // requireAuth from Prompt 2.4
```

## Validation Checkpoints
- [ ] `POST /api/auth/register` with valid data returns 201 with user and token
- [ ] `POST /api/auth/register` with duplicate email returns 409
- [ ] `POST /api/auth/register` with weak password returns 422 with validation error array
- [ ] `POST /api/auth/register` with `role: 'admin'` in body is rejected or ignored
- [ ] `POST /api/auth/login` with correct credentials returns token
- [ ] `POST /api/auth/login` with wrong password returns 401 with generic message
- [ ] `GET /api/auth/me` without token returns 401

## Common Mistakes to Avoid
- **Do NOT** write business logic in controllers — if you find yourself writing `if/else` for business rules in a controller, move it to the service
- **Do NOT** allow admin role self-registration — admin accounts are seeded, not registered through the public endpoint
- **Do NOT** return the token inside the `user` object — token and user should be sibling keys in the response data

## Interview Explanation Points
- "Controllers are intentionally thin — they parse input, call a service, return a response. Business logic lives in services. This separation makes each layer independently testable and replaceable."
- "I prevent admin self-registration at the validation layer by excluding 'admin' from the allowed role enum. Admin accounts are seeded directly into the database."

---

# PROMPT 2.4 — JWT Authentication Middleware & Role-Based Authorization

## Objective
Implement `auth.middleware.js` containing the `requireAuth` middleware that verifies JWT tokens on protected routes, and `role.middleware.js` containing the `requireRole` middleware for role-based access control. These two middleware functions will be used on every protected route in the entire application.

## Architecture Reasoning
Middleware is the correct architectural location for authentication and authorization logic because it runs before route handlers and can short-circuit the request pipeline cleanly. Putting auth checks inside controllers violates separation of concerns and leads to duplication across every protected route.

Two separate middleware functions (`requireAuth` and `requireRole`) are created deliberately. `requireAuth` only verifies identity (is this a valid logged-in user?). `requireRole` verifies permissions (does this user have the right role?). Separating them means you can apply just identity verification on some routes and add role checking on others — composable and flexible.

## Implementation Scope Boundaries
- Implement `middleware/auth.middleware.js` — `requireAuth`
- Implement `middleware/role.middleware.js` — `requireRole`
- Wire `requireAuth` onto `GET /api/auth/me`
- Do NOT apply to all routes yet — each phase applies middleware to its own routes

## `requireAuth` Middleware Specification

```javascript
// middleware/auth.middleware.js

export const requireAuth = asyncHandler(async (req, res, next) => {
  
  // Step 1: Extract token from Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please log in.', 401)
  }
  
  const token = authHeader.split(' ')[1]
  
  // Step 2: Verify token signature and expiry
  // jwt.verify throws if invalid or expired — caught by asyncHandler → error middleware
  const decoded = jwt.verify(token, config.jwtSecret)
  
  // Step 3: Check user still exists and is active
  const user = await User.findById(decoded.id)
  if (!user) {
    throw new AppError('User account no longer exists', 401)
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403)
  }
  
  // Step 4: Attach user to request object
  req.user = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email
  }
  
  next()
})
```

**Why check the database on every request?**
The JWT itself could be valid but the user may have been deactivated by an admin after the token was issued. The database check catches this. For an MVP this is acceptable — at scale, a token blacklist or short expiry + refresh token pattern handles this more efficiently.

## `requireRole` Middleware Specification

```javascript
// middleware/role.middleware.js

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // requireAuth must run before requireRole
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. This route requires one of: ${allowedRoles.join(', ')}`,
        403
      )
    }
    
    next()
  }
}
```

**Usage pattern throughout the application:**
```javascript
// Only admins can access this route
router.get('/admin/doctors', requireAuth, requireRole('admin'), getDoctors)

// Only doctors can access this route
router.post('/availability', requireAuth, requireRole('doctor'), setAvailability)

// Both patients and admins can access
router.get('/bookings', requireAuth, requireRole('patient', 'admin'), getBookings)
```

## JWT Error Handling in Error Middleware
The global error middleware from Prompt 1.6 must handle JWT-specific errors:

```javascript
// Add to error.middleware.js

if (err.name === 'JsonWebTokenError') {
  return errorResponse(res, 401, 'Invalid token. Please log in again.')
}

if (err.name === 'TokenExpiredError') {
  return errorResponse(res, 401, 'Your session has expired. Please log in again.')
}
```

## Validation Checkpoints
- [ ] `GET /api/auth/me` without Authorization header → 401
- [ ] `GET /api/auth/me` with malformed token → 401 "Invalid token"
- [ ] `GET /api/auth/me` with expired token → 401 "Session expired"
- [ ] `GET /api/auth/me` with valid patient token → 200 with user data
- [ ] Route protected with `requireRole('admin')` accessed by patient token → 403
- [ ] Route protected with `requireRole('doctor')` accessed by admin token → 403
- [ ] Deleting a user from DB while holding their token → 401 on next request

## Common Mistakes to Avoid
- **Do NOT** skip the database lookup in `requireAuth` — JWT validity does not guarantee the user still exists
- **Do NOT** put role checking inside `requireAuth` — keep the two concerns separated
- **Do NOT** use `req.user = user` (full Mongoose document) — attach only a plain object with needed fields to avoid accidentally saving changes through the request
- **Do NOT** forget to add JWT error handling to the global error middleware — unhandled JWT errors produce confusing 500 responses

## Interview Explanation Points
- "I separated `requireAuth` and `requireRole` into two middleware functions because they represent different concerns — identity verification versus permission checking. This keeps them composable: some routes need both, some only need identity, and the role check can specify multiple allowed roles using spread arguments."
- "I verify the user still exists in the database on every authenticated request because JWT tokens are stateless — the token remains valid even if an admin deactivates the account. The database check catches this edge case."
- "At scale, this database lookup on every request becomes a bottleneck. The production solution would be short-lived access tokens (15 minutes) combined with refresh tokens, or a Redis-based token blacklist. For MVP, the database check is the correct pragmatic choice."

---

# PROMPT 2.5 — Frontend Authentication State Management

## Objective
Implement the complete frontend authentication system: Zustand auth store, login/register API functions, auth context/provider, token persistence in localStorage, and automatic token injection via the Axios interceptor. After this prompt, the frontend knows who is logged in, persists sessions across page refreshes, and automatically attaches tokens to all API requests.

## Architecture Reasoning
Zustand is chosen over React Context for auth state because auth state is read by many components (Navbar, route guards, dashboard components) and Context re-renders the entire tree on every change. Zustand only re-renders components that subscribe to the specific state slice they use — significantly better performance for a state that many components read but rarely changes.

The token is stored in `localStorage` rather than `httpOnly` cookies because the frontend and backend are on different domains (Vercel and Render), making cross-domain cookies complex to configure correctly in an MVP timeframe. The Axios interceptor approach is the standard industry solution for this deployment architecture.

## Implementation Scope Boundaries
- Implement Zustand auth store
- Implement API functions for register and login
- Implement Axios interceptor for token injection
- Implement auth initialization on app load (token hydration)
- Create `AuthProvider` component that initializes auth state
- Do NOT implement protected route wrappers yet (Prompt 2.6)
- Do NOT implement login/register UI forms yet (Prompt 2.7)

## Zustand Auth Store Specification

```javascript
// store/authStore.js

State shape:
{
  user: null,           // { id, name, email, role, profileImage }
  token: null,          // JWT string
  isAuthenticated: false,
  isLoading: false,     // true while login/register API call is in flight
  error: null           // last auth error message
}

Actions:
  setCredentials(user, token):
    - Set user, token, isAuthenticated: true
    - Persist token to localStorage: localStorage.setItem('physio_token', token)
    - Persist user to localStorage: localStorage.setItem('physio_user', JSON.stringify(user))

  clearCredentials():
    - Set user: null, token: null, isAuthenticated: false
    - Remove from localStorage
    - Called on logout and on 401 responses

  initializeAuth():
    - Called once on app load
    - Read token from localStorage
    - Read user from localStorage
    - If both exist: setCredentials(user, token)
    - This restores session across page refreshes

  setLoading(bool): sets isLoading

  setError(message): sets error
```

## API Functions

```javascript
// api/auth.api.js

import axiosInstance from './axiosInstance'

export const registerAPI = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData)
  return response.data
}

export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials)
  return response.data
}

export const getMeAPI = async () => {
  const response = await axiosInstance.get('/auth/me')
  return response.data
}
```

## Axios Interceptor Update

Update `api/axiosInstance.js` to:

```javascript
// Request interceptor — attach token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('physio_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials
      localStorage.removeItem('physio_token')
      localStorage.removeItem('physio_user')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## Auth Initialization in `main.jsx`

```jsx
// main.jsx
const App = () => {
  const initializeAuth = useAuthStore(state => state.initializeAuth)
  
  useEffect(() => {
    initializeAuth()
  }, [])
  
  return <AppRoutes />
}
```

## Validation Checkpoints
- [ ] After login, `localStorage` contains `physio_token` and `physio_user`
- [ ] After page refresh, auth state is restored from localStorage
- [ ] Every Axios request includes `Authorization: Bearer <token>` header (verify in Network tab)
- [ ] After logout, localStorage is cleared and token is no longer sent
- [ ] A 401 response from any API call clears localStorage and redirects to `/login`
- [ ] `useAuthStore(state => state.user)` returns the logged-in user from any component

## Common Mistakes to Avoid
- **Do NOT** store the entire user object with sensitive fields in localStorage — only store what the UI needs (id, name, email, role, profileImage)
- **Do NOT** call `initializeAuth` inside a deeply nested component — call it once at the app root
- **Do NOT** use `useContext` for auth state if using Zustand — pick one pattern and use it consistently
- **Do NOT** forget to clear both `physio_token` AND `physio_user` on logout — leaving one causes inconsistent state

## Interview Explanation Points
- "I chose Zustand over Context for auth state because auth is read by many components across the entire tree. Zustand's selective subscription model means only components that explicitly subscribe to auth state re-render when it changes — Context would re-render the entire component tree."
- "I store the token in localStorage rather than cookies because the frontend and backend are on separate domains. Cross-domain httpOnly cookies require specific `SameSite` and CORS cookie configurations that add complexity not worth the tradeoff in an MVP."
- "The Axios response interceptor handles 401 responses globally — instead of every API call individually handling token expiry, the interceptor catches it once and redirects to login. This is the standard pattern for SPA authentication."

---

# PROMPT 2.6 — Frontend Protected Route Guards

## Objective
Implement the `ProtectedRoute` component and `RoleRoute` component that wrap role-specific route groups. These components redirect unauthenticated users to `/login` and redirect authenticated users to their correct dashboard if they try to access routes meant for other roles. Update `AppRoutes.jsx` to apply these guards to all protected route groups.

## Architecture Reasoning
Route guards are the frontend equivalent of backend auth middleware. Without them, a patient could manually navigate to `/admin/dashboard` and see the admin UI (even if the API calls would fail). While the real security enforcement happens on the backend, frontend route guards provide the correct UX and prevent confusing experiences.

The two-guard architecture (`ProtectedRoute` for authentication, `RoleRoute` for role-specific access) mirrors the backend middleware design from Prompt 2.4 — consistent architectural thinking across both layers.

## Implementation Scope Boundaries
- Implement `routes/ProtectedRoute.jsx`
- Implement `routes/RoleRoute.jsx`
- Update `AppRoutes.jsx` to wrap all protected routes
- Implement role-based dashboard redirect on successful login
- Do NOT implement any dashboard page content yet

## `ProtectedRoute` Component Specification

```jsx
// routes/ProtectedRoute.jsx

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <LoadingSpinner />  // Prevents flash of redirect during auth init
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
    // 'replace' prevents back-button returning to protected page
  }
  
  return children
}
```

## `RoleRoute` Component Specification

```jsx
// routes/RoleRoute.jsx

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user?.role)) {
    // Redirect to their correct dashboard instead of showing error
    const dashboardRoutes = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard'
    }
    return <Navigate to={dashboardRoutes[user.role] || '/login'} replace />
  }
  
  return children
}
```

## Updated `AppRoutes.jsx` Structure

```jsx
// Routes structure after guards applied:

Public routes (no guard):
  / → LandingPage
  /login → LoginPage
  /register → RegisterPage
  /doctors → DoctorListingPage
  /doctors/:id → DoctorProfilePage

Patient routes (RoleRoute allowedRoles=['patient']):
  /patient/dashboard → PatientDashboard
  /patient/appointments → PatientAppointments
  /patient/payments → PatientPayments
  /patient/profile → PatientProfile

Doctor routes (RoleRoute allowedRoles=['doctor']):
  /doctor/dashboard → DoctorDashboard
  /doctor/appointments → DoctorAppointments
  /doctor/availability → DoctorAvailability
  /doctor/profile → DoctorProfileEditor
  /doctor/earnings → DoctorEarnings

Admin routes (RoleRoute allowedRoles=['admin']):
  /admin/dashboard → AdminDashboard
  /admin/doctors → AdminDoctorVerification
  /admin/bookings → AdminBookings
  /admin/users → AdminUsers
  /admin/revenue → AdminRevenue
```

## Post-Login Role-Based Redirect
After successful login, redirect user to their role-specific dashboard:

```javascript
// In login handler (Prompt 2.7):
const dashboardRoutes = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard'
}
navigate(dashboardRoutes[user.role])
```

## Redirect Rules Summary

| Scenario | Result |
|----------|--------|
| Unauthenticated → `/patient/dashboard` | Redirect to `/login` |
| Patient → `/admin/dashboard` | Redirect to `/patient/dashboard` |
| Doctor → `/patient/appointments` | Redirect to `/doctor/dashboard` |
| Admin → any admin route | ✅ Allowed |
| Unauthenticated → `/doctors` | ✅ Allowed (public) |
| Authenticated patient → `/login` | Redirect to `/patient/dashboard` |

The last rule (redirect authenticated users away from login page) should also be implemented: wrap `LoginPage` and `RegisterPage` with a check that redirects already-authenticated users to their dashboard.

## Validation Checkpoints
- [ ] Navigating to `/patient/dashboard` while logged out → redirects to `/login`
- [ ] Navigating to `/admin/dashboard` as a patient → redirects to `/patient/dashboard`
- [ ] Navigating to `/login` while already logged in → redirects to correct dashboard
- [ ] Page refresh on `/patient/dashboard` while logged in → stays on the page
- [ ] `LoadingSpinner` appears briefly during auth initialization (prevents redirect flash)
- [ ] Back button after redirect to login does NOT return to protected page

## Common Mistakes to Avoid
- **Do NOT** use `<Redirect>` — React Router v6 uses `<Navigate>`
- **Do NOT** forget `replace` prop on `<Navigate>` — without it, the protected page stays in history and the back button returns to it
- **Do NOT** skip the `isLoading` check — without it, there's a flash where unauthenticated users briefly see the protected page before being redirected
- **Do NOT** show a 403 error page when a user hits the wrong role route — redirecting them to their correct dashboard is a better UX

## Interview Explanation Points
- "Frontend route guards don't replace backend security — they improve UX. Real authorization happens in the backend middleware. The frontend guard just prevents confusing experiences like a patient seeing an empty admin dashboard."
- "I redirect wrong-role users to their own dashboard instead of showing a 403 error. In a marketplace, showing an error page when a doctor accidentally navigates to the patient section is unnecessarily jarring — silently redirecting them is cleaner."

---

# PROMPT 2.7 — Login & Registration UI Pages

## Objective
Build the `LoginPage` and `RegisterPage` UI components with full form handling, client-side validation, API integration, loading states, and error display. After this prompt, all three user roles can register and log in through the actual UI, and are redirected to their role-specific dashboard upon success.

## Architecture Reasoning
The auth pages are the entry point of the entire user experience. They must feel polished, functional, and trustworthy because they create the first impression. The forms must handle all edge cases — loading states during API calls, clear error messaging, disabled submit during submission, and smooth redirect on success. Getting these right now means every future page that has forms can reference this as a pattern.

## Implementation Scope Boundaries
- Implement `LoginPage.jsx` with full functionality
- Implement `RegisterPage.jsx` with full functionality
- Implement client-side form validation
- Integrate with auth API functions and Zustand store
- Implement loading states and error display
- Do NOT implement complex profile setup flows (that's doctor onboarding in Phase 3)

## LoginPage Specification

**Layout:** Centered card on a clean background. Left side can optionally show a brand illustration or tagline. Right side contains the form.

**Form Fields:**
```
Email input:
  - type="email"
  - Placeholder: "Enter your email"
  - Validation: required, valid email format

Password input:
  - type="password" with show/hide toggle
  - Placeholder: "Enter your password"
  - Validation: required

Submit button:
  - Text: "Sign In" when idle, "Signing in..." when loading
  - Disabled during loading state
  - Full width, primary color

Below form:
  - "Don't have an account? Register here" → links to /register
```

**Form Submission Logic:**
```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
    const result = await loginAPI({ email, password })
    setCredentials(result.data.user, result.data.token)
    toast.success('Welcome back!')
    navigate(dashboardRoutes[result.data.user.role])
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

## RegisterPage Specification

**Form Fields:**
```
Full Name input:
  - Validation: required, min 2 characters

Email input:
  - Validation: required, valid email

Password input:
  - With show/hide toggle
  - Validation: min 8 chars, must contain uppercase, lowercase, number
  - Show a password strength indicator (simple color bar — weak/medium/strong)

Confirm Password input:
  - Validation: must match password field

Role selector:
  - Styled radio buttons or toggle: "I'm a Patient" / "I'm a Doctor"
  - Defaults to Patient
  - Note: Admin role not available here

Submit button:
  - Text: "Create Account" / "Creating account..."
  - Disabled during loading

Below form:
  - "Already have an account? Sign in" → links to /login
```

**Error Display Pattern (use consistently across all future forms):**
```jsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
    {error}
  </div>
)}
```

## Toast Notification Setup
`react-hot-toast` should be configured in `App.jsx`:
```jsx
import { Toaster } from 'react-hot-toast'

// Inside App return:
<Toaster 
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: { borderRadius: '8px', fontSize: '14px' }
  }}
/>
```

Use `toast.success()`, `toast.error()`, `toast.loading()` consistently across all future user actions.

## Design Requirements
```
Container: max-w-md centered with card shadow
Background: light surface color or subtle gradient
Logo/brand mark at top of form card
Input fields: clean border, focus ring in primary color
Labels: small, uppercase-spaced or regular — consistent across all forms
Spacing: generous padding, breathing room between fields
Typography: Inter font, clear hierarchy
```

## Admin Seed Account
Since admin cannot self-register, create a seed script:

```javascript
// server/src/config/seedAdmin.js

async function seedAdmin() {
  const existing = await User.findOne({ role: 'admin' })
  if (existing) {
    logger.info('Admin already exists — skipping seed')
    return
  }
  
  await User.create({
    name: 'Platform Admin',
    email: 'admin@physioconnect.com',
    password: 'Admin@123456',   // Will be hashed by pre-save hook
    role: 'admin'
  })
  
  logger.info('Admin account seeded successfully')
}
```

Call `seedAdmin()` inside `connectDB()` after successful connection. Document the admin credentials in the README under "Demo Credentials."

## Validation Checkpoints
- [ ] Patient registers → redirected to `/patient/dashboard`
- [ ] Doctor registers → redirected to `/doctor/dashboard`
- [ ] Admin logs in with seeded credentials → redirected to `/admin/dashboard`
- [ ] Wrong password → error message displayed inline, form NOT cleared
- [ ] Submit button disabled during loading, re-enabled after response
- [ ] Toast notification appears on successful login
- [ ] Password show/hide toggle works
- [ ] Navigating to `/login` while logged in → redirects to correct dashboard
- [ ] Network error (backend down) → user-friendly error message, not a crash

## Common Mistakes to Avoid
- **Do NOT** clear the form on failed login — users should not retype their email
- **Do NOT** show raw API error objects — always extract `.message` from the error response
- **Do NOT** forget `e.preventDefault()` on form submit handlers
- **Do NOT** enable the submit button during loading — double-submission creates duplicate records
- **Do NOT** use `window.location.href` for post-login redirect — use React Router's `navigate()`

## Interview Explanation Points
- "The password field uses a show/hide toggle because usability research consistently shows it reduces form abandonment. Small UX details like this signal product thinking."
- "I seed the admin account programmatically on startup rather than through the registration UI because admin access should never be self-grantable. The seed runs idempotently — it checks for an existing admin before creating one."
- "Error messages are displayed inline within the form, not as modal alerts, because inline errors are faster to understand and act on — the user doesn't need to dismiss anything before fixing the field."

---

# PROMPT 2.8 — Dashboard Shell Pages & Role-Specific Navigation

## Objective
Build the dashboard shell pages for all three roles with proper layout components, role-specific sidebar navigation, and a consistent header with user info and logout functionality. After this prompt, each role has a visually distinct, navigable dashboard area that feels like a real SaaS product — even though the content is still placeholder.

## Architecture Reasoning
Dashboard shells are high-visibility and create strong first impressions during demos. Building them now — even as empty frames — means that every subsequent phase slots its UI into an already-polished container. The alternative (building page content first and adding layout later) consistently produces visual inconsistency and layout debt.

## Implementation Scope Boundaries
- Build `DashboardLayout.jsx` with sidebar + header + content area
- Build `AdminLayout.jsx` with distinct admin styling
- Create sidebar navigation components for each role
- Implement logout functionality
- Create placeholder stat cards for each dashboard home page
- Do NOT implement real data — use hardcoded placeholder values

## Sidebar Navigation Items Per Role

**Patient Sidebar:**
```
Dashboard          → /patient/dashboard
My Appointments    → /patient/appointments
Payment History    → /patient/payments
My Profile         → /patient/profile
[Logout button]
```

**Doctor Sidebar:**
```
Dashboard          → /doctor/dashboard
Appointments       → /doctor/appointments
Availability       → /doctor/availability
My Profile         → /doctor/profile
Earnings           → /doctor/earnings
[Logout button]
```

**Admin Sidebar:**
```
Dashboard          → /admin/dashboard
Doctor Verification → /admin/doctors
Bookings           → /admin/bookings
Users              → /admin/users
Revenue            → /admin/revenue
[Logout button]
```

## Dashboard Home Page Placeholder Cards

Each dashboard home should show 3–4 placeholder stat cards:

**Patient Dashboard:**
```
"Total Appointments: —"
"Upcoming: —"
"Completed: —"
"Reviews Given: —"
```

**Doctor Dashboard:**
```
"Today's Appointments: —"
"Total Patients: —"
"Pending Verification: [status badge]"
"Total Earnings: ₹—"
```

**Admin Dashboard:**
```
"Total Users: —"
"Doctors Pending Verification: —"
"Total Bookings: —"
"Platform Revenue: ₹—"
```

Use `—` as placeholder. These will be replaced with real data in Phase 9.

## Header Component
Each dashboard layout should include a top header bar:
```
Left: Page title (dynamic based on current route)
Right: User avatar (placeholder circle) + user name + role badge + logout button

Logout handler:
  - Call clearCredentials() from Zustand store
  - toast.success('Logged out successfully')
  - navigate('/login')
```

## Visual Distinction Between Layouts
```
PublicLayout: white navbar, no sidebar, full-width content
DashboardLayout: white sidebar (patient/doctor), left sidebar 240px fixed, content area scrollable
AdminLayout: dark sidebar (#1E293B background), admin badge in sidebar header
```

The dark admin sidebar immediately signals "you are in admin territory" — a common SaaS pattern that prevents admin users from accidentally thinking they're in the regular user view.

## Active Route Highlighting in Sidebar

Use `NavLink` from React Router — it automatically adds an `active` class when the link matches the current route:

```jsx
<NavLink 
  to="/patient/dashboard"
  className={({ isActive }) => 
    isActive 
      ? 'bg-primary text-white rounded-lg px-3 py-2' 
      : 'text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2'
  }
>
  Dashboard
</NavLink>
```

## Validation Checkpoints
- [ ] Patient login → patient sidebar renders with correct nav items
- [ ] Doctor login → doctor sidebar renders with correct nav items
- [ ] Admin login → dark sidebar renders with admin nav items
- [ ] Active route highlighted in sidebar when on correct page
- [ ] Logout button clears auth and redirects to `/login`
- [ ] User name and role visible in dashboard header
- [ ] Sidebar does NOT render on public pages (landing, doctor listing)
- [ ] Dashboard content area scrolls independently of fixed sidebar

## Common Mistakes to Avoid
- **Do NOT** render all three sidebars and conditionally hide them — render only the one matching the user's role
- **Do NOT** use regular `<Link>` for sidebar items — use `<NavLink>` for active state support
- **Do NOT** implement real dashboard data yet — hardcoded placeholders are correct for Phase 2

---

## Phase 2 Completion Gate

Before moving to Phase 3, ALL of the following must be true:

```
✅ User model created with correct fields, hooks, and methods
✅ Auth service implements register and login with correct security rules
✅ POST /api/auth/register creates users correctly for patient and doctor roles
✅ POST /api/auth/login returns JWT token on valid credentials
✅ GET /api/auth/me returns current user when valid token provided
✅ requireAuth middleware blocks requests without valid token
✅ requireRole middleware blocks wrong-role access
✅ Zustand auth store persists across page refreshes
✅ All Axios requests include Authorization header when logged in
✅ LoginPage and RegisterPage are functional and polished
✅ Role-based dashboard redirect works after login
✅ Protected routes redirect unauthenticated users to /login
✅ Wrong-role route access redirects to correct dashboard
✅ Admin seed account exists and can log in
✅ All three dashboard shells visible with role-specific sidebars
✅ Logout functionality clears state and redirects correctly
✅ Deployed to Vercel/Render — auth flow works in production
```

**Phase 2 unlocks Phase 3 (Doctor Onboarding & Verification) because:**
- The User model exists and doctor users can register
- JWT auth and role middleware are ready to protect doctor-only routes
- `requireRole('doctor')` and `requireRole('admin')` are available for profile and verification routes
- The doctor dashboard shell exists and is ready to receive real content
- The admin dashboard shell is ready to receive the verification queue
- The Axios instance automatically sends tokens so doctor profile API calls are pre-authenticated

---

Say **"generate Phase 3 prompts"** when ready.