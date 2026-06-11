import cloudinary from '../config/cloudinary.js';
import Appointment from '../models/Appointment.model.js';
import AppointmentMedia from '../models/AppointmentMedia.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Supported media types and their allowed MIME types
 */
const ALLOWED_MEDIA = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 25 * 1024 * 1024, // 25MB
    resourceType: 'image',
  },
  video: {
    types: ['video/mp4', 'video/quicktime'],
    maxSize: 25 * 1024 * 1024, // 25MB
    resourceType: 'video',
  },
  audio: {
    types: ['audio/mpeg', 'audio/mp4'],
    maxSize: 25 * 1024 * 1024, // 25MB
    resourceType: 'video', // Audio uploaded as video resource type in Cloudinary
  },
};

/**
 * Validates file type and size
 */
const validateMediaFile = (file) => {
  if (!file) {
    throw new AppError('Please upload a media file.', 400);
  }

  // Find media type and allowed config
  let mediaType = null;
  let mediaConfig = null;

  for (const [type, config] of Object.entries(ALLOWED_MEDIA)) {
    if (config.types.includes(file.mimetype)) {
      mediaType = type;
      mediaConfig = config;
      break;
    }
  }

  if (!mediaType) {
    throw new AppError(
      'Unsupported file type. Allowed: JPG, PNG, WEBP (images), MP4, MOV (video), MP3, M4A (audio).',
      400
    );
  }

  if (file.size > mediaConfig.maxSize) {
    throw new AppError(
      `File size limit exceeded. Maximum: 25MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      400
    );
  }

  return { mediaType, mediaConfig };
};

/**
 * Uploads media to Cloudinary
 */
const uploadMediaToCloudinary = (fileBuffer, fileName, mediaType, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'theralign/appointment-media',
        resource_type: resourceType,
        public_id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * POST /api/appointment-media/upload/:appointmentId
 * Patient or Doctor uploads media (image, video, audio) for an appointment.
 * Protect: requireAuth
 */
export const uploadAppointmentMedia = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  // Validate appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Determine uploader role: patient or doctor
  let uploadedBy = null;
  let isAuthorized = false;

  if (appointment.patient.toString() === req.user.id.toString()) {
    uploadedBy = 'patient';
    // Patients can upload ONLY during pending/confirmed status, before or up to the appointment
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      throw new AppError('Media can only be uploaded before or during appointment booking.', 400);
    }
    isAuthorized = true;
  } else if (req.user.role === 'doctor') {
    uploadedBy = 'doctor';
    // Doctors can upload to any appointment they own
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
    if (doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString()) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new AppError('Access denied. You are not authorized to upload media for this appointment.', 403);
  }

  // Validate file
  const { mediaType, mediaConfig } = validateMediaFile(req.file);

  // Check media count limit (max 5 per appointment)
  const existingMediaCount = await AppointmentMedia.countDocuments({
    appointment: appointmentId,
  });

  if (existingMediaCount >= 5) {
    throw new AppError('Maximum 5 media files per appointment. Please delete one before uploading.', 429);
  }

  // Upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadMediaToCloudinary(
      req.file.buffer,
      req.file.originalname,
      mediaType,
      mediaConfig.resourceType
    );
  } catch (err) {
    console.error('Cloudinary media upload error:', err);
    throw new AppError('Storage service upload failed. Please try again.', 500);
  }

  // Create media document
  const mediaDocument = await AppointmentMedia.create({
    appointment: appointmentId,
    uploadedBy,
    uploader: req.user.id,
    mediaType,
    fileType: req.file.mimetype,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    cloudinaryUrl: uploadResult.secure_url,
    cloudinaryPublicId: uploadResult.public_id,
    duration: uploadResult.duration || null, // Video/audio duration
    description: req.body.description || '',
  });

  // Populate for response
  await mediaDocument.populate('uploader', 'name email');

  // Notify the other party
  if (uploadedBy === 'patient') {
    // Notify doctor that patient uploaded media
    createNotification({
      recipientId: appointment.doctor,
      type: 'media_uploaded_patient',
      title: 'Patient Uploaded Media',
      message: `Your patient has uploaded ${mediaType} media for the appointment on ${appointment.date}.`,
      link: `/doctor/appointments/${appointmentId}`,
      relatedId: appointmentId,
    });
  } else if (uploadedBy === 'doctor') {
    // Notify patient that doctor uploaded media
    createNotification({
      recipientId: appointment.patient,
      type: 'media_uploaded_doctor',
      title: 'Doctor Uploaded Session Media',
      message: `Dr. ${req.user.name} has uploaded ${mediaType} media for your appointment on ${appointment.date}.`,
      link: `/patient/appointments/${appointmentId}`,
      relatedId: appointmentId,
    });
  }

  return successResponse(res, 201, 'Media uploaded successfully!', mediaDocument);
});

/**
 * GET /api/appointment-media/:appointmentId
 * Retrieve all media for an appointment.
 * Protect: requireAuth
 */
export const getAppointmentMedia = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  // Validate appointment exists and user is authorized
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Check authorization: patient, assigned doctor, or admin
  let isAuthorized = false;
  if (appointment.patient.toString() === req.user.id.toString()) {
    isAuthorized = true;
  } else if (req.user.role === 'doctor') {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
    if (doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString()) {
      isAuthorized = true;
    }
  } else if (req.user.role === 'admin') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new AppError('Access denied. You are not authorized to view media for this appointment.', 403);
  }

  // Fetch all media for appointment
  const mediaList = await AppointmentMedia.find({ appointment: appointmentId })
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 });

  return successResponse(res, 200, 'Media retrieved successfully.', mediaList);
});

/**
 * DELETE /api/appointment-media/:mediaId
 * Delete a specific media file from an appointment.
 * Protect: requireAuth
 */
export const deleteAppointmentMedia = asyncHandler(async (req, res) => {
  const { mediaId } = req.params;

  const mediaDocument = await AppointmentMedia.findById(mediaId);
  if (!mediaDocument) {
    throw new AppError('Media not found.', 404);
  }

  // Get appointment for authorization check
  const appointment = await Appointment.findById(mediaDocument.appointment);
  if (!appointment) {
    throw new AppError('Associated appointment not found.', 404);
  }

  // Authorization: uploader can delete their own, doctor can delete any
  let isAuthorized = false;
  if (mediaDocument.uploader.toString() === req.user.id) {
    isAuthorized = true;
  } else if (req.user.role === 'admin') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new AppError('Access denied. You can only delete your own uploaded media.', 403);
  }

  // Delete from Cloudinary
  try {
    const resourceType = ALLOWED_MEDIA[mediaDocument.mediaType]?.resourceType || 'image';
    await cloudinary.uploader.destroy(mediaDocument.cloudinaryPublicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error('Cloudinary media deletion error:', err);
    throw new AppError('Failed to remove media from storage.', 500);
  }

  // Delete media document
  await AppointmentMedia.findByIdAndDelete(mediaId);

  return successResponse(res, 200, 'Media deleted successfully.');
});

/**
 * GET /api/appointment-media/count/:appointmentId
 * Get count of media files for an appointment.
 * Protect: requireAuth
 */
export const getAppointmentMediaCount = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Check authorization
  let isAuthorized = false;
  if (appointment.patient.toString() === req.user.id.toString()) {
    isAuthorized = true;
  } else if (req.user.role === 'doctor') {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
    if (doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString()) {
      isAuthorized = true;
    }
  } else if (req.user.role === 'admin') {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new AppError('Access denied.', 403);
  }

  const count = await AppointmentMedia.countDocuments({ appointment: appointmentId });
  const maxAllowed = 5;

  return successResponse(res, 200, 'Media count retrieved.', {
    current: count,
    max: maxAllowed,
    canUploadMore: count < maxAllowed,
  });
});
