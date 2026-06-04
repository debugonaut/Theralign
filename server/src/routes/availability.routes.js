import { Router } from 'express';
import {
  createSlot,
  createRecurringSlots,
  getMySlots,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  // Weekly schedule endpoints
  getWeeklySchedule,
  saveWeeklySchedule,
  blockDate,
  unblockDate,
  getAvailableSlotsByDate,
} from '../controllers/availability.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// ─── Doctor-only routes ───────────────────────────────────────────────────────

// Legacy slot management (kept for backward compatibility)
router.post('/slots', requireAuth, requireRole('doctor'), createSlot);
router.post('/slots/recurring', requireAuth, requireRole('doctor'), createRecurringSlots);
router.get('/slots/mine', requireAuth, requireRole('doctor'), getMySlots);
router.put('/slots/:slotId', requireAuth, requireRole('doctor'), updateSlot);
router.delete('/slots/:slotId', requireAuth, requireRole('doctor'), deleteSlot);

// Weekly schedule (new system)
router.get('/schedule', requireAuth, requireRole('doctor'), getWeeklySchedule);
router.post('/schedule', requireAuth, requireRole('doctor'), saveWeeklySchedule);
router.post('/block-date', requireAuth, requireRole('doctor'), blockDate);
router.delete('/block-date', requireAuth, requireRole('doctor'), unblockDate);

// ─── Public routes ────────────────────────────────────────────────────────────

// Legacy: patient booking calendar (old slot model)
router.get('/:doctorId/available', getAvailableSlots);

// New: computed slots from weekly schedule (with legacy fallback)
router.get('/:doctorId/slots', getAvailableSlotsByDate);

export default router;
