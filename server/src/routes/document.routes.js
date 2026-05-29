import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadSessionDocument, deleteSessionDocument } from '../controllers/document.controller.js';

const router = Router();

// Multer configured with in-memory buffer storage (avoids local disk leaks)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Enforces a strict 5MB file cap
});

// Routes secured for authenticated doctors
router.post(
  '/upload/:appointmentId',
  requireAuth,
  requireRole('doctor'),
  upload.single('document'), // Expects 'document' field payload
  uploadSessionDocument
);

router.delete(
  '/:appointmentId',
  requireAuth,
  requireRole('doctor'),
  deleteSessionDocument
);

export default router;
