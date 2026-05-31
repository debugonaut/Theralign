import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

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
import patientProfileRoutes from './src/routes/patientProfile.routes.js';

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARES & SECURITY
// ==========================================

// Layer 1: Security Headers
app.use(helmet());

// Layer 2: CORS Setup (Environment-Aware & Strict)
const allowedOrigins = config.nodeEnv === 'production'
  ? [
      config.clientUrl,
      'https://physioconnect.vercel.app',
      'https://theralign.vercel.app',
    ].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', config.clientUrl].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS policy: ${origin || 'no origin'}`));
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
// 2. RATE LIMITING (Production Hardening)
// ==========================================

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Stricter Rate Limiter for Auth Routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

// Apply rate limiting to appropriate namespaces
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==========================================
// 3. SYSTEM HEALTH CHECKS
// ==========================================

// Root health check for Render monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv || 'development',
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Theralign API is running smoothly',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// ==========================================
// 4. API BUSINESS ROUTE GROUPS
// ==========================================

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
app.use('/api/patients/profile', patientProfileRoutes);

// ==========================================
// 5. FALLBACK & ERROR HANDLERS
// ==========================================

// Layer 7: Catch-All 404 Handler
app.use('*', (req, res) => {
  return errorResponse(res, 404, `Route ${req.originalUrl} not found`);
});

// Layer 8: Global Error Middleware (Must be last)
app.use(errorMiddleware);

export default app;
