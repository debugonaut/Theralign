import AppError from '../utils/AppError.js';

/**
 * In-memory AI rate limiter — 10 requests per minute per doctor.
 *
 * Why not express-rate-limit?
 * ADR-compliant: no new npm packages. Lightweight Map-based sliding
 * window is sufficient for MVP scale and avoids a new dependency.
 *
 * Keyed by req.user.id. Auto-cleans expired entries to prevent unbounded growth.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Map<userId, { count: number, windowStart: number }>
const requestLog = new Map();

// Periodically clean stale entries (runs every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestLog.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      requestLog.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const aiRateLimit = (req, res, next) => {
  const userId = req.user?.id?.toString();
  if (!userId) return next();

  const now = Date.now();
  const entry = requestLog.get(userId);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Start a new window
    requestLog.set(userId, { count: 1, windowStart: now });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many AI requests. You can generate up to ${MAX_REQUESTS} exercises per minute. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfter: retryAfterSeconds,
    });
  }

  entry.count += 1;
  next();
};
