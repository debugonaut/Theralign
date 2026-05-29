import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './src/config/env.js';
import errorMiddleware from './src/middleware/error.middleware.js';
import { errorResponse } from './src/utils/apiResponse.js';

// Theralign — Express Application Setup
import authRoutes from './src/routes/auth.routes.js';
import doctorRoutes from './src/routes/doctor.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import availabilityRoutes from './src/routes/availability.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import discoveryRoutes from './src/routes/discovery.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import waitlistRoutes from './src/routes/waitlist.routes.js';

const app = express();


// ==========================================
// 1. GLOBAL MIDDLEWARES
// ==========================================

// Layer 1: Security Headers
app.use(helmet());

// Layer 2: CORS Setup
const allowedOrigins = [
  'http://localhost:5173', // Local Vite Dev
  config.clientUrl
].filter(Boolean); // Filter out empty values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Layer 3: Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Layer 4: Request Logging (Morgan)
const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ==========================================
// 2. SYSTEM CHANNELS & HEALTH CHECKS
// ==========================================

// Layer 5: Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Theralign API is running smoothly',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// ==========================================
// 3. API BUSINESS ROUTE GROUPS
// ==========================================

// Layer 6: Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/discover', discoveryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/waitlist', waitlistRoutes);

// ==========================================
// 4. FALLBACK & ERROR HANDLERS
// ==========================================

// Layer 7: Catch-All 404 Handler
app.use('*', (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
});

// Layer 8: Global Error Middleware (Must be last)
app.use(errorMiddleware);

export default app;
