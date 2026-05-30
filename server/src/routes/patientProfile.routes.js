import { Router } from 'express';
import { getMyProfile, updateMyProfile, uploadAvatar } from '../controllers/patientProfile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = Router();

// All routes require authentication and patient role
router.use(requireAuth);
router.use(requireRole('patient'));

/**
 * GET /api/patients/profile/me
 * Fetch own profile
 */
router.get('/me', getMyProfile);

/**
 * PUT /api/patients/profile/me
 * Update profile (partial updates supported)
 */
router.put('/me', updateMyProfile);

/**
 * POST /api/patients/profile/avatar
 * Upload profile picture via Cloudinary
 */
router.post('/avatar', uploadSingleImage('profileImage'), uploadAvatar);

export default router;
