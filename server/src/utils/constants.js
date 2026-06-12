export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const DOCTOR_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const COMMISSION_RATE = 0.10; // 10% platform commission

export const TOKEN_EXPIRY = '7d';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

export const GEOSPATIAL = {
  MAX_DISTANCE_METERS: 50000,      // 50km default search radius
  DEFAULT_DISTANCE_METERS: 10000   // 10km if user doesn't specify
};

// Phase 15 — Session Records notification types
export const NOTIFICATION_TYPES = {
  SESSION_RECORD_AVAILABLE: 'session_record_available',
  FOLLOW_UP_RECOMMENDED:    'follow_up_recommended',
};
