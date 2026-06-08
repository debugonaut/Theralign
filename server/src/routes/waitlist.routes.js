import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  joinWaitlist,
  leaveWaitlist,
  checkWaitlistStatus,
  getMyWaitlists,
} from '../controllers/waitlist.controller.js';

const router = Router();

// Apply requireAuth globally to all waitlist routes
router.use(requireAuth);

router.get('/mine', requireRole('patient'), getMyWaitlists);
router.get('/status/:doctorId', checkWaitlistStatus);
router.post('/join/:doctorId', requireRole('patient'), joinWaitlist);
router.delete('/leave/:doctorId', requireRole('patient'), leaveWaitlist);

export default router;
