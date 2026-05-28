import { Router } from 'express';
import {
  createSlot,
  getMySlots,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
} from '../controllers/availability.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Doctor routes
router.post('/slots', requireAuth, requireRole('doctor'), createSlot);
router.get('/slots/mine', requireAuth, requireRole('doctor'), getMySlots);
router.put('/slots/:slotId', requireAuth, requireRole('doctor'), updateSlot);
router.delete('/slots/:slotId', requireAuth, requireRole('doctor'), deleteSlot);

// Public route for patients
router.get('/:doctorId/available', getAvailableSlots);

export default router;
