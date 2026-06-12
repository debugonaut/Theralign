import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import SessionRecord from '../models/SessionRecord.model.js';
import Appointment from '../models/Appointment.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { createNotification } from './notificationService.js';
import { formatDisplayDate } from '../utils/date.js';
import { EDITABLE_FIELDS } from '../validations/sessionRecord.validation.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// 24-hour edit window in milliseconds
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a new session record for a completed appointment.
 * Only the doctor who owns the appointment may create it.
 * One record per appointment — enforced at DB level (unique index) and here.
 */
export const createSessionRecord = async (doctorUserId, appointmentId, recordData) => {
  // Step 1: Fetch appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Step 2: Session records only for completed appointments
  if (appointment.status !== 'completed') {
    throw new AppError('Session records can only be created for completed appointments', 400);
  }

  // Step 3: Fetch doctor profile and populate user name for notifications
  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId }).populate('user', 'name');
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found', 404);
  }

  // Step 4: Ownership check — explicit string comparison (never rely on type coercion)
  if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Unauthorized — this appointment belongs to another doctor', 403);
  }

  // Step 5: No duplicate records per appointment
  const existing = await SessionRecord.findOne({ appointment: appointmentId });
  if (existing) {
    throw new AppError('A session record already exists for this appointment', 409);
  }

  // Step 6: Create the record. First submission is the signed record — editHistory starts empty.
  const record = await SessionRecord.create({
    ...recordData,
    appointment: appointmentId,
    doctor: doctorProfile._id,
    patient: appointment.patient,
    doctorSignedAt: new Date(),
    editHistory: [],
    isArchived: false,
  });

  const doctorName = doctorProfile.user?.name || 'Your physiotherapist';

  // Step 7: Fire follow-up notification (fire-and-forget — ADR-006: never await)
  if (recordData.followUpRecommendation?.recommended === true) {
    const suggestedDateDisplay = recordData.followUpRecommendation.suggestedDate
      ? ` on ${formatDisplayDate(recordData.followUpRecommendation.suggestedDate)}`
      : '';

    createNotification({
      recipientId: appointment.patient,
      type: NOTIFICATION_TYPES.FOLLOW_UP_RECOMMENDED,
      title: 'Follow-Up Recommended',
      message: `Dr. ${doctorName} recommends a follow-up session${suggestedDateDisplay}. Book your next appointment to continue your recovery.`,
      link: `/doctors/${doctorProfile._id}#book`,
      relatedId: appointmentId,
      relatedDoctor: doctorProfile._id,
    });
  }

  // Step 8: Fire session available notification (fire-and-forget — ADR-006)
  if (recordData.isSharedWithPatient !== false) {
    createNotification({
      recipientId: appointment.patient,
      type: NOTIFICATION_TYPES.SESSION_RECORD_AVAILABLE,
      title: 'Session Record Available',
      message: `Your session record from ${formatDisplayDate(appointment.date)} with Dr. ${doctorName} is now available. View your treatment notes and exercise plan.`,
      link: '/patient/appointments',
      relatedId: appointmentId,
    });
  }

  return record;
};

/**
 * Retrieves a session record by appointment ID with role-based access control.
 * Patients can only view shared records for their own appointments.
 * Doctors can view their own records regardless of sharing status.
 * Admins have full read access.
 */
export const getSessionRecordByAppointment = async (appointmentId, requestingUserId, requestingRole) => {
  const record = await SessionRecord.findOne({
    appointment: appointmentId,
    isArchived: { $ne: true },
  })
    .populate('appointment', 'date startTime endTime consultationFee')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name profileImage' },
    });

  if (!record) {
    throw new AppError('No session record found for this appointment', 404);
  }

  if (requestingRole === 'patient') {
    if (record.patient.toString() !== requestingUserId.toString()) {
      throw new AppError('Access denied — this is not your appointment', 403);
    }
    if (!record.isSharedWithPatient) {
      throw new AppError('This record has not been shared by your doctor', 403);
    }
  } else if (requestingRole === 'doctor') {
    const doctorProfile = await DoctorProfile.findOne({ user: requestingUserId });
    if (!doctorProfile || record.doctor._id.toString() !== doctorProfile._id.toString()) {
      throw new AppError('Access denied — this record belongs to another doctor', 403);
    }
    // Doctors can view their own records even if isSharedWithPatient is false
  }
  // Admins always allowed

  return record;
};

/**
 * Updates a session record within the 24-hour edit window (measured from doctorSignedAt).
 * Appends an editHistory entry for compliance auditing.
 * Guards against modification of immutable fields.
 */
export const updateSessionRecord = async (doctorUserId, appointmentId, updateData) => {
  const record = await SessionRecord.findOne({
    appointment: appointmentId,
    isArchived: { $ne: true },
  });
  if (!record) {
    throw new AppError('Session record not found', 404);
  }

  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId });
  if (!doctorProfile || record.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Unauthorized — this is not your record', 403);
  }

  // 24-hour window check — use doctorSignedAt (clinical signature moment), not createdAt
  const msElapsed = Date.now() - new Date(record.doctorSignedAt).getTime();
  if (msElapsed > EDIT_WINDOW_MS) {
    throw new AppError('Session records can only be edited within 24 hours of signing', 403);
  }

  // Compute which editable top-level fields are present in this update (for audit)
  const changedFields = Object.keys(updateData).filter((k) => EDITABLE_FIELDS.includes(k));

  // Strip immutable fields — never allow overwriting core refs or audit fields
  const IMMUTABLE = ['appointment', 'doctor', 'patient', 'doctorSignedAt', 'editHistory', 'isArchived', 'archivedAt', 'archivedBy'];
  const sanitizedUpdate = {};
  for (const key of changedFields) {
    if (!IMMUTABLE.includes(key)) {
      sanitizedUpdate[key] = updateData[key];
    }
  }

  // Atomic update per ADR-001 pattern: findOneAndUpdate
  const editEntry = { editedAt: new Date(), changedFields };

  const updatedRecord = await SessionRecord.findOneAndUpdate(
    { appointment: appointmentId, isArchived: { $ne: true } },
    {
      ...sanitizedUpdate,
      $push: { editHistory: editEntry },
    },
    { new: true, runValidators: true }
  );

  return updatedRecord;
};

/**
 * Returns a paginated list of session records for the authenticated doctor.
 * Optionally filtered by patientId.
 */
export const getDoctorSessionHistory = async (doctorUserId, { patientId, page = 1, limit = 10 }) => {
  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found', 404);
  }

  const query = { doctor: doctorProfile._id, isArchived: { $ne: true } };
  if (patientId) {
    query.patient = new mongoose.Types.ObjectId(patientId);
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Parallel queries: records + total count (same DB round trip cost, faster wall time)
  const [records, total] = await Promise.all([
    SessionRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('appointment', 'date startTime endTime consultationFee')
      .populate('patient', 'name profileImage')
      .lean(),
    SessionRecord.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Returns a paginated patient care timeline with optional filters and summary metrics.
 * Summary metrics (totalSessions, doctorsSeen, latestProgressRating) are computed
 * in parallel with the paginated query — one round trip, not three.
 */
export const getPatientCareTimeline = async (patientUserId, { doctorId, dateFrom, dateTo, page = 1, limit = 10 }) => {
  // Base query — only shared, non-archived records
  const query = {
    patient: patientUserId,
    isSharedWithPatient: true,
    isArchived: { $ne: true },
  };

  // Optional filters
  if (doctorId) {
    query.doctor = new mongoose.Types.ObjectId(doctorId);
  }
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(`${dateTo}T23:59:59Z`);
  }

  // Summary always uses the unfiltered base query for accuracy
  const summaryQuery = {
    patient: patientUserId,
    isSharedWithPatient: true,
    isArchived: { $ne: true },
  };

  const skip = (Number(page) - 1) * Number(limit);

  // All queries in parallel — single DB round trip
  const [records, total, uniqueDoctors, totalSessions, latestRecord] = await Promise.all([
    SessionRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('appointment', 'date startTime endTime consultationFee')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name profileImage' },
        select: 'specialization clinicName user',
      })
      .lean(),
    SessionRecord.countDocuments(query),
    SessionRecord.distinct('doctor', summaryQuery),
    SessionRecord.countDocuments(summaryQuery),
    SessionRecord.findOne(summaryQuery)
      .sort({ createdAt: -1 })
      .select('progressRating')
      .lean(),
  ]);

  return {
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    summary: {
      totalSessions,
      doctorsSeen: uniqueDoctors.length,
      latestProgressRating: latestRecord?.progressRating ?? null,
    },
  };
};

/**
 * Admin-only soft archive. Hides record from patient and doctor views.
 * Never hard-deletes — records remain in DB for compliance and dispute resolution.
 */
export const archiveSessionRecord = async (adminUserId, appointmentId) => {
  const record = await SessionRecord.findOne({ appointment: appointmentId });
  if (!record) {
    throw new AppError('Session record not found', 404);
  }
  if (record.isArchived) {
    throw new AppError('Session record is already archived', 409);
  }

  // Atomic update per ADR-001 pattern
  const updated = await SessionRecord.findOneAndUpdate(
    { appointment: appointmentId },
    {
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: adminUserId,
    },
    { new: true }
  );

  return updated;
};
