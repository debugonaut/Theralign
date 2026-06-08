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
  debugDoctorAvailability,
} from '../controllers/availability.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createSlotValidation,
  createRecurringSlotsValidation,
  updateSlotValidation,
  deleteSlotValidation,
  saveWeeklyScheduleValidation,
  blockDateValidation,
  unblockDateValidation,
  getAvailableSlotsValidation,
  getAvailableSlotsByDateValidation,
} from '../validations/availability.validation.js';

const router = Router();

// ─── Doctor-only routes ───────────────────────────────────────────────────────

// Legacy slot management (kept for backward compatibility)
router.post('/slots', requireAuth, requireRole('doctor'), createSlotValidation, validate, createSlot);
router.post('/slots/recurring', requireAuth, requireRole('doctor'), createRecurringSlotsValidation, validate, createRecurringSlots);
router.get('/slots/mine', requireAuth, requireRole('doctor'), getMySlots);
router.put('/slots/:slotId', requireAuth, requireRole('doctor'), updateSlotValidation, validate, updateSlot);
router.delete('/slots/:slotId', requireAuth, requireRole('doctor'), deleteSlotValidation, validate, deleteSlot);

// Weekly schedule (new system)
router.get('/schedule', requireAuth, requireRole('doctor'), getWeeklySchedule);
router.post('/schedule', requireAuth, requireRole('doctor'), saveWeeklyScheduleValidation, validate, saveWeeklySchedule);
router.post('/block-date', requireAuth, requireRole('doctor'), blockDateValidation, validate, blockDate);
router.delete('/block-date', requireAuth, requireRole('doctor'), unblockDateValidation, validate, unblockDate);

// ─── Public routes ────────────────────────────────────────────────────────────

// Legacy: patient booking calendar (old slot model)
router.get('/:doctorId/available', getAvailableSlotsValidation, validate, getAvailableSlots);

// New: computed slots from weekly schedule (with legacy fallback)
router.get('/:doctorId/slots', getAvailableSlotsByDateValidation, validate, getAvailableSlotsByDate);

// Diagnostic/debug availability settings
router.get('/:doctorId/debug', getAvailableSlotsValidation, validate, debugDoctorAvailability);

export default router;
