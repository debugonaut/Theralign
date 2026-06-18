import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

import config from './src/config/env.js';
import { hasValidAuthToken } from './src/utils/verifyTokenHeader.js';
import errorMiddleware from './src/middleware/error.middleware.js';
import { errorResponse } from './src/utils/apiResponse.js';
import { requestStore } from './src/utils/asyncStore.js';

// Theralign — Express Application Setup
import authRoutes from './src/routes/auth.routes.js';
import doctorRoutes from './src/routes/doctor.routes.js';
import availabilityRoutes from './src/routes/availability.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import discoveryRoutes from './src/routes/discovery.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import appointmentMediaRoutes from './src/routes/appointmentMedia.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import patientProfileRoutes from './src/routes/patientProfile.routes.js';
import sessionRecordRoutes from './src/routes/sessionRecord.routes.js';
import juniorDoctorRoutes from './src/routes/juniorDoctor.routes.js';

const app = express();

// Enable trust proxy for express-rate-limit behind Render load balancer
app.set('trust proxy', 1);

// Disable X-Powered-By header
app.disable('x-powered-by');

// ==========================================
// 1. GLOBAL MIDDLEWARES & SECURITY
// ==========================================

// Layer 1: Request ID & AsyncLocalStorage Context Store
app.use((req, res, next) => {
  const reqId = crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  requestStore.run(req, () => {
    next();
  });
});

// Layer 2: Security Headers
app.use(
  helmet({
    // Strict HSTS configuration (Rule 2 & Rule 11)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent embedding page in frame (Rule 11)
    frameguard: {
      action: 'deny',
    },
    // Basic Content Security Policy (Rule 11)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "res.cloudinary.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// Layer 3: Permissions Policy Header
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  next();
});

// Layer 4: CORS Setup (Environment-Aware & Strict)
const allowedOrigins = config.nodeEnv === 'production'
  ? [
      config.clientUrl,
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

// Layer 5: Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Layer 6: Request Logging (Morgan with Request IDs)
morgan.token('reqId', (req) => req.id || '');
const morganFormat = config.nodeEnv === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [reqId=:reqId]'
  : ':method :url :status :response-time ms - :res[content-length] [reqId=:reqId]';
app.use(morgan(morganFormat));

// ==========================================
// 2. RATE LIMITING (Production Hardening)
// ==========================================

// General/Authenticated API Rate Limiter
// Dynamic max: 60 req/min for public, 300 req/min for authenticated users (Rule 6)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req) => {
    if (hasValidAuthToken(req)) {
      return 300;
    }
    return 60;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Stricter Rate Limiter for Auth Routes (brute-force protection - Rule 6)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

// Password Reset Limiter (Rule 6)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per 1 hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Please try again in an hour.' },
});

// Chatbot rate limiter (15 requests per minute per IP)
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many chatbot queries. Please wait a minute before asking more questions.' },
});

// AI endpoints — strict limit (Groq API key protection; auth required on routes)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  skip: (req) => req.originalUrl && req.originalUrl.includes('/chatbot'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please try again later.' },
});

// Payment order creation — limits Razorpay API churn per user
const paymentOrderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment requests. Please try again later.' },
});

// Dedicated File Upload Rate Limiter (Rule 6)
// Max 5 file uploads per minute per IP
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many file uploads. Please try again in a minute.' },
});

// Apply rate limiting to appropriate namespaces
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/ai/chatbot', chatbotLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/payments/create-order', paymentOrderLimiter);
app.use('/api/doctors/profile/onboard', uploadLimiter);
app.use('/api/patients/profile/avatar', uploadLimiter);
app.use('/api/documents/upload', uploadLimiter);

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
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointment-media', appointmentMediaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/discover', discoveryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/patients/profile', patientProfileRoutes);
app.use('/api/session-records', sessionRecordRoutes);
app.use('/api/junior', juniorDoctorRoutes);

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
