# PhysioConnect — Phase 9 Complete Prompt Set
## Admin Dashboard, Analytics & Platform Operations

---

# PROMPT 9.1 — Analytics Aggregation Service Layer

## Objective
Implement `services/analytics.service.js` — a dedicated service that performs all MongoDB aggregation queries required by the admin dashboard. This service is the data backbone of the entire admin experience. Every metric card, chart, and table in the admin dashboard sources its data from functions defined here.

## Architecture Reasoning
Analytics aggregations are architecturally distinct from CRUD operations. Where CRUD operations deal with single documents or simple filtered lists, analytics operations involve multi-stage aggregation pipelines, cross-collection joins, date-range grouping, and computed metrics. Mixing these into existing service files (`doctor.service.js`, `booking.service.js`) would make those files unreadable and the aggregation logic harder to maintain.

A dedicated `analytics.service.js` treats platform analytics as a first-class concern. This also makes the service independently cacheable in future iterations — the entire analytics service output could be Redis-cached for 5 minutes without touching any other service.

All aggregations run server-side in MongoDB's aggregation pipeline rather than fetching raw documents and computing in Node.js. This is both faster and more correct — MongoDB handles billions of records; Node.js is not the right place to sum financial data.

## Implementation Scope Boundaries
- Create `server/src/services/analytics.service.js` completely
- Reference all existing models: `User`, `DoctorProfile`, `Appointment`, `Payment`, `Review`
- Do NOT implement controllers or routes yet (Prompt 9.2)
- Do NOT implement frontend components yet (Prompt 9.3+)
- All functions must handle empty collections gracefully (return zeros, not errors)

## Complete Function Specifications

---

### `getPlatformOverview()`

```
Purpose: The top-level dashboard metrics — the numbers that appear in
the 4 hero metric cards at the top of the admin dashboard.

Returns:
{
  totalUsers: Number,          // All registered users
  totalPatients: Number,       // Users with role 'patient'
  totalDoctors: Number,        // Users with role 'doctor'
  verifiedDoctors: Number,     // DoctorProfiles with status 'verified'
  pendingVerification: Number, // DoctorProfiles with status 'pending'
  totalAppointments: Number,   // All Appointment documents
  completedAppointments: Number,
  cancelledAppointments: Number,
  totalRevenue: Number,        // Sum of all Payment.amount where status 'paid'
  totalCommission: Number,     // Sum of all Payment.platformCommission where status 'paid'
  totalDoctorEarnings: Number, // Sum of all Payment.doctorEarnings where status 'paid'
  totalReviews: Number,        // All Review documents
  averagePlatformRating: Number // Average of all Review.rating values
}

Implementation:
Run these queries in parallel using Promise.all() for performance:

const [
  userStats,
  doctorStats,
  appointmentStats,
  revenueStats,
  reviewStats
] = await Promise.all([
  User.aggregate([
    { $group: {
      _id: '$role',
      count: { $sum: 1 }
    }}
  ]),
  DoctorProfile.aggregate([
    { $group: {
      _id: '$verificationStatus',
      count: { $sum: 1 }
    }}
  ]),
  Appointment.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]),
  Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: {
      _id: null,
      totalRevenue: { $sum: '$amount' },
      totalCommission: { $sum: '$platformCommission' },
      totalDoctorEarnings: { $sum: '$doctorEarnings' }
    }}
  ]),
  Review.aggregate([
    { $group: {
      _id: null,
      totalReviews: { $sum: 1 },
      averageRating: { $avg: '$rating' }
    }}
  ])
])

Then map the array results into the clean flat object above.
For missing groups (e.g. no cancelled appointments yet), default to 0.
```

---

### `getRevenueTimeSeries({ period, startDate, endDate })`

```
Purpose: Revenue data grouped by time period for the revenue trend chart.
Used by: Revenue chart on admin dashboard.

Parameters:
  period: 'daily' | 'weekly' | 'monthly'
  startDate: ISO date string (default: 30 days ago)
  endDate: ISO date string (default: today)

Returns:
[
  { date: '2025-05-01', revenue: 4800, commission: 480, appointments: 6 },
  { date: '2025-05-02', revenue: 2400, commission: 240, appointments: 3 },
  ...
]

Implementation:

const groupByFormat = {
  daily:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  weekly:  { $dateToString: { format: '%Y-W%V',   date: '$createdAt' } },
  monthly: { $dateToString: { format: '%Y-%m',    date: '$createdAt' } }
}

return Payment.aggregate([
  {
    $match: {
      status: 'paid',
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
  },
  {
    $group: {
      _id: groupByFormat[period],
      revenue: { $sum: '$amount' },
      commission: { $sum: '$platformCommission' },
      appointments: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      date: '$_id',
      revenue: 1,
      commission: 1,
      appointments: 1
    }
  }
])

Important: If no data exists for a date range, return [] — never throw.
```

---

### `getAppointmentStatusBreakdown()`

```
Purpose: Appointment count by status — used for the donut/pie chart.

Returns:
[
  { status: 'confirmed',  count: 45, percentage: 37.5 },
  { status: 'completed',  count: 60, percentage: 50.0 },
  { status: 'cancelled',  count: 10, percentage: 8.3  },
  { status: 'pending',    count:  5, percentage: 4.2  }
]

Implementation:
1. Aggregate appointment counts by status
2. Calculate total
3. Add percentage to each result: (count / total * 100).toFixed(1)
4. If no appointments: return array with all statuses at count 0
```

---

### `getTopDoctors({ limit, metric })`

```
Purpose: Ranking table of top-performing doctors on the admin dashboard.

Parameters:
  limit: number (default 10)
  metric: 'earnings' | 'appointments' | 'rating'

Returns:
[
  {
    doctorId, doctorName, profileImage,
    specialization, totalAppointments,
    totalEarnings, averageRating, reviewCount
  }
]

Implementation for metric === 'earnings':

DoctorProfile.aggregate([
  { $match: { verificationStatus: 'verified' } },
  {
    $lookup: {
      from: 'payments',
      localField: '_id',
      foreignField: 'doctor',
      as: 'payments'
    }
  },
  {
    $lookup: {
      from: 'appointments',
      localField: '_id',
      foreignField: 'doctor',
      as: 'appointments'
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userDetails'
    }
  },
  {
    $addFields: {
      totalEarnings: {
        $sum: {
          $map: {
            input: { $filter: {
              input: '$payments',
              cond: { $eq: ['$$this.status', 'paid'] }
            }},
            in: '$$this.doctorEarnings'
          }
        }
      },
      totalAppointments: { $size: '$appointments' },
      doctorName: { $arrayElemAt: ['$userDetails.name', 0] },
      profileImage: { $arrayElemAt: ['$userDetails.profileImage', 0] }
    }
  },
  { $sort: { totalEarnings: -1 } },
  { $limit: limit },
  {
    $project: {
      doctorId: '$_id',
      doctorName: 1,
      profileImage: 1,
      specialization: 1,
      totalAppointments: 1,
      totalEarnings: 1,
      averageRating: '$rating',
      reviewCount: 1,
      _id: 0
    }
  }
])

For metric === 'appointments': sort by totalAppointments
For metric === 'rating': sort by averageRating
```

---

### `getSpecializationBreakdown()`

```
Purpose: How appointments and revenue are distributed across specializations.
Used for the specialization analytics table.

Returns:
[
  {
    specialization: 'Sports Physiotherapy',
    doctorCount: 3,
    appointmentCount: 28,
    totalRevenue: 22400,
    averageFee: 800
  },
  ...
]

Implementation:
Appointment.aggregate([
  { $match: { status: { $in: ['confirmed', 'completed'] } } },
  {
    $lookup: {
      from: 'doctorprofiles',
      localField: 'doctor',
      foreignField: '_id',
      as: 'doctorProfile'
    }
  },
  { $unwind: '$doctorProfile' },
  {
    $group: {
      _id: '$doctorProfile.specialization',
      appointmentCount: { $sum: 1 },
      totalRevenue: { $sum: '$consultationFee' },
      averageFee: { $avg: '$consultationFee' }
    }
  },
  { $sort: { appointmentCount: -1 } },
  {
    $project: {
      _id: 0,
      specialization: '$_id',
      appointmentCount: 1,
      totalRevenue: 1,
      averageFee: { $round: ['$averageFee', 0] }
    }
  }
])
```

---

### `getUserGrowthTimeSeries({ period })`

```
Purpose: New user registrations over time.
Used by: User growth chart on admin dashboard.

Returns:
[
  { date: '2025-05-01', patients: 4, doctors: 2, total: 6 },
  ...
]

Implementation:
User.aggregate([
  {
    $group: {
      _id: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        role: '$role'
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.date': 1 } }
])

Then reshape in JavaScript:
Group by date, pivot role counts into { patients, doctors } keys.
```

---

### `getRecentActivity({ limit })`

```
Purpose: Recent platform activity feed for the admin dashboard.
Returns the most recent appointments, registrations, and payments.

Returns:
[
  {
    type: 'appointment' | 'registration' | 'payment' | 'review',
    message: 'New appointment booked by Rahul Sharma with Dr. Priya',
    timestamp: Date,
    metadata: {}
  }
]

Implementation:
Run 4 queries in parallel, each fetching the last `limit` records.
Merge arrays, sort all by timestamp descending, take top `limit`.

Appointment.find().sort({ createdAt: -1 }).limit(limit)
  .populate('patient', 'name').populate('doctor')  → then .populate nested user
  → message: `Appointment booked by ${patient.name}`

User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(limit)
  → message: `New ${role} registered: ${name}`

Payment.find({ status: 'paid' }).sort({ createdAt: -1 }).limit(limit)
  → message: `Payment of ₹${amount} received`

Review.find().sort({ createdAt: -1 }).limit(limit)
  .populate('patient', 'name')
  → message: `Review submitted by ${patient.name} — ${rating}★`

Merge and sort by createdAt descending, return top limit.
```

## Validation Checkpoints
- [ ] `getPlatformOverview()` returns all keys with numbers — no undefined values
- [ ] `getPlatformOverview()` returns zeros on empty collections, not errors
- [ ] `getRevenueTimeSeries({ period: 'daily' })` returns correctly formatted date strings
- [ ] `getTopDoctors({ limit: 5, metric: 'earnings' })` returns 5 records sorted by earnings
- [ ] `getSpecializationBreakdown()` returns all active specializations
- [ ] All functions use `Promise.all()` where multiple independent queries run
- [ ] `getRecentActivity()` returns merged and sorted events from all collections
- [ ] No function throws when collections are empty

## Common Mistakes to Avoid
- **Do NOT** fetch all documents and compute sums in JavaScript — use MongoDB `$sum` in aggregation pipelines
- **Do NOT** run independent aggregations sequentially — use `Promise.all()` for parallel execution
- **Do NOT** return raw `_id` fields in analytics responses — always project them out or rename
- **Do NOT** assume aggregation results include all groups — always default missing groups to zero
- **Do NOT** put date range logic in the controller — it belongs in the service with sensible defaults

## Interview Explanation Points
- "I use `Promise.all()` for independent aggregation queries because they have no dependencies on each other. Running them in parallel cuts the `getPlatformOverview()` response time from 200ms (sequential) to roughly 50ms (parallel) — a 4x improvement for the most frequently hit admin endpoint."
- "All financial sums run in MongoDB's aggregation pipeline rather than in Node.js. MongoDB can sum millions of payment records in milliseconds. Node.js looping over fetched documents is both slower and risks running out of memory on large datasets."
- "I separated analytics into its own service file because it's a genuinely different concern from CRUD operations. The aggregation logic is complex enough that mixing it into `booking.service.js` or `payment.service.js` would make those files unmaintainable."

---

# PROMPT 9.2 — Analytics Controller & Admin Routes

## Objective
Implement `controllers/analytics.controller.js` with thin controller functions that call the analytics service, parse date range parameters, and return consistent responses. Configure all analytics routes under the admin prefix with `requireAuth` and `requireRole('admin')` on every endpoint.

## Implementation Scope Boundaries
- Create `controllers/analytics.controller.js`
- Create `routes/analytics.routes.js`
- Mount in `app.js`: `app.use('/api/admin/analytics', analyticsRoutes)`
- All routes protected by `requireAuth + requireRole('admin')`
- Do NOT implement frontend yet

## Complete Route Definitions

```
All routes: requireAuth + requireRole('admin')

GET /api/admin/analytics/overview           → getPlatformOverview
GET /api/admin/analytics/revenue            → getRevenueSeries
GET /api/admin/analytics/appointments       → getAppointmentBreakdown
GET /api/admin/analytics/top-doctors        → getTopDoctors
GET /api/admin/analytics/specializations    → getSpecializationBreakdown
GET /api/admin/analytics/user-growth        → getUserGrowth
GET /api/admin/analytics/recent-activity    → getRecentActivity
```

## Controller Specifications

---

### `getPlatformOverviewController(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const overview = await analyticsService.getPlatformOverview()
  return successResponse(res, 200, 'Platform overview retrieved', overview)
})
```

---

### `getRevenueSeriesController(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const {
    period = 'daily',
    startDate,
    endDate
  } = req.query

  // Validate period
  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    throw new AppError('period must be daily, weekly, or monthly', 400)
  }

  // Default date range: last 30 days
  const end = endDate ? new Date(endDate) : new Date()
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Validate date range
  if (start > end) {
    throw new AppError('startDate must be before endDate', 400)
  }

  const data = await analyticsService.getRevenueTimeSeries({
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString()
  })

  return successResponse(res, 200, 'Revenue series retrieved', {
    series: data,
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString()
  })
})
```

---

### `getTopDoctorsController(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const {
    limit = 10,
    metric = 'earnings'
  } = req.query

  if (!['earnings', 'appointments', 'rating'].includes(metric)) {
    throw new AppError('metric must be earnings, appointments, or rating', 400)
  }

  const doctors = await analyticsService.getTopDoctors({
    limit: Math.min(Number(limit), 20),
    metric
  })

  return successResponse(res, 200, 'Top doctors retrieved', { doctors, metric })
})
```

---

### `getRecentActivityController(req, res)`

```javascript
asyncHandler(async (req, res) => {
  const { limit = 15 } = req.query
  const activity = await analyticsService.getRecentActivity({
    limit: Math.min(Number(limit), 50)
  })
  return successResponse(res, 200, 'Recent activity retrieved', { activity })
})
```

### Remaining Controllers (same thin pattern):
- `getAppointmentBreakdownController` → calls `getAppointmentStatusBreakdown()`
- `getSpecializationBreakdownController` → calls `getSpecializationBreakdown()`
- `getUserGrowthController` → calls `getUserGrowthTimeSeries({ period: req.query.period })`

## Route File Structure

```javascript
// routes/analytics.routes.js

import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import * as analyticsController from '../controllers/analytics.controller.js'

const router = express.Router()

// Apply auth to all routes at router level
router.use(requireAuth, requireRole('admin'))

router.get('/overview',        analyticsController.getPlatformOverviewController)
router.get('/revenue',         analyticsController.getRevenueSeriesController)
router.get('/appointments',    analyticsController.getAppointmentBreakdownController)
router.get('/top-doctors',     analyticsController.getTopDoctorsController)
router.get('/specializations', analyticsController.getSpecializationBreakdownController)
router.get('/user-growth',     analyticsController.getUserGrowthController)
router.get('/recent-activity', analyticsController.getRecentActivityController)

export default router
```

Applying `router.use(requireAuth, requireRole('admin'))` at the router level rather than on each individual route is cleaner for route files where all routes share the same middleware — and prevents the common mistake of accidentally forgetting auth on one route.

## Validation Checkpoints
- [ ] `GET /api/admin/analytics/overview` returns all platform metrics
- [ ] `GET /api/admin/analytics/revenue?period=daily` returns daily data points
- [ ] `GET /api/admin/analytics/revenue?period=invalid` returns 400
- [ ] `GET /api/admin/analytics/revenue?startDate=2025-01-01&endDate=2024-01-01` returns 400
- [ ] `GET /api/admin/analytics/top-doctors?metric=earnings` returns sorted by earnings
- [ ] All endpoints return 401 without token
- [ ] All endpoints return 403 with patient or doctor token
- [ ] All endpoints return 200 with admin token

## Common Mistakes to Avoid
- **Do NOT** apply `requireAuth + requireRole('admin')` per-route if applying at router level — double application doesn't cause errors but signals unclear thinking
- **Do NOT** forget to validate `period` and `metric` enum values — invalid values produce confusing MongoDB aggregation errors that are hard to debug

---

# PROMPT 9.3 — Admin Dashboard Overview Page UI

## Objective
Build the main `AdminDashboard.jsx` page with the complete metrics overview section: hero metric cards, revenue trend chart, appointment status breakdown chart, and recent activity feed. This is the page admins see when they first log in — it must communicate platform health at a glance.

## Architecture Reasoning
The admin dashboard is an operational tool, not a marketing page. Design decisions should serve clarity and speed of comprehension over aesthetics. Every element must answer a specific operational question. The layout hierarchy reflects information priority:

```
Row 1: Key numbers (revenue, users, doctors, appointments) → instant health check
Row 2: Revenue trend chart + Appointment status chart → pattern recognition
Row 3: Recent activity feed + Top doctors table → operational details
```

Recharts is used for charts because it's already available in the tech stack (listed in the frontend dependencies from Phase 1), it's React-native, and it requires no additional installation.

## Implementation Scope Boundaries
- Build `pages/admin/AdminDashboard.jsx` — complete overview page
- Build `components/admin/MetricCard.jsx` — reusable metric card
- Build `components/admin/RevenueChart.jsx` — line chart
- Build `components/admin/AppointmentDonutChart.jsx` — donut chart
- Build `components/admin/RecentActivityFeed.jsx` — activity list
- Build `components/admin/TopDoctorsTable.jsx` — ranking table
- Add API functions to `api/analytics.api.js`

## API Functions

```javascript
// api/analytics.api.js

import axiosInstance from './axiosInstance'

export const getPlatformOverviewAPI = () =>
  axiosInstance.get('/admin/analytics/overview')

export const getRevenueSeriesAPI = (params) =>
  axiosInstance.get('/admin/analytics/revenue', { params })

export const getAppointmentBreakdownAPI = () =>
  axiosInstance.get('/admin/analytics/appointments')

export const getTopDoctorsAPI = (params) =>
  axiosInstance.get('/admin/analytics/top-doctors', { params })

export const getSpecializationBreakdownAPI = () =>
  axiosInstance.get('/admin/analytics/specializations')

export const getUserGrowthAPI = (params) =>
  axiosInstance.get('/admin/analytics/user-growth', { params })

export const getRecentActivityAPI = (params) =>
  axiosInstance.get('/admin/analytics/recent-activity', { params })
```

## Data Loading Pattern

```javascript
// AdminDashboard.jsx — load all sections in parallel

const [overview, setOverview] = useState(null)
const [revenueSeries, setRevenueSeries] = useState([])
const [appointmentBreakdown, setAppointmentBreakdown] = useState([])
const [recentActivity, setRecentActivity] = useState([])
const [topDoctors, setTopDoctors] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const loadDashboard = async () => {
    try {
      const [
        overviewRes,
        revenueRes,
        appointmentRes,
        activityRes,
        topDoctorsRes
      ] = await Promise.all([
        getPlatformOverviewAPI(),
        getRevenueSeriesAPI({ period: 'daily' }),
        getAppointmentBreakdownAPI(),
        getRecentActivityAPI({ limit: 15 }),
        getTopDoctorsAPI({ limit: 5, metric: 'earnings' })
      ])

      setOverview(overviewRes.data.data)
      setRevenueSeries(revenueRes.data.data.series)
      setAppointmentBreakdown(appointmentRes.data.data)
      setRecentActivity(activityRes.data.data.activity)
      setTopDoctors(topDoctorsRes.data.data.doctors)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  loadDashboard()
}, [])
```

Loading all sections in parallel with `Promise.all()` mirrors the backend — the frontend should be as fast as the API allows.

## `MetricCard.jsx` — Reusable Specification

```jsx
// components/admin/MetricCard.jsx

Props:
  title: string
  value: string | number
  subtitle: string (optional — e.g. "from completed appointments")
  icon: string (emoji or lucide icon component)
  trend: { value: number, label: string } (optional — e.g. { value: 12, label: 'vs last month' })
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red' (default: 'blue')
  loading: boolean

Color map for left border accent:
  blue:   border-l-4 border-l-blue-500
  green:  border-l-4 border-l-green-500
  amber:  border-l-4 border-l-amber-500
  purple: border-l-4 border-l-purple-500
  red:    border-l-4 border-l-red-500

Loading state: skeleton pulse replacing value

Visual:
┌──────────────────────────────────┐
│ ┃  💰 Total Revenue              │  ← Left colored border
│ ┃  ₹48,000                       │  ← Large value
│ ┃  from completed appointments   │  ← Subtitle
│ ┃  ↑ 12% vs last month           │  ← Trend (optional)
└──────────────────────────────────┘
```

## Metric Cards Configuration

```javascript
// 8 metric cards in a responsive grid (4 per row on desktop, 2 on tablet, 1 on mobile)

const metricCards = [
  {
    title: 'Total Revenue',
    value: `₹${overview?.totalRevenue?.toLocaleString('en-IN') || 0}`,
    subtitle: 'from paid appointments',
    icon: '💰',
    color: 'green'
  },
  {
    title: 'Platform Commission',
    value: `₹${overview?.totalCommission?.toLocaleString('en-IN') || 0}`,
    subtitle: '10% of total revenue',
    icon: '📊',
    color: 'blue'
  },
  {
    title: 'Total Users',
    value: overview?.totalUsers || 0,
    subtitle: `${overview?.totalPatients || 0} patients · ${overview?.totalDoctors || 0} doctors`,
    icon: '👥',
    color: 'purple'
  },
  {
    title: 'Verified Doctors',
    value: overview?.verifiedDoctors || 0,
    subtitle: `${overview?.pendingVerification || 0} pending review`,
    icon: '🩺',
    color: 'blue'
  },
  {
    title: 'Total Appointments',
    value: overview?.totalAppointments || 0,
    subtitle: `${overview?.completedAppointments || 0} completed`,
    icon: '📅',
    color: 'amber'
  },
  {
    title: 'Cancelled',
    value: overview?.cancelledAppointments || 0,
    subtitle: 'appointments cancelled',
    icon: '❌',
    color: 'red'
  },
  {
    title: 'Total Reviews',
    value: overview?.totalReviews || 0,
    subtitle: `avg ${overview?.averagePlatformRating?.toFixed(1) || '0.0'} platform rating`,
    icon: '⭐',
    color: 'amber'
  },
  {
    title: 'Doctor Earnings',
    value: `₹${overview?.totalDoctorEarnings?.toLocaleString('en-IN') || 0}`,
    subtitle: '90% passed to doctors',
    icon: '💵',
    color: 'green'
  }
]
```

## `RevenueChart.jsx` — Specification

```jsx
// components/admin/RevenueChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

Props:
  data: [{ date, revenue, commission, appointments }]
  period: 'daily' | 'weekly' | 'monthly'

Period selector:
  3 buttons at top right: [Daily] [Weekly] [Monthly]
  Clicking a period calls parent's onPeriodChange(period)
  Parent re-fetches and passes new data

Chart:
  Two lines:
    - Revenue: solid primary blue line
    - Commission: dashed secondary line (thinner)
  X-axis: formatted dates
  Y-axis: ₹ prefix on tick labels
  Tooltip: shows revenue and commission on hover
  Responsive container: full width, height 300px

Custom tooltip:
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-elevated">
        <p className="font-medium text-gray-800 mb-1">{label}</p>
        <p className="text-sm text-primary">Revenue: ₹{payload[0]?.value}</p>
        <p className="text-sm text-gray-500">Commission: ₹{payload[1]?.value}</p>
      </div>
    )
  }
```

## `AppointmentDonutChart.jsx` — Specification

```jsx
// components/admin/AppointmentDonutChart.jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

Props:
  data: [{ status, count, percentage }]

Color map:
  confirmed:  '#3B82F6'   // blue
  completed:  '#10B981'   // green
  cancelled:  '#EF4444'   // red
  pending:    '#F59E0B'   // amber

Chart:
  Donut (innerRadius=60, outerRadius=90)
  Center label: total appointments count
  Legend below chart with status names and counts
  Tooltip shows count and percentage on hover

Center label (custom):
  Render as absolute positioned div inside the chart wrapper
  "Total\n{totalCount}\nappts"
```

## `RecentActivityFeed.jsx` — Specification

```jsx
// components/admin/RecentActivityFeed.jsx

Props:
  activity: [{ type, message, timestamp, metadata }]

Visual:
  Scrollable list, max height 400px, overflow-y-auto

Each item:
┌─────────────────────────────────────────────┐
│  [icon]  message text               time ago │
└─────────────────────────────────────────────┘

Icon by type:
  appointment: 📅
  registration: 👤
  payment: 💳
  review: ⭐

Time format: relative time using a simple utility:
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

Empty state:
  "No recent activity. Platform activity will appear here."
```

## `TopDoctorsTable.jsx` — Specification

```jsx
// components/admin/TopDoctorsTable.jsx

Props:
  doctors: [{ doctorId, doctorName, profileImage, specialization,
              totalAppointments, totalEarnings, averageRating, reviewCount }]
  metric: current sort metric
  onMetricChange: (metric) => void

Header:
  "Top Doctors" title
  Sort toggle: [By Earnings] [By Appointments] [By Rating]
  Clicking triggers parent re-fetch with new metric

Table columns:
  Rank | Doctor | Specialization | Appointments | Earnings | Rating

Rank: 1–N with medal emoji for top 3: 🥇 🥈 🥉

Doctor column:
  Avatar + name side by side

Earnings: formatted as ₹X,XXX

Rating: StarRating component at size 'xs' + count

Empty state: "No doctor data available yet"

Row hover: subtle background highlight
```

## Complete Dashboard Layout

```jsx
// AdminDashboard.jsx layout:

return (
  <div className="space-y-6">

    {/* Page header */}
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
      <p className="text-gray-500 text-sm mt-1">
        Last updated: {new Date().toLocaleString('en-IN')}
      </p>
    </div>

    {/* Metric cards grid — 4 columns desktop */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map(card => (
        <MetricCard key={card.title} {...card} loading={loading} />
      ))}
    </div>

    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue Trend</h2>
        <RevenueChart
          data={revenueSeries}
          period={revenuePeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Appointments</h2>
        <AppointmentDonutChart data={appointmentBreakdown} />
      </div>
    </div>

    {/* Bottom row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Top Doctors</h2>
        <TopDoctorsTable
          doctors={topDoctors}
          metric={topDoctorMetric}
          onMetricChange={handleTopDoctorMetricChange}
        />
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <RecentActivityFeed activity={recentActivity} />
      </div>
    </div>

  </div>
)
```

## Validation Checkpoints
- [ ] All 8 metric cards render with correct values from API
- [ ] MetricCard shows skeleton while loading
- [ ] Revenue chart renders with two lines
- [ ] Period toggle (Daily/Weekly/Monthly) re-fetches and re-renders chart
- [ ] Donut chart renders with correct colors per status
- [ ] Donut chart center shows total appointment count
- [ ] Top doctors table ranks correctly by selected metric
- [ ] Metric toggle on top doctors table re-fetches with new metric
- [ ] Recent activity feed shows relative timestamps
- [ ] All sections load in parallel — no sequential waterfall
- [ ] Revenue formatted with Indian number system (`₹48,000` not `₹48000`)

## Common Mistakes to Avoid
- **Do NOT** use `toLocaleString()` without specifying `'en-IN'` locale — default locale formatting varies by browser
- **Do NOT** hardcode chart colors — define a color map constant so it's consistent across charts
- **Do NOT** make the dashboard a single giant component — each chart/section must be its own component
- **Do NOT** show raw ISO date strings on chart axes — format them to readable labels

## Interview Explanation Points
- "I load all dashboard sections in parallel with `Promise.all()` on the frontend, mirroring the same pattern used in the backend analytics service. The entire dashboard renders in the time it takes the slowest single query — not the sum of all query times."
- "Indian number formatting with `toLocaleString('en-IN')` displays ₹1,48,000 instead of ₹148,000. The Indian number system uses lakh grouping, not Western thousands grouping. This is a small detail that signals real product awareness for an India-focused platform."

---

# PROMPT 9.4 — Admin User Management Page

## Objective
Build `pages/admin/AdminUsers.jsx` — the admin user management interface. Admins can view all registered users, filter by role, see account status, and deactivate or reactivate accounts. This gives the admin operational control over the user base beyond just doctor verification.

## Implementation Scope Boundaries
- Build `pages/admin/AdminUsers.jsx` with paginated user table
- Build user deactivation/reactivation backend endpoint
- Add admin user management API functions
- Do NOT implement password reset or email verification (out of MVP scope)

## Backend Additions Required

```
GET  /api/admin/users              → All users with filters and pagination
PATCH /api/admin/users/:id/status  → Toggle isActive
```

```javascript
// Add to admin controller or create user.admin.controller.js

getAllUsersAdmin = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20, search } = req.query

  const query = {}
  if (role) query.role = role
  if (isActive !== undefined) query.isActive = isActive === 'true'
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const total = await User.countDocuments(query)
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  return successResponse(res, 200, 'Users retrieved', {
    users, total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  })
})

toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('User not found', 404)
  if (user.role === 'admin') throw new AppError('Cannot deactivate admin accounts', 403)

  user.isActive = !user.isActive
  await user.save()

  return successResponse(res, 200,
    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    { user: { id: user._id, isActive: user.isActive } }
  )
})
```

## User Management Page UI

```
Page Header:
  "User Management"
  [Search bar: name or email]

Filter tabs:
  [All] [Patients] [Doctors] [Active Only] [Inactive]

User Table Columns:
  Name | Email | Role | Joined Date | Status | Actions

Name column: avatar circle (initials if no image) + name

Role column: StatusBadge with role color
  patient: blue badge
  doctor: green badge
  admin: purple badge

Status column:
  Active: green "Active" badge
  Inactive: red "Inactive" badge

Actions column:
  If active: [Deactivate] button (red outlined)
  If inactive: [Activate] button (green outlined)
  If admin: no action buttons (cannot deactivate admin)

Deactivation confirmation:
  toast.custom confirmation — "Deactivate {name}? They will lose access."
  [Cancel] [Confirm Deactivate]
  Not a modal — use an inline confirmation pattern for speed

Pagination: same prev/next component from Phase 4

Empty state: "No users found matching your filters."
```

## Validation Checkpoints
- [ ] User table shows all users with correct data
- [ ] Filter by role returns correct subset
- [ ] Search by name finds matching users
- [ ] Deactivate button flips user to inactive and updates row in place
- [ ] Activate button re-enables user and updates row in place
- [ ] Admin accounts show no action buttons
- [ ] Deactivated user attempting login receives 403 (enforced from Phase 2 auth)
- [ ] Pagination works correctly

## Common Mistakes to Avoid
- **Do NOT** allow deactivating admin accounts — enforce at both UI and API level
- **Do NOT** update the full users list after toggle — update the specific user row in local state

---

# PROMPT 9.5 — Admin Doctor Management & Verification Enhancement

## Objective
Enhance the existing `AdminDoctorVerification.jsx` page (built in Phase 3) with additional operational capabilities: search and filter doctors by status, view doctor earnings, suspend verified doctors, and see a complete doctor detail view with all profile information and uploaded documents.

## Implementation Scope Boundaries
- Enhance `pages/admin/AdminDoctorVerification.jsx`
- Add doctor suspension endpoint to backend
- Add doctor search/filter functionality
- Upgrade doctor detail view to show earnings and appointment count

## Backend Addition — Suspend Verified Doctor

```javascript
// PATCH /api/admin/doctors/:id/suspend
// Different from rejection — suspension applies to already-verified doctors
// Sets DoctorProfile.verificationStatus = 'pending' and isAvailable = false

suspendDoctor = asyncHandler(async (req, res) => {
  const { reason } = req.body
  if (!reason) throw new AppError('Suspension reason is required', 400)

  const profile = await DoctorProfile.findById(req.params.id)
  if (!profile) throw new AppError('Doctor not found', 404)
  if (profile.verificationStatus !== 'verified') {
    throw new AppError('Only verified doctors can be suspended', 400)
  }

  profile.verificationStatus = 'pending'  // Removes from public listings
  profile.isAvailable = false
  profile.verificationNote = `Suspended: ${reason}`
  await profile.save()

  return successResponse(res, 200, 'Doctor suspended successfully', { profile })
})
```

## Enhanced Doctor Management UI

```
Page now has two sections as tabs:

Tab 1: [Pending Review ●N]   ← existing verification queue
Tab 2: [All Doctors]         ← full doctor list with enhanced view

All Doctors tab:
  Search bar: by name, clinic, specialization
  Filter: [All] [Verified] [Pending] [Rejected]

  Table columns:
    Doctor | Specialization | Status | Rating | Appointments | Earnings | Actions

  Appointments column: count from analytics API
  Earnings column: total earnings from DoctorProfile.totalEarnings

  Action buttons per status:
    Verified:  [View Profile] [Suspend]
    Pending:   [View Profile] [Approve] [Reject]
    Rejected:  [View Profile] [Reconsider → set back to pending]

  Doctor detail drawer/modal (enhanced from Phase 3):
    All existing profile info from Phase 3 +
    Total earnings figure
    Total appointment count
    Review count and average rating
    Link to their public profile: "View Public Profile →"
```

## Validation Checkpoints
- [ ] Suspended verified doctor disappears from `GET /api/doctors` immediately
- [ ] Suspended doctor sees "Your account has been suspended" message on login or dashboard
- [ ] Admin can search doctors by name across all statuses
- [ ] Doctor detail view shows earnings and appointment count
- [ ] "Reconsider" action sets status back to pending — doctor re-enters verification queue

---

# PROMPT 9.6 — Admin Appointments & Payments Operations Pages

## Objective
Build dedicated admin pages for appointments and payments management. Admins need operational visibility into all platform transactions — not just the overview metrics from the dashboard, but filterable, searchable, paginated tables with the ability to see individual appointment and payment details.

## Implementation Scope Boundaries
- Build `pages/admin/AdminBookings.jsx`
- Build `pages/admin/AdminRevenue.jsx`
- These pages already exist as stubs from Phase 1 — populate them now
- No new backend endpoints needed — use existing admin APIs from Phases 5 and 6

## AdminBookings Page Specification

```
Page header: "Appointment Management"

Filter row:
  [All] [Pending] [Confirmed] [Completed] [Cancelled]
  Date range picker: [From: ____] [To: ____]
  Search: patient name or doctor name

Table columns:
  # | Patient | Doctor | Date | Time | Fee | Commission | Payment | Status

Payment column:
  Paid: green "Paid" chip
  Unpaid: amber "Unpaid" chip

Clicking a row: expands inline to show:
  - Patient email and phone
  - Doctor clinic name and address
  - Patient notes (if any)
  - Cancellation reason (if cancelled)
  - Razorpay payment ID (if paid)

Admin actions available:
  - Mark Complete (for confirmed appointments past their date)
  - For MVP: no other admin intervention needed beyond visibility

Summary row at bottom:
  Total shown: {count} appointments
  Total fees: ₹{sum}
  Total commission: ₹{sum}
```

## AdminRevenue Page Specification

```
Page header: "Revenue & Payments"

Top section — Period Revenue Summary:
  Period selector: [This Week] [This Month] [Last 3 Months] [All Time]
  3 metric cards:
    Total Revenue | Platform Commission | Doctor Earnings

Revenue chart:
  Reuse RevenueChart component from Prompt 9.3
  Period selector: Daily / Weekly / Monthly

Payments table:
  Same PaymentsTable from Phase 6 — already built
  Add: filter by payment status [All] [Paid] [Failed] [Created]

Specialization breakdown section:
  Table showing revenue per specialization
  Columns: Specialization | Doctors | Appointments | Revenue | Avg Fee
  Sort: by revenue descending

Export note (visual only — not implemented):
  "📥 Export to CSV" button
  Shows toast: "Export feature coming soon"
  Reason: sets product expectation without requiring implementation
```

## Validation Checkpoints
- [ ] AdminBookings shows all appointments with correct status filters
- [ ] Date range filter returns appointments within the selected range
- [ ] Row expansion shows additional appointment details
- [ ] AdminRevenue shows period-filtered revenue metrics
- [ ] Specialization breakdown table renders with correct data
- [ ] Chart period toggle re-fetches and updates correctly

---

# PROMPT 9.7 — Admin Navigation & Dashboard Shell Enhancement

## Objective
Update the admin sidebar navigation to include all new pages built in Phase 9. Ensure consistent page headers, breadcrumbs where needed, and that the admin dashboard feels like a complete operational product rather than a collection of isolated pages.

## Implementation Scope Boundaries
- Update `AdminLayout.jsx` sidebar with all Phase 9 routes
- Add page headers to all admin pages
- Add notification badge for pending doctor verification count
- Ensure admin dashboard is the default redirect after admin login

## Complete Admin Sidebar Navigation

```
PHYSIOCONNECT ADMIN

[📊 Overview]           → /admin/dashboard
[🩺 Doctors]            → /admin/doctors        ← Badge: pending count
[📅 Appointments]       → /admin/bookings
[💰 Revenue]            → /admin/revenue
[👥 Users]              → /admin/users
[⭐ Reviews]            → /admin/reviews
[✨ AI Tools]           → /admin/ai-tools

─────────────────
Admin: {name}
[Logout]
```

## Pending Verification Badge

```javascript
// In AdminLayout.jsx

const [pendingCount, setPendingCount] = useState(0)

useEffect(() => {
  const fetchPending = async () => {
    try {
      const res = await getPendingDoctorsAPI({ page: 1, limit: 1 })
      setPendingCount(res.data.data.total)
    } catch { /* fail silently */ }
  }
  fetchPending()
}, [])

// In sidebar:
<NavLink to="/admin/doctors">
  🩺 Doctors
  {pendingCount > 0 && (
    <span className="ml-auto bg-red-500 text-white text-xs
                     px-2 py-0.5 rounded-full font-medium">
      {pendingCount}
    </span>
  )}
</NavLink>
```

## Consistent Page Header Component

```jsx
// components/admin/PageHeader.jsx
const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
```

Use this on every admin page for visual consistency.

## Validation Checkpoints
- [ ] All 7 admin sidebar items navigate to correct pages
- [ ] Active route highlighted in sidebar
- [ ] Pending verification badge shows correct count
- [ ] Badge disappears when all doctors are processed
- [ ] PageHeader renders consistently across all admin pages
- [ ] Admin logout works from the sidebar

---

# PROMPT 9.8 — Doctor & Patient Dashboard Enhancements

## Objective
Enhance the existing patient and doctor dashboards with real data from the analytics APIs. Replace the placeholder metric cards (built in Phase 2) with live data. Add a quick stats row to each dashboard that gives users an at-a-glance view of their activity.

## Implementation Scope Boundaries
- Enhance `pages/patient/PatientDashboard.jsx` with real stats
- Enhance `pages/doctor/DoctorDashboard.jsx` with real stats
- Add doctor earnings breakdown to doctor dashboard
- No new backend endpoints needed — use existing APIs

## Patient Dashboard Enhancements

```
Replace placeholder cards with real data:

Fetch on load:
  GET /api/appointments/mine → count by status
  GET /api/payments/mine → sum of payments
  GET /api/reviews/mine → count of reviews submitted

Real metric cards:
  Total Appointments: appointments.total
  Upcoming:           appointments.confirmed count
  Completed:          appointments.completed count
  Reviews Given:      reviews.total

Upcoming appointment preview:
  Show the next 1-2 upcoming appointments as cards
  Each card: doctor name, specialization, date, time, status badge
  Link: "View All Appointments →"

Quick action buttons:
  [🔍 Find a Doctor → /doctors]
  [📅 My Appointments → /patient/appointments]
```

## Doctor Dashboard Enhancements

```
Replace placeholder cards with real data:

Fetch on load:
  GET /api/appointments/mine → count by status
  GET /api/doctors/profile/me → verification status + earnings

Real metric cards:
  Today's Appointments: appointments where date === today
  Total Patients:       unique patients from completed appointments
  Total Earnings:       doctorProfile.totalEarnings formatted
  Average Rating:       doctorProfile.averageRating or 'No reviews'

Verification status banner:
  Already exists from Phase 3 — ensure it shows correctly

Today's schedule preview:
  Filter appointments where date === today's date (YYYY-MM-DD)
  Show as a small timeline list: time | patient name | status
  Empty: "No appointments scheduled for today"

Earnings snapshot:
  This month's earnings vs last month (requires date filtering on appointments)
  Simple display: "This month: ₹X,XXX"
  Link: "View Earnings → /doctor/earnings"
```

## Doctor Earnings Page Enhancement

```
pages/doctor/DoctorEarnings.jsx (stub from Phase 1 — now populate)

Fetch: GET /api/appointments/mine?status=completed

Display:
  Top metrics:
    Total Earnings: sum of doctorEarnings across completed paid appointments
    Total Sessions: count of completed appointments
    Average per Session: total / count

  Monthly breakdown table:
    Month | Sessions | Gross Fee | Commission (10%) | Your Earnings
    Computed client-side from appointments data grouped by month

  Recent payments list:
    Date | Patient (first name only) | Fee | Your Earnings
    Last 10 completed paid appointments
```

## Validation Checkpoints
- [ ] Patient dashboard metric cards show real counts from API
- [ ] Upcoming appointments preview shows next 1-2 bookings
- [ ] Doctor dashboard shows today's scheduled appointments
- [ ] Doctor earnings page shows correct total and monthly breakdown
- [ ] All cards show 0 gracefully for new accounts with no data

---

# PROMPT 9.9 — Analytics Seed Data Enhancement

## Objective
Update the seed script to create enough historical data across multiple dates to make the revenue chart, user growth chart, and activity feed look meaningful during demos. Without time-distributed seed data, every chart shows a single spike on the seed date.

## Architecture Reasoning
Demo data must tell a story. A revenue chart with data spanning 30 days shows a platform that's been operating. A single data point from today shows a platform that just started. Distributing seed data across a realistic time range is as important as the data quality itself.

## Implementation Scope Boundaries
- Modify `server/src/config/seed.js`
- Create appointments and payments spread across the last 30 days
- Create user registrations spread across the last 60 days
- Do NOT delete existing seeded data — add to it

## Seed Additions

```javascript
// Time-distributed appointment seeding

const pastDates = []
for (let i = 30; i >= 1; i--) {
  const date = new Date()
  date.setDate(date.getDate() - i)
  pastDates.push(date.toISOString().split('T')[0])  // YYYY-MM-DD
}

// Create 2-4 completed, paid appointments per day for the last 30 days
// Rotate across the seeded doctors
// Each with a Payment record and reviewSubmitted: true

for (const date of pastDates) {
  const appointmentsForDay = Math.floor(Math.random() * 3) + 2  // 2-4
  for (let i = 0; i < appointmentsForDay; i++) {
    const doctor = doctors[i % doctors.length]
    const fee = doctor.consultationFee
    const commission = fee * 0.10
    const earnings = fee * 0.90

    // Create appointment with past date
    const appointment = await Appointment.create({
      patient: patientUser._id,
      doctor: doctor._id,
      slot: null,   // Historical — slot no longer relevant
      date,
      startTime: '10:00',
      endTime: '10:30',
      status: 'completed',
      consultationFee: fee,
      platformCommission: commission,
      doctorEarnings: earnings,
      paymentStatus: 'paid',
      reviewSubmitted: true,
      createdAt: new Date(date),   // Override timestamp for chart accuracy
    })

    // Create corresponding payment
    await Payment.create({
      appointment: appointment._id,
      patient: patientUser._id,
      doctor: doctor._id,
      razorpayOrderId: `order_seed_${date}_${i}`,
      razorpayPaymentId: `pay_seed_${date}_${i}`,
      amount: fee,
      status: 'paid',
      platformCommission: commission,
      doctorEarnings: earnings,
      createdAt: new Date(date),   // Override for chart accuracy
    })
  }
}
```

**Why `createdAt` override?**
Mongoose allows passing `createdAt` in the document when `timestamps: true` is set, if you pass it explicitly in the create call. This is the correct way to back-date seed data for analytics purposes — no schema changes needed.

## Expected Demo Data State After Seed

```
30 days of revenue data visible in chart
2-4 appointments per day = ~75-100 completed appointments total
Revenue chart shows realistic upward trend with some variation
Activity feed shows activity from multiple days
User growth chart shows registrations spread over 60 days
Top doctors table shows meaningful earnings differences
Specialization breakdown shows multiple specializations with data
```

## Validation Checkpoints
- [ ] Revenue chart shows data points across 30 days, not a single spike
- [ ] `getRevenueTimeSeries({ period: 'daily' })` returns 30 data points
- [ ] `getTopDoctors()` shows non-zero earnings for multiple doctors
- [ ] `getSpecializationBreakdown()` shows data for 3+ specializations
- [ ] `getRecentActivity()` shows events from multiple different days
- [ ] Re-running the seed script is idempotent — does not duplicate data

---

## Phase 9 Completion Gate

Before moving to Phase 10 (Polish, Landing Page & Deployment), ALL of the following must be true:

```
✅ analytics.service.js implements all aggregation functions
✅ All functions return zeros on empty collections, never errors
✅ GET /api/admin/analytics/overview returns all 13 platform metrics
✅ GET /api/admin/analytics/revenue returns time-series data with period filtering
✅ GET /api/admin/analytics/top-doctors returns sorted by earnings/appointments/rating
✅ GET /api/admin/analytics/recent-activity returns merged multi-collection feed
✅ All analytics routes protected by requireAuth + requireRole('admin')
✅ Admin dashboard overview page renders all 8 metric cards with real data
✅ Revenue trend line chart renders with daily/weekly/monthly toggle
✅ Appointment donut chart renders with correct status colors
✅ Top doctors table renders with metric toggle
✅ Recent activity feed shows relative timestamps
✅ Admin users page shows paginated user table with deactivation
✅ Deactivating a user prevents their next login (403)
✅ Admin cannot deactivate admin accounts
✅ Admin doctors page enhanced with search, suspend, and reconsider actions
✅ Suspended verified doctor removed from public listings immediately
✅ AdminBookings page shows filterable appointment table
✅ AdminRevenue page shows period-filtered revenue metrics and specialization breakdown
✅ Pending verification badge shows on admin sidebar Doctors link
✅ Patient dashboard shows real appointment counts from API
✅ Doctor dashboard shows real today's schedule and earnings
✅ Doctor earnings page shows monthly breakdown
✅ Seed script creates 30 days of time-distributed historical data
✅ Revenue chart shows 30 data points not a single spike
✅ All admin pages use consistent PageHeader component
✅ Deployed to Render/Vercel — admin dashboard analytics work in production
```

**Phase 9 unlocks Phase 10 (Polish, Landing Page & Deployment) because:**
- All platform data flows are complete and operational
- The admin has full visibility and operational control
- Real data exists across all collections for demo purposes
- The analytics foundation makes the platform feel like a real SaaS business, not just a CRUD application
- Every dashboard — patient, doctor, and admin — shows live data
- The only remaining work is surface-level polish, the landing page hero, and final deployment validation

---

Say **"generate Phase 10 prompts"** when ready.