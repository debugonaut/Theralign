# PhysioConnect — Phase 4 Complete Prompt Set
## Doctor Discovery, Search & Proximity Recommendations

---

# PROMPT 4.1 — Discovery Service Layer & Query Architecture

## Objective
Implement the complete `services/discovery.service.js` containing all search, filtering, and proximity query logic. This service is the intelligence layer behind the doctor listing page — it combines MongoDB geospatial queries, specialization filtering, text search, rating-based sorting, and availability filtering into a single composable query system. Every discovery feature in the platform flows through this service.

## Architecture Reasoning
Discovery logic is extracted into its own dedicated service file rather than living inside `doctor.service.js` because it represents a distinctly different concern. `doctor.service.js` handles profile CRUD operations. `discovery.service.js` handles search and recommendation logic. This separation becomes especially important in Phase 8 when AI-enhanced recommendations augment the same discovery pipeline — the AI layer will call `discovery.service.js` functions after interpreting symptoms, not doctor CRUD functions.

The query architecture uses a **dynamic query builder pattern** — a `buildDiscoveryQuery()` function that assembles MongoDB filter objects based on which parameters the user actually provides. This prevents the common mistake of hardcoding filter combinations and makes the query system extensible without rewriting core logic.

Proximity search uses MongoDB's `$near` operator with a `2dsphere` index rather than computing distances in application code. This is architecturally important for two reasons: MongoDB performs distance filtering at the database level (far more efficient than fetching all doctors and filtering in Node.js), and the `$near` operator automatically sorts results by distance ascending, which is the natural expected behavior for proximity-based discovery.

## Implementation Scope Boundaries
- Implement `services/discovery.service.js` completely
- Implement `buildDiscoveryQuery()` utility function
- Implement proximity search using MongoDB `$near`
- Implement text search across name, specialization, clinic name
- Implement multi-parameter filtering with pagination
- Do NOT implement AI-enhanced recommendations here (Phase 8)
- Do NOT implement availability slot queries (Phase 5)

## `discovery.service.js` Complete Function Specifications

---

### `buildDiscoveryQuery(filters)`

```
Purpose: Assembles a MongoDB filter object from optional query parameters.
Called by all discovery functions to ensure consistent filter behavior.

Parameters (all optional):
  filters = {
    specialization,    // string — must match enum exactly
    minFee,            // number — consultationFee >= minFee
    maxFee,            // number — consultationFee <= maxFee
    minRating,         // number — rating >= minRating
    minExperience,     // number — experience >= minExperience
    search,            // string — text search across multiple fields
    isAvailable,       // boolean — filter by availability toggle
  }

Base query always applied:
  {
    verificationStatus: DOCTOR_STATUS.VERIFIED,
    isAvailable: true    // Hidden doctors never appear
  }

Conditional additions:
  if specialization:
    query.specialization = specialization

  if minFee or maxFee:
    query.consultationFee = {}
    if minFee: query.consultationFee.$gte = Number(minFee)
    if maxFee: query.consultationFee.$lte = Number(maxFee)

  if minRating:
    query.rating = { $gte: Number(minRating) }

  if minExperience:
    query.experience = { $gte: Number(minExperience) }

  if search:
    query.$or = [
      { specialization: { $regex: search, $options: 'i' } },
      { clinicName: { $regex: search, $options: 'i' } },
      { clinicAddress: { $regex: search, $options: 'i' } }
    ]
    Note: Name search requires joining User collection.
    Handle separately — see searchDoctors() below.

Returns: MongoDB filter object
```

---

### `getDiscoveryListing({ filters, sortBy, page, limit })`

```
Purpose: Standard doctor listing without location filtering.
Used by: DoctorListingPage when user has not shared location.

Steps:
1. Call buildDiscoveryQuery(filters) to get base query
2. Build sort object:
   sortBy === 'rating'      → { rating: -1 }
   sortBy === 'experience'  → { experience: -1 }
   sortBy === 'fee_asc'     → { consultationFee: 1 }
   sortBy === 'fee_desc'    → { consultationFee: -1 }
   default                  → { rating: -1 }
3. Count total matching documents: DoctorProfile.countDocuments(query)
4. Execute paginated query:
   DoctorProfile.find(query)
     .sort(sort)
     .skip((page - 1) * limit)
     .limit(limit)
     .populate('user', 'name profileImage')
     .lean()   ← Use .lean() for read-only queries — returns plain JS objects, faster
5. Return: { doctors, total, page, totalPages, hasNextPage }

hasNextPage = page * limit < total
```

---

### `getNearbyDoctors({ latitude, longitude, maxDistance, filters, page, limit })`

```
Purpose: Location-aware doctor discovery using MongoDB geospatial query.
Used by: DoctorListingPage when user shares location.

CRITICAL NOTE on $near + pagination:
$near cannot be combined with .skip()/.limit() in MongoDB when used as
a top-level query operator. The workaround is to use $geoWithin with
$centerSphere for paginated proximity queries, or fetch all nearby
results and paginate in application code for MVP scope.

For MVP — acceptable approach:
Use $near to get nearby doctors (without pagination limit),
then apply pagination in application code.
This is fine for MVP where nearby result sets are small.
Document this as a known scalability improvement area.

Steps:
1. Validate coordinates:
   if (!latitude || !longitude) throw new AppError('Location required', 400)
   if (latitude < -90 || latitude > 90) throw new AppError('Invalid latitude', 400)
   if (longitude < -180 || longitude > 180) throw new AppError('Invalid longitude', 400)

2. Build base filters from buildDiscoveryQuery(filters)

3. Execute geospatial query:
   const allNearby = await DoctorProfile.find({
     ...baseFilters,
     location: {
       $near: {
         $geometry: {
           type: 'Point',
           coordinates: [longitude, latitude]  // ← longitude FIRST
         },
         $maxDistance: maxDistance || GEOSPATIAL.DEFAULT_DISTANCE_METERS
       }
     }
   })
   .populate('user', 'name profileImage')
   .lean()

4. Calculate distance for each result:
   Add a computed 'distanceKm' field to each result:
   distanceKm = calculateDistance(latitude, longitude,
     doctor.location.coordinates[1],   // doctor latitude
     doctor.location.coordinates[0]    // doctor longitude
   ).toFixed(1)

5. Apply in-memory pagination:
   const total = allNearby.length
   const paginated = allNearby.slice((page-1)*limit, page*limit)

6. Return: { doctors: paginated, total, page, totalPages, searchRadius: maxDistance }
```

---

### `calculateDistance(lat1, lon1, lat2, lon2)`

```
Purpose: Haversine formula for distance between two coordinates.
Returns: distance in kilometers as a number.

This is a standard implementation — include it as a utility
function inside discovery.service.js or utils/geo.utils.js.

Formula (Haversine):
  R = 6371  // Earth radius in km
  dLat = (lat2 - lat1) * Math.PI / 180
  dLon = (lon2 - lon1) * Math.PI / 180
  a = Math.sin(dLat/2)² + Math.cos(lat1 * π/180) * Math.cos(lat2 * π/180) * Math.sin(dLon/2)²
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c

Why implement this even though $near handles distance filtering?
Because $near doesn't return the actual distance value in results.
We compute it ourselves so the frontend can display "2.3 km away"
on doctor cards — a critical UX detail for a proximity-aware platform.
```

---

### `searchDoctors({ query, filters, page, limit })`

```
Purpose: Full text search including doctor names.
Challenge: Doctor name lives in User collection, not DoctorProfile.
Solution: Two-phase search.

Steps:
1. Search User collection for name matches:
   const matchingUsers = await User.find({
     role: ROLES.DOCTOR,
     name: { $regex: query, $options: 'i' }
   }).select('_id')

   const matchingUserIds = matchingUsers.map(u => u._id)

2. Build compound query:
   const searchQuery = {
     verificationStatus: DOCTOR_STATUS.VERIFIED,
     isAvailable: true,
     $or: [
       { user: { $in: matchingUserIds } },          // Name match
       { specialization: { $regex: query, $options: 'i' } },
       { clinicName: { $regex: query, $options: 'i' } },
       { bio: { $regex: query, $options: 'i' } }
     ],
     ...buildDiscoveryQuery(filters)   // Apply any additional filters
   }

3. Apply sort, pagination, and populate as in getDiscoveryListing()

4. Return: { doctors, total, page, totalPages, searchQuery: query }
```

---

### `getDoctorsBySpecialization(specialization, { page, limit })`

```
Purpose: Fetch doctors by exact specialization.
Used by: AI recommendation flow in Phase 8 — AI interprets symptoms,
extracts specialization, calls this function.

Steps:
1. Validate specialization is in the enum list
2. Query: { verificationStatus: 'verified', isAvailable: true, specialization }
3. Sort by rating descending
4. Paginate and populate
5. Return standard pagination response
```

---

### `getFeaturedDoctors(limit = 6)`

```
Purpose: Returns top-rated verified doctors for landing page preview.
No filters, no pagination — just the best doctors for hero display.

Steps:
1. Query: { verificationStatus: 'verified', isAvailable: true, reviewCount: { $gte: 1 } }
2. Sort: { rating: -1, reviewCount: -1 }
3. Limit to 6
4. Populate user
5. Return: { doctors }

Note: reviewCount >= 1 ensures only doctors with real reviews
appear in the featured section. In Phase 3 seed data,
manually add some reviews so this returns results during demo.
```

## Validation Checkpoints
- [ ] `getDiscoveryListing()` with no filters returns all verified doctors
- [ ] `getDiscoveryListing()` with `specialization` filter returns only matching doctors
- [ ] `getDiscoveryListing()` with `minFee: 500, maxFee: 1000` returns doctors in fee range
- [ ] `getNearbyDoctors()` with valid coordinates returns doctors sorted by distance
- [ ] `getNearbyDoctors()` with `maxDistance: 5000` (5km) returns only nearby doctors
- [ ] `calculateDistance()` between Mumbai and Pune coordinates returns approximately 150km
- [ ] `searchDoctors('knee')` returns doctors with 'knee' in bio or specialization
- [ ] `searchDoctors('Dr. Sharma')` returns doctor whose User.name matches
- [ ] `getFeaturedDoctors()` returns maximum 6 results with rating > 0
- [ ] No unverified or unavailable doctors appear in any function result

## Common Mistakes to Avoid
- **Do NOT** use `$near` with `.skip()` for pagination — it causes a MongoDB error
- **Do NOT** put coordinates as `[latitude, longitude]` — GeoJSON requires `[longitude, latitude]`
- **Do NOT** forget `.lean()` on read-only listing queries — Mongoose documents carry significant overhead for large result sets
- **Do NOT** make `searchDoctors` do a full collection scan without the `$regex` index — acceptable for MVP but document as a future optimization (MongoDB Atlas Search would replace this at scale)
- **Do NOT** expose unverified doctors through any discovery function regardless of how the query is called

## Interview Explanation Points
- "I built a `buildDiscoveryQuery()` function that assembles MongoDB filter objects dynamically rather than writing separate query functions for each filter combination. This means adding a new filter parameter requires changing only one place."
- "The `$near` operator sorts results by distance automatically, but doesn't return the actual distance value. I use the Haversine formula to compute the distance for each result so the UI can display '2.3 km away' — a critical UX detail for proximity-aware discovery."
- "I use `.lean()` on all listing queries because they're read-only. Mongoose documents are full JavaScript objects with all prototype methods attached — for a listing query returning 20 doctors, `.lean()` returns plain objects that are 3-4x faster to serialize."
- "The two-phase search for doctor names — first searching User, then querying DoctorProfile with the matching IDs — is necessary because the doctor's name lives in the User collection, not DoctorProfile. At scale, MongoDB Atlas Search would handle cross-collection full-text search natively."

## What NOT to Implement Yet
- AI symptom interpretation (Phase 8)
- Availability-aware filtering (Phase 5 — slot data doesn't exist yet)
- Saved/favorited doctors
- Advanced ranking algorithms

---

# PROMPT 4.2 — Discovery Controller & Route Configuration

## Objective
Implement `controllers/discovery.controller.js` with thin controller functions that parse query parameters, delegate to the discovery service, and return consistent responses. Configure discovery-specific routes in `routes/doctor.routes.js` or a new `routes/discovery.routes.js`. All discovery endpoints are public — no authentication required.

## Architecture Reasoning
Discovery routes are deliberately public because the platform's growth depends on patients being able to browse doctors before committing to registration. Requiring login before browsing is a conversion-killing UX pattern that real healthcare marketplaces avoid. Authentication gates only apply to transactional actions — booking, payment, review — not browsing.

A separate `discovery.controller.js` is created rather than adding discovery functions to `doctor.controller.js` because the controller files would otherwise grow unmanageably large. One controller file per major feature domain keeps navigation and debugging clean.

## Implementation Scope Boundaries
- Implement `controllers/discovery.controller.js`
- Configure all discovery routes (public, no auth)
- Add query parameter validation and sanitization
- Mount discovery routes in `app.js`
- Do NOT implement auth-gated discovery features

## Complete Route Definitions

```
All routes: PUBLIC (no requireAuth)

GET /api/discover                    → getDiscoveryListing
GET /api/discover/nearby             → getNearbyDoctors
GET /api/discover/search             → searchDoctors
GET /api/discover/featured           → getFeaturedDoctors
GET /api/discover/specializations    → getSpecializationList
GET /api/discover/:id                → getDoctorPublicProfile
```

## Controller Function Specifications

---

### `getDiscoveryListing(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const {
    specialization,
    minFee, maxFee,
    minRating,
    minExperience,
    sortBy = 'rating',
    page = 1,
    limit = 12    // 12 per page fits clean 3-column grid layouts
  } = req.query

  // Sanitize numeric inputs from query string
  const filters = {
    specialization,
    minFee: minFee ? Number(minFee) : undefined,
    maxFee: maxFee ? Number(maxFee) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    minExperience: minExperience ? Number(minExperience) : undefined,
  }

  // Remove undefined keys to avoid polluting the query builder
  Object.keys(filters).forEach(k => filters[k] === undefined && delete filters[k])

  const result = await discoveryService.getDiscoveryListing({
    filters,
    sortBy,
    page: Number(page),
    limit: Math.min(Number(limit), PAGINATION.MAX_LIMIT)
  })

  return successResponse(res, 200, 'Doctors retrieved', result)
})
```

---

### `getNearbyDoctors(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const {
    latitude, longitude,
    maxDistance,      // in meters — frontend sends slider value
    specialization,
    page = 1,
    limit = 12
  } = req.query

  if (!latitude || !longitude) {
    throw new AppError('latitude and longitude query parameters are required', 400)
  }

  const result = await discoveryService.getNearbyDoctors({
    latitude: Number(latitude),
    longitude: Number(longitude),
    maxDistance: maxDistance ? Number(maxDistance) : GEOSPATIAL.DEFAULT_DISTANCE_METERS,
    filters: { specialization },
    page: Number(page),
    limit: Number(limit)
  })

  return successResponse(res, 200, 'Nearby doctors retrieved', result)
})
```

---

### `searchDoctors(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const { q, specialization, page = 1, limit = 12 } = req.query

  if (!q || q.trim().length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400)
  }

  const result = await discoveryService.searchDoctors({
    query: q.trim(),
    filters: { specialization },
    page: Number(page),
    limit: Number(limit)
  })

  return successResponse(res, 200, 'Search results retrieved', result)
})
```

---

### `getFeaturedDoctors(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const result = await discoveryService.getFeaturedDoctors(6)
  return successResponse(res, 200, 'Featured doctors retrieved', result)
})
```

---

### `getSpecializationList(req, res)`

```javascript
asyncHandler(async (req, res) => {
  // Return the enum list with doctor counts per specialization
  const specializationCounts = await DoctorProfile.aggregate([
    { $match: { verificationStatus: 'verified', isAvailable: true } },
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])

  // Merge with full enum list so all specializations appear
  // even if count is 0 (important for empty state UX)
  const allSpecializations = SPECIALIZATIONS.map(spec => ({
    name: spec,
    count: specializationCounts.find(s => s._id === spec)?.count || 0
  }))

  return successResponse(res, 200, 'Specializations retrieved', {
    specializations: allSpecializations
  })
})
```

This endpoint powers the specialization filter dropdown/chips on the discovery page. Including counts makes the filter feel data-driven rather than static.

---

### `getDoctorPublicProfile(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const profile = await doctorService.getDoctorProfileById(req.params.id)

  // Also fetch recent reviews for the profile page
  // Reviews model doesn't exist yet — return empty array placeholder
  const reviews = []  // Phase 7 will populate this

  return successResponse(res, 200, 'Doctor profile retrieved', {
    profile,
    reviews,
    reviewCount: profile.reviewCount,
    rating: profile.rating
  })
})
```

## Route File Configuration

```javascript
// routes/discovery.routes.js

import express from 'express'
import {
  getDiscoveryListing,
  getNearbyDoctors,
  searchDoctors,
  getFeaturedDoctors,
  getSpecializationList,
  getDoctorPublicProfile,
} from '../controllers/discovery.controller.js'

const router = express.Router()

// Order matters — specific routes before parameterized
router.get('/featured', getFeaturedDoctors)
router.get('/nearby', getNearbyDoctors)
router.get('/search', searchDoctors)
router.get('/specializations', getSpecializationList)
router.get('/', getDiscoveryListing)
router.get('/:id', getDoctorPublicProfile)

export default router
```

Mount in `app.js`:
```javascript
import discoveryRoutes from './src/routes/discovery.routes.js'
app.use('/api/discover', discoveryRoutes)
```

## Query Parameter Validation Rules

```
latitude, longitude:  must be valid floats — validate with isFloat()
maxDistance:          must be positive integer, max 100000 (100km)
page:                 must be positive integer, default 1
limit:                must be positive integer, max 50, default 12
minFee, maxFee:       must be non-negative numbers, maxFee > minFee
minRating:            must be between 0 and 5
q (search):           minimum 2 characters, maximum 100 characters
```

Add these as express-validator chains on the relevant routes.

## Validation Checkpoints
- [ ] `GET /api/discover` returns paginated verified doctors
- [ ] `GET /api/discover?specialization=Sports Physiotherapy` filters correctly
- [ ] `GET /api/discover?minFee=500&maxFee=1500` returns doctors in fee range
- [ ] `GET /api/discover?sortBy=fee_asc` returns doctors sorted by fee ascending
- [ ] `GET /api/discover/nearby?latitude=18.52&longitude=73.85` returns nearby doctors
- [ ] `GET /api/discover/nearby` without coordinates returns 400
- [ ] `GET /api/discover/search?q=back pain` returns matching doctors
- [ ] `GET /api/discover/search?q=a` returns 400 (query too short)
- [ ] `GET /api/discover/featured` returns max 6 top-rated doctors
- [ ] `GET /api/discover/specializations` returns all specializations with counts
- [ ] `GET /api/discover/:id` returns full doctor profile

## Common Mistakes to Avoid
- **Do NOT** forget to parse query parameters to Numbers — `req.query` always returns strings
- **Do NOT** allow `limit` to exceed `PAGINATION.MAX_LIMIT` — unbounded queries can crash the server
- **Do NOT** put auth middleware on discovery routes — these must remain fully public

---

# PROMPT 4.3 — Doctor Discovery & Listing Page UI

## Objective
Build the complete `DoctorListingPage.jsx` — the central patient-facing discovery interface. This page includes a filter sidebar, a doctor card grid, search functionality, a location-based "Nearby" toggle, pagination, loading skeletons, and empty states. This is one of the highest-visibility pages in the entire platform and must feel polished and functional.

## Architecture Reasoning
The listing page is where the marketplace becomes real for patients. Every design decision here affects conversion — whether patients actually click through to doctor profiles and ultimately book. The layout should follow proven marketplace patterns: filters on the left, results on the right, clear sort controls at the top, and doctor cards that communicate enough information to make a browsing decision without requiring a profile click.

URL-based filter state (using query parameters) is used instead of local React state because it allows shareable URLs, supports browser back/forward navigation through filter history, and makes the filter state persistent across page refreshes. This is the correct architecture for any search/filter interface.

## Implementation Scope Boundaries
- Build `pages/public/DoctorListingPage.jsx`
- Build `components/doctor/DoctorCard.jsx`
- Build `components/doctor/FilterSidebar.jsx`
- Build `components/common/Pagination.jsx`
- Build `components/common/SkeletonCard.jsx`
- Implement URL-based filter state using `useSearchParams`
- Implement location detection and nearby toggle
- Do NOT implement booking from this page (Phase 5)
- Do NOT implement AI symptom search here (Phase 8)

## Page Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│  SEARCH BAR (full width)                                │
│  [🔍 Search doctors, specializations...]  [📍 Near Me] │
├───────────────┬─────────────────────────────────────────┤
│               │  Sort: [Rating ▾]   12 doctors found    │
│  FILTER       │─────────────────────────────────────────│
│  SIDEBAR      │  ┌──────┐ ┌──────┐ ┌──────┐            │
│               │  │ Card │ │ Card │ │ Card │            │
│  Specializ.   │  └──────┘ └──────┘ └──────┘            │
│  Fee Range    │  ┌──────┐ ┌──────┐ ┌──────┐            │
│  Min Rating   │  │ Card │ │ Card │ │ Card │            │
│  Experience   │  └──────┘ └──────┘ └──────┘            │
│               │─────────────────────────────────────────│
│  [Apply]      │  ← Prev  Page 1 of 3  Next →           │
└───────────────┴─────────────────────────────────────────┘
```

## URL-Based Filter State

```javascript
// Use React Router's useSearchParams for all filter state
const [searchParams, setSearchParams] = useSearchParams()

// Read current filter values from URL
const currentFilters = {
  specialization: searchParams.get('specialization') || '',
  minFee: searchParams.get('minFee') || '',
  maxFee: searchParams.get('maxFee') || '',
  minRating: searchParams.get('minRating') || '',
  sortBy: searchParams.get('sortBy') || 'rating',
  page: Number(searchParams.get('page')) || 1,
  search: searchParams.get('q') || '',
  nearby: searchParams.get('nearby') === 'true',
}

// Update filters by merging with current params
const updateFilter = (key, value) => {
  const params = new URLSearchParams(searchParams)
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
  params.set('page', '1')   // Reset to page 1 on any filter change
  setSearchParams(params)
}
```

## Data Fetching Strategy

```javascript
// useEffect triggers on any searchParams change
useEffect(() => {
  fetchDoctors()
}, [searchParams])

const fetchDoctors = async () => {
  setLoading(true)
  try {
    let result

    if (currentFilters.nearby && userLocation) {
      result = await getNearbyDoctorsAPI({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        ...currentFilters
      })
    } else if (currentFilters.search) {
      result = await searchDoctorsAPI({
        q: currentFilters.search,
        ...currentFilters
      })
    } else {
      result = await getDiscoveryListingAPI(currentFilters)
    }

    setDoctors(result.data.doctors)
    setPagination({
      total: result.data.total,
      page: result.data.page,
      totalPages: result.data.totalPages
    })
  } catch (err) {
    setError('Failed to load doctors. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

## Location Detection Logic

```javascript
const [userLocation, setUserLocation] = useState(null)
const [locationLoading, setLocationLoading] = useState(false)
const [locationError, setLocationError] = useState(null)

const requestUserLocation = () => {
  if (!navigator.geolocation) {
    setLocationError('Geolocation is not supported by your browser')
    return
  }

  setLocationLoading(true)
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      updateFilter('nearby', 'true')
      setLocationLoading(false)
    },
    (error) => {
      const messages = {
        1: 'Location access denied. Please enable location in browser settings.',
        2: 'Location unavailable. Please try again.',
        3: 'Location request timed out.'
      }
      setLocationError(messages[error.code] || 'Could not get location')
      setLocationLoading(false)
    },
    { timeout: 10000, maximumAge: 300000 }   // 5 min cache
  )
}
```

## `DoctorCard.jsx` — Complete Specification

```
Visual structure of each card:

┌────────────────────────────────────┐
│  [Avatar]  Dr. Name                │
│            ★ 4.8 (23 reviews)     │
│            Sports Physiotherapy    │
├────────────────────────────────────┤
│  📍 2.3 km away  |  🏥 Clinic Name │
│  💼 8 years exp  |  💰 ₹800/session│
├────────────────────────────────────┤
│  [Tag] [Tag] [Tag]                 │
│              [View Profile →]      │
└────────────────────────────────────┘

Props:
  doctor: {
    _id, user: { name, profileImage },
    specialization, experience, consultationFee,
    rating, reviewCount, clinicName, clinicAddress,
    distanceKm (optional — only present in nearby results),
    qualifications
  }

Behaviors:
- Entire card is clickable → navigates to /doctors/:id
- Rating displays as filled/half/empty stars
- distanceKm shown only if present in data
- qualifications shown as pills (max 3, then "+N more")
- Verified badge (green checkmark) always visible
- Hover state: subtle shadow elevation increase
```

```jsx
// components/doctor/DoctorCard.jsx

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/doctors/${doctor._id}`)}
      className="bg-white rounded-xl shadow-card hover:shadow-elevated
                 transition-shadow duration-200 cursor-pointer p-5
                 border border-gray-100 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <img
          src={doctor.profileImage || doctor.user?.profileImage || '/default-avatar.png'}
          alt={doctor.user?.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              Dr. {doctor.user?.name}
            </h3>
            <VerifiedBadge />
          </div>
          <StarRating rating={doctor.rating} count={doctor.reviewCount} />
          <p className="text-sm text-primary font-medium mt-0.5">
            {doctor.specialization}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        {doctor.distanceKm && (
          <span>📍 {doctor.distanceKm} km away</span>
        )}
        <span>🏥 {doctor.clinicName}</span>
        <span>💼 {doctor.experience} yrs exp</span>
        <span>💰 ₹{doctor.consultationFee}/session</span>
      </div>

      {/* Tags */}
      {doctor.qualifications?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doctor.qualifications.slice(0, 3).map(q => (
            <span key={q}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {q}
            </span>
          ))}
          {doctor.qualifications.length > 3 && (
            <span className="text-xs text-gray-400">
              +{doctor.qualifications.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end mt-auto">
        <span className="text-sm text-primary font-medium hover:underline">
          View Profile →
        </span>
      </div>
    </div>
  )
}
```

## `FilterSidebar.jsx` — Complete Specification

```
Sections:

1. Specialization
   - Dropdown or scrollable list of all specializations
   - Each item shows name + doctor count from /api/discover/specializations
   - Selected item highlighted
   - "Clear" link when active

2. Fee Range
   - Two number inputs: Min ₹ and Max ₹
   - Quick preset buttons: "Under ₹500" | "₹500-₹1000" | "₹1000+"

3. Minimum Rating
   - Star-click selector: ★★★★☆ and above
   - Options: 4+, 3+, Any

4. Experience
   - Options: 2+ years, 5+ years, 10+ years, Any
   - Radio button style

5. Buttons:
   - [Apply Filters] — primary button — triggers URL update
   - [Clear All] — text button — resets all params
```

## Loading Skeleton

```jsx
// components/common/SkeletonCard.jsx
// Shown when loading === true, render 6-12 of these

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-14 h-14 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
    </div>
  </div>
)
```

Tailwind's `animate-pulse` creates the pulsing shimmer effect without any additional packages.

## Empty State Component

```jsx
// When no doctors match the filters:
<div className="col-span-3 text-center py-16">
  <div className="text-5xl mb-4">🔍</div>
  <h3 className="text-lg font-semibold text-gray-800 mb-2">
    No doctors found
  </h3>
  <p className="text-gray-500 mb-6">
    Try adjusting your filters or expanding the search radius
  </p>
  <button onClick={clearAllFilters}
    className="text-primary underline text-sm">
    Clear all filters
  </button>
</div>
```

## Reusable `StarRating` Component

```jsx
// components/common/StarRating.jsx
const StarRating = ({ rating, count, showCount = true, size = 'sm' }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full'
    if (i < rating) return 'half'
    return 'empty'
  })

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((type, i) => (
          <StarIcon key={i} type={type} size={size} />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-gray-500">
          {rating > 0 ? `${rating.toFixed(1)} (${count})` : 'No reviews yet'}
        </span>
      )}
    </div>
  )
}
```

Build this component now — it reappears on the doctor profile page, review cards, and admin listings in Phases 5, 7, and 9.

## Pagination Component

```jsx
// components/common/Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40"
      >
        ← Previous
      </button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  )
}
```

## API Functions Required

```javascript
// api/discovery.api.js

export const getDiscoveryListingAPI = (params) =>
  axiosInstance.get('/discover', { params })

export const getNearbyDoctorsAPI = (params) =>
  axiosInstance.get('/discover/nearby', { params })

export const searchDoctorsAPI = (params) =>
  axiosInstance.get('/discover/search', { params })

export const getFeaturedDoctorsAPI = () =>
  axiosInstance.get('/discover/featured')

export const getSpecializationsAPI = () =>
  axiosInstance.get('/discover/specializations')

export const getDoctorPublicProfileAPI = (id) =>
  axiosInstance.get(`/discover/${id}`)
```

## Validation Checkpoints
- [ ] Page loads and shows doctor cards from API
- [ ] Selecting a specialization filter updates URL and re-fetches
- [ ] Clearing filters returns to full listing
- [ ] "Near Me" button triggers location permission prompt
- [ ] After granting location, nearby results appear with distance badges
- [ ] Denying location shows readable error message, not a crash
- [ ] Skeleton cards appear during loading state
- [ ] Empty state appears when no filters match
- [ ] Pagination controls appear when totalPages > 1
- [ ] Clicking a doctor card navigates to `/doctors/:id`
- [ ] Browser back button after navigating to a profile returns to listing with filters intact
- [ ] URL reflects current filter state (copy-paste URL works)

## Common Mistakes to Avoid
- **Do NOT** store filter state in `useState` — use `useSearchParams` so filters persist in the URL
- **Do NOT** call the API inside the filter change handler — let `useEffect` watching `searchParams` handle it
- **Do NOT** forget to reset `page` to 1 when any filter changes — otherwise users see page 3 of a filtered result with only 1 page
- **Do NOT** render `DoctorCard` without a null check on `doctor.user` — populate may occasionally fail

---

# PROMPT 4.4 — Doctor Public Profile Page UI

## Objective
Build the complete `DoctorProfilePage.jsx` — the full doctor detail page that patients visit before deciding to book. This page must communicate trust, professionalism, and competence while making the path to booking obvious. After this prompt, patients can view a doctor's complete profile with all relevant details.

## Architecture Reasoning
The doctor profile page is the final conversion point before a booking decision. Every element must serve the goal of building enough patient confidence to click "Book Appointment." The layout should follow the information hierarchy patients use to evaluate a healthcare provider: identity and credibility first, then logistics (location, fees, availability), then social proof (reviews, ratings), then action (booking CTA).

The booking CTA on this page will be a placeholder button in Phase 4 — it becomes functional in Phase 5 when the availability and booking system is built.

## Implementation Scope Boundaries
- Build `pages/public/DoctorProfilePage.jsx`
- Fetch and display complete doctor profile data
- Display uploaded documents (links only — no viewer)
- Show reviews section (empty placeholder — Phase 7 will populate)
- Render a "Book Appointment" button (visible but non-functional — Phase 5)
- Do NOT implement booking modal here

## Page Layout Specification

```
┌────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                  │
│  [Large Avatar]  Dr. Full Name            ✓ Verified          │
│                  Sports Physiotherapy                          │
│                  ★★★★☆ 4.8 · 23 reviews                     │
│                  8 years experience · ₹800/session            │
│                                [Book Appointment →]           │
├───────────────────────────────┬────────────────────────────────┤
│  ABOUT                        │  CLINIC INFORMATION           │
│  Bio text paragraph           │  📍 Clinic Name               │
│                               │  Full Address                 │
│  QUALIFICATIONS               │  [View on Map link]           │
│  BPT · MPT · MIAP             │                               │
│                               │  LANGUAGES                    │
│  SPECIALIZATION               │  English · Hindi              │
│  Tag chip                     │                               │
│                               │  CONSULTATION FEE             │
│  AI SUMMARY (Phase 8)         │  ₹800 per session             │
│  placeholder for now          │                               │
├───────────────────────────────┴────────────────────────────────┤
│  PATIENT REVIEWS (Phase 7 placeholder)                        │
│  "No reviews yet" empty state                                 │
├────────────────────────────────────────────────────────────────┤
│  STICKY BOTTOM BAR (mobile-friendly)                          │
│  ₹800/session          [Book Appointment →]                   │
└────────────────────────────────────────────────────────────────┘
```

## Data Loading Pattern

```javascript
const { id } = useParams()
const [profile, setProfile] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getDoctorPublicProfileAPI(id)
      setProfile(res.data.profile)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Doctor not found')
      } else {
        setError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }
  fetchProfile()
}, [id])

// Loading state: full-page skeleton
// Error state: centered error message with "Go back" button
// 404 state: "This doctor profile is not available"
```

## Trust Indicators Section

```jsx
// Row of trust signal chips below the doctor name:
<div className="flex flex-wrap gap-2 mt-3">
  <TrustChip icon="✓" label="Verified by PhysioConnect" color="green" />
  <TrustChip icon="📋" label={`${profile.experience} Years Experience`} />
  <TrustChip icon="👥" label={`${profile.reviewCount} Patient Reviews`} />
  <TrustChip icon="💬"
    label={`Speaks ${profile.languages.join(', ')}`} />
</div>
```

## Book Appointment CTA Behavior (Phase 4)

```jsx
// In Phase 4: show button but display a message on click
const { isAuthenticated, user } = useAuthStore()

const handleBookClick = () => {
  if (!isAuthenticated) {
    toast.error('Please log in to book an appointment')
    navigate('/login', { state: { from: `/doctors/${id}` } })
    return
  }
  if (user?.role !== 'patient') {
    toast.error('Only patients can book appointments')
    return
  }
  // Phase 5 will replace this with booking modal:
  toast.info('Booking system coming soon')
}
```

The `state: { from: ... }` pattern allows the login page to redirect back to the profile after authentication — implement this in `LoginPage.jsx` as well:

```javascript
// In LoginPage after successful login:
const location = useLocation()
const from = location.state?.from || dashboardRoutes[user.role]
navigate(from, { replace: true })
```

## Verification Documents Display (Admin/Doctor Only)

```jsx
// Only show documents section to the doctor themselves or admin
{(user?.role === 'admin' || user?.id === profile?.user?._id) && (
  <div className="mt-6">
    <h3 className="font-semibold mb-3">Verification Documents</h3>
    <div className="flex gap-3 flex-wrap">
      {profile.verificationDocuments?.map((url, i) => (
        
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary
                     border border-primary rounded-lg px-3 py-2 hover:bg-primary/5"
        >
          📄 Document {i + 1} →
        </a>
      ))}
    </div>
  </div>
)}
```

## `VerifiedBadge` Component

```jsx
// components/common/VerifiedBadge.jsx
const VerifiedBadge = ({ size = 'sm' }) => (
  <span className={`
    inline-flex items-center gap-1 bg-green-50 text-green-700
    border border-green-200 rounded-full font-medium
    ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
  `}>
    ✓ Verified
  </span>
)
```

## "View on Map" Link

```jsx
// Generate a Google Maps link from clinic address
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${
  encodeURIComponent(profile.clinicAddress)
}`

<a href={mapsUrl} target="_blank" rel="noopener noreferrer"
   className="text-sm text-primary underline">
  View on Google Maps →
</a>
```

## Reviews Placeholder Section

```jsx
// Phase 7 will replace this with real reviews
<div className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Patient Reviews</h2>
  {profile.reviewCount === 0 ? (
    <div className="bg-gray-50 rounded-xl p-8 text-center">
      <p className="text-gray-500">No reviews yet.</p>
      <p className="text-sm text-gray-400 mt-1">
        Be the first to share your experience!
      </p>
    </div>
  ) : (
    <div className="text-gray-500 text-sm">
      Reviews will appear here after appointments are completed.
    </div>
  )}
</div>
```

## Validation Checkpoints
- [ ] Profile page loads correctly with all doctor data
- [ ] Profile image renders (or shows default avatar if null)
- [ ] Star rating displays correctly for decimal values (4.8 shows 4 full + partial star)
- [ ] "Book Appointment" while logged out → redirects to login → returns to profile after login
- [ ] "Book Appointment" as doctor or admin → shows appropriate error toast
- [ ] Verification documents visible only to admin or the doctor themselves
- [ ] "View on Google Maps" link opens correctly
- [ ] Navigating to a non-existent doctor ID → shows "not found" error state
- [ ] Loading skeleton shows during API fetch

## Common Mistakes to Avoid
- **Do NOT** show the "Book Appointment" button only to logged-in patients — show it to all users, handle the auth check on click (better for conversion)
- **Do NOT** render documents section to all users — it contains sensitive credential files
- **Do NOT** crash if `doctor.user` is null — always use optional chaining `doctor.user?.name`

---

# PROMPT 4.5 — Demo Data Seeding for Discovery

## Objective
Create a comprehensive seed script that populates the database with realistic doctor profiles, enabling meaningful testing of all discovery features: filtering, proximity search, specialization grouping, and rating-based sorting. Without good seed data, the platform looks empty and unimpressive during demos.

## Architecture Reasoning
Demo data quality directly affects demo quality. An empty platform — even with perfect architecture — fails to impress. Seed data should feel realistic: real-sounding names, credible specializations, varied fee ranges, meaningful bios, and geographically distributed coordinates around a real city (Pune or Mumbai for this India-focused MVP).

The seed script must be idempotent — running it multiple times should not duplicate data.

## Implementation Scope Boundaries
- Create `config/seeds/doctorSeed.js`
- Seed 10–15 realistic doctor profiles with varied attributes
- Use Pune coordinates with realistic geographic distribution
- Create corresponding User accounts for each doctor
- Set all seeded doctors as `verified` so they appear immediately in listings
- Do NOT seed appointments, bookings, or reviews yet (Phases 5–7)

## Seed Data Specification

```javascript
// 15 doctors across different specializations
// Coordinate range for Pune: lat 18.45–18.60, lng 73.80–73.95

const doctorSeeds = [
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya.sharma@demo.com',
      password: 'Doctor@123',
      role: 'doctor'
    },
    profile: {
      specialization: 'Sports Physiotherapy',
      experience: 8,
      consultationFee: 800,
      bio: 'Specialized in sports injury rehabilitation with extensive experience treating professional athletes...',
      qualifications: ['BPT', 'MPT - Sports Medicine', 'CSCS'],
      clinicName: 'ActiveCare Physiotherapy',
      clinicAddress: 'Koregaon Park, Pune, Maharashtra 411001',
      languages: ['English', 'Hindi', 'Marathi'],
      location: { type: 'Point', coordinates: [73.8935, 18.5362] },
      verificationStatus: 'verified',
      rating: 4.8,
      reviewCount: 23
    }
  },
  // ... 14 more doctors with varied:
  // specializations (cover all enum values)
  // experience (2 to 20 years)
  // fees (₹300 to ₹2000)
  // ratings (3.5 to 5.0)
  // reviewCounts (0 to 50)
  // coordinates (spread across Pune)
]
```

## Seed Script Pattern

```javascript
// config/seeds/doctorSeed.js

export const seedDoctors = async () => {
  const existingCount = await DoctorProfile.countDocuments()
  if (existingCount >= 10) {
    logger.info('Doctors already seeded — skipping')
    return
  }

  for (const seed of doctorSeeds) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: seed.user.email })
    if (existingUser) continue

    // Create user
    const user = await User.create(seed.user)

    // Create profile
    await DoctorProfile.create({
      ...seed.profile,
      user: user._id
    })
  }

  logger.info(`Seeded ${doctorSeeds.length} doctor profiles`)
}
```

Call `seedDoctors()` inside `connectDB()` after `seedAdmin()`.

## Coordinate Distribution Strategy

```
Spread doctors across distinct Pune areas:
- Koregaon Park area: [73.8935, 18.5362]
- Baner area: [73.7898, 18.5590]
- Kothrud area: [73.8087, 18.5074]
- Viman Nagar area: [73.9167, 18.5679]
- Hadapsar area: [73.9343, 18.5089]
- Wakad area: [73.7613, 18.5986]
- Aundh area: [73.8077, 18.5586]
- Pune Camp area: [73.8777, 18.5176]
- Deccan area: [73.8476, 18.5089]
- Hinjewadi area: [73.7375, 18.5914]

This spread ensures proximity search returns
different result sets based on user location.
```

## Validation Checkpoints
- [ ] Running seed script twice does not duplicate doctors
- [ ] `GET /api/discover` returns 12+ doctors after seeding
- [ ] `GET /api/discover/specializations` shows counts > 0 for multiple specializations
- [ ] `GET /api/discover/nearby?latitude=18.53&longitude=73.85` returns doctors sorted by distance
- [ ] `GET /api/discover/featured` returns 6 top-rated doctors
- [ ] Filter by specialization returns correct subset
- [ ] Fee range filter works correctly across seeded fee range

## Common Mistakes to Avoid
- **Do NOT** hardcode the same coordinates for all doctors — proximity search becomes meaningless
- **Do NOT** seed all doctors with rating: 0 — the featured section requires reviewCount >= 1
- **Do NOT** forget to hash passwords — the `pre('save')` hook handles this automatically if using `User.create()`
- **Do NOT** skip the idempotency check — re-running the seed on Render restart would duplicate all profiles

---

## Phase 4 Completion Gate

Before moving to Phase 5, ALL of the following must be true:

```
✅ Discovery service implements all query functions
✅ GET /api/discover returns paginated verified doctors
✅ GET /api/discover?specialization=... filters correctly
✅ GET /api/discover?minFee=&maxFee= fee range filters work
✅ GET /api/discover/nearby returns distance-sorted results
✅ GET /api/discover/search?q= returns name and specialization matches
✅ GET /api/discover/featured returns top 6 rated doctors
✅ GET /api/discover/specializations returns all specializations with counts
✅ DoctorListingPage renders doctor cards from API
✅ Filter sidebar updates URL and re-fetches without page reload
✅ Near Me toggle requests location and switches to proximity results
✅ Distance badge appears on cards in nearby mode
✅ Loading skeletons render during fetch
✅ Empty state renders when no results match
✅ DoctorProfilePage loads and displays full profile
✅ Book Appointment button redirects to login if unauthenticated
✅ Post-login redirect returns to doctor profile page
✅ StarRating component renders correctly for all values
✅ VerifiedBadge component renders on all doctor cards and profiles
✅ StatusBadge component available for reuse
✅ Pagination component works correctly
✅ 10+ seeded doctors visible in production listing
✅ Deployed — discovery flow works end-to-end on Vercel/Render
```

**Phase 4 unlocks Phase 5 (Availability & Booking) because:**
- Doctor profiles exist and are publicly discoverable
- The doctor profile page has a "Book Appointment" CTA ready for activation
- The post-login redirect pattern is implemented
- Patient, doctor, and admin roles are all functional
- The `DoctorProfilePage` is the natural entry point for the booking flow
- Seeded doctors provide realistic data for booking and availability testing

---

Say **"generate Phase 5 prompts"** when ready.