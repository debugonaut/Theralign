import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import crypto from 'crypto';
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
    // Generate clean, safe unique filenames using secure UUIDs to prevent prediction
    const uniqueId = crypto.randomUUID();
    cb(null, `${uniqueId}${path.extname(file.originalname)}`);
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

// Helper: Magic byte checking
const verifyMagicBytes = async (filePath, allowedMimeTypes) => {
  let fd;
  try {
    const buffer = Buffer.alloc(8);
    fd = await fsPromises.open(filePath, 'r');
    await fd.read(buffer, 0, 8, 0);
    const hex = buffer.toString('hex').toUpperCase();

    let detectedMime = null;
    if (hex.startsWith('25504446')) { // %PDF
      detectedMime = 'application/pdf';
    } else if (hex.startsWith('89504E47')) { // PNG
      detectedMime = 'image/png';
    } else if (hex.startsWith('FFD8FF')) { // JPEG
      detectedMime = 'image/jpeg';
    }

    if (!detectedMime || !allowedMimeTypes.includes(detectedMime)) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error verifying magic bytes:', err);
    return false;
  } finally {
    if (fd) {
      await fd.close();
    }
  }
};

// Helper: Clean up files in case of verification failures
const cleanupUploadedFiles = async (reqFiles) => {
  if (!reqFiles) return;
  const filesToCleanup = [];
  if (Array.isArray(reqFiles)) {
    filesToCleanup.push(...reqFiles);
  } else {
    for (const key of Object.keys(reqFiles)) {
      filesToCleanup.push(...reqFiles[key]);
    }
  }

  for (const file of filesToCleanup) {
    try {
      await fsPromises.unlink(file.path);
    } catch (err) {
      // ignore unlink errors
    }
  }
};

// ─── Generic multer upload instance (for use by other routes) ───────────────
export const upload = multerDocs;

// ─── Exported Onboarding Middleware ──────────────────────────────────────────
/**
 * Express middleware to handle doctor onboarding documents.
 * Expects 'degreeDocument', 'licenseDocument', and 'profileImage' fields.
 */
export const uploadOnboardingDocs = (req, res, next) => {
  const fields = multerDocs.fields([
    { name: 'degreeDocument', maxCount: 1 },
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
  ]);

  fields(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Document size exceeds the 5MB limit.', 400));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }
      return next(err);
    }

    // Verify magic bytes for uploaded files
    const filesToCheck = [];
    if (req.files) {
      if (req.files.degreeDocument?.[0]) {
        filesToCheck.push({
          file: req.files.degreeDocument[0],
          allowed: ['application/pdf', 'image/jpeg', 'image/png']
        });
      }
      if (req.files.licenseDocument?.[0]) {
        filesToCheck.push({
          file: req.files.licenseDocument[0],
          allowed: ['application/pdf', 'image/jpeg', 'image/png']
        });
      }
      if (req.files.profileImage?.[0]) {
        filesToCheck.push({
          file: req.files.profileImage[0],
          allowed: ['image/jpeg', 'image/png']
        });
      }
    }

    for (const item of filesToCheck) {
      const isValid = await verifyMagicBytes(item.file.path, item.allowed);
      if (!isValid) {
        await cleanupUploadedFiles(req.files);
        return next(
          new AppError(
            `Invalid file content for field "${item.file.fieldname}". Only genuine PDFs and images (JPEG/PNG) are accepted.`,
            400
          )
        );
      }
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
    single(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Profile image size exceeds the 2MB limit.', 400));
          }
          return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        return next(err);
      }

      if (req.file) {
        const isValid = await verifyMagicBytes(req.file.path, ['image/jpeg', 'image/png']);
        if (!isValid) {
          try {
            await fsPromises.unlink(req.file.path);
          } catch (err) {
            // ignore unlink errors
          }
          return next(new AppError('Invalid image content. Only genuine JPEG and PNG images are accepted.', 400));
        }
      }

      next();
    });
  };
};
