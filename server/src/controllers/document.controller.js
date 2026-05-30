import cloudinary from '../config/cloudinary.js';
import Appointment from '../models/Appointment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Uploads a file buffer directly to Cloudinary folder as a raw PDF resource.
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'theralign/session-documents',
        resource_type: 'raw', // Required for raw PDFs
        format: 'pdf',
        public_id: `doc_${Date.now()}`,
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
 * POST /api/documents/upload/:appointmentId
 * Doctor uploads a clinical note or prescription PDF for a completed appointment.
 * Protect: requireAuth, requireRole('doctor')
 */
export const uploadSessionDocument = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!req.file) {
    throw new AppError('Please upload a document file.', 400);
  }

  // Validate PDF mimetype and size limit (5MB)
  if (req.file.mimetype !== 'application/pdf') {
    throw new AppError('Only PDF documents are accepted.', 400);
  }
  if (req.file.size > 5 * 1024 * 1024) {
    throw new AppError('File size limit exceeded. PDFs must be under 5MB.', 400);
  }

  // Locate appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Verify doctor ownership
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Access denied. You do not own this appointment.', 403);
  }

  // Enforce upload boundary: Completed visits only
  if (appointment.status !== 'completed') {
    throw new AppError('Clinical documents can only be attached to completed appointments.', 400);
  }

  // If a document already exists, purge it from Cloudinary to free storage
  if (appointment.sessionDocument?.publicId) {
    try {
      await cloudinary.uploader.destroy(appointment.sessionDocument.publicId, { resource_type: 'raw' });
    } catch (err) {
      console.error('Failed to delete previous document during replace:', err);
    }
  }

  // Stream raw upload to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
  } catch (err) {
    console.error('Cloudinary stream raw upload error:', err);
    throw new AppError('Storage service upload failed. Please try again.', 500);
  }

  // Update appointment record
  appointment.sessionDocument = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    uploadedAt: new Date(),
    fileName: req.file.originalname,
  };

  await appointment.save();

  // Trigger in-app notification to the patient
  createNotification({
    recipientId: appointment.patient,
    type: 'document_uploaded',
    title: 'New Document Shared',
    message: `Dr. ${req.user.name} has uploaded a session document for your appointment on ${appointment.date}.`,
    link: '/patient/appointments',
    relatedId: appointment._id,
  });

  return successResponse(res, 200, 'Session notes attached successfully!', appointment);
});

/**
 * DELETE /api/documents/:appointmentId
 * Doctor deletes a clinical note PDF from a completed appointment.
 * Protect: requireAuth, requireRole('doctor')
 */
export const deleteSessionDocument = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Verify doctor ownership
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile || appointment.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Access denied. You do not own this appointment.', 403);
  }

  if (!appointment.sessionDocument?.publicId) {
    throw new AppError('No document is attached to this appointment.', 400);
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(appointment.sessionDocument.publicId, { resource_type: 'raw' });
  } catch (err) {
    console.error('Cloudinary document destroy failure:', err);
    throw new AppError('Failed to remove document from storage.', 500);
  }

  // Clear schema fields
  appointment.sessionDocument = {
    url: null,
    publicId: null,
    uploadedAt: null,
    fileName: null,
  };

  await appointment.save();

  return successResponse(res, 200, 'Session document removed successfully.', appointment);
});
