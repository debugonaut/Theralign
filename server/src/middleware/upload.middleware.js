import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/AppError.js';

// Ensure the local upload staging directory exists
const uploadDir = path.join(process.cwd(), 'tmp/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Disk Storage Configuration ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate clean, safe unique filenames: fieldname-timestamp-random.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ─── File Filter: Type Restriction ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type "${file.mimetype}". Only JPEG, PNG images and PDF documents are allowed.`,
        400
      ),
      false
    );
  }
};

// ─── Multer Instances ────────────────────────────────────────────────────────
// 5MB Limit for general documents
const multerDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB in bytes
});

// ─── Exported Onboarding Middleware ──────────────────────────────────────────
/**
 * Express middleware to handle doctor onboarding documents.
 * Expects 'degreeDocument' and 'licenseDocument' fields.
 */
export const uploadOnboardingDocs = (req, res, next) => {
  const fields = multerDocs.fields([
    { name: 'degreeDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
  ]);

  fields(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Document size exceeds the 5MB limit.', 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err);
    }
    next();
  });
};

// ─── Exported Avatar Upload Middleware ───────────────────────────────────────
/**
 * Express middleware helper to upload a single image (e.g. profile picture).
 * Enforces 2MB maximum limit.
 */
export const uploadSingleImage = (fieldName) => {
  const multerAvatar = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedImageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (allowedImageMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            `Invalid file type "${file.mimetype}". Only JPG, JPEG, and PNG images are allowed.`,
            400
          ),
          false
        );
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB in bytes
  });

  return (req, res, next) => {
    const single = multerAvatar.single(fieldName);
    single(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Profile image size exceeds the 2MB limit.', 400));
          }
          return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        return next(err);
      }
      next();
    });
  };
};
