import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';
import AppError from '../utils/AppError.js';

/**
 * Uploads a local file to Cloudinary and guarantees local temp file deletion.
 * Silently catches local file unlink errors to avoid crashing requests on minor IO issues.
 *
 * @param {string} localFilePath - Absolute/relative path to local staging file
 * @param {string} folder - Destination folder sub-directory inside Cloudinary (e.g. 'doctor_docs', 'profile_pics')
 * @returns {Promise<string>} Secure HTTPS Cloudinary URL
 */
export const uploadToCloudinary = async (localFilePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `theralign/${folder}`,
      resource_type: 'auto', // Auto-detect PDF vs Image formats
    });

    return result.secure_url;
  } catch (error) {
    console.error(`[ERROR] Cloudinary upload failure:`, error);
    throw new AppError(`Failed to upload file to cloud storage: ${error.message}`, 500);
  } finally {
    // Guaranteed deletion of local staging file to prevent server disk leaks
    try {
      await fs.unlink(localFilePath);
    } catch (err) {
      console.error(`[WARNING] Failed to clean up temp file at ${localFilePath}:`, err.message);
    }
  }
};
