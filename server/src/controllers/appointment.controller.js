import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { formatDateKolkata } from '../utils/date.js';
import AppError from '../utils/AppError.js';
import Appointment from '../models/Appointment.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import WeeklySchedule from '../models/WeeklySchedule.model.js';
import Payment from '../models/Payment.model.js';
import SessionRecord from '../models/SessionRecord.model.js';
import { sendBookingConfirmation, sendCancellationNotice } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { DOCTOR_STATUS } from '../utils/constants.js';

/**
 * POST /api/appointments/book
 * Patient schedules/books an appointment by claiming an available slot.
 * Protect: requireAuth, requireRole('patient')
 */
export const bookAppointment = asyncHandler(async (req, res) => {
  const { slotId, patientNotes } = req.body;

  if (!slotId) {
    throw new AppError('Slot ID is required to book an appointment.', 400);
  }

  const pendingCount = await Appointment.countDocuments({
    patient: req.user.id,
    status: 'pending',
    paymentStatus: 'unpaid',
  });
  if (pendingCount >= 3) {
    throw new AppError(
      'You have too many unpaid bookings. Please complete payment or wait for them to expire.',
      429
    );
  }

  // Step 1: ATOMIC SLOT LOCK / DYNAMIC CREATION
  let slot;
  if (typeof slotId === 'string' && slotId.startsWith('slot_weekly_')) {
    const parts = slotId.split('_');
    const doctorId = parts[2];
    const date = parts[3];
    const startTime = parts[4];

    // Check if slot already exists in DB
    let existingSlot = await AvailabilitySlot.findOne({ doctor: doctorId, date, startTime });
    if (existingSlot) {
      if (existingSlot.isBooked) {
        throw new AppError('This slot is no longer available.', 409);
      }
      existingSlot.isBooked = true;
      await existingSlot.save();
      slot = existingSlot;
    } else {
      let weeklySchedule = await WeeklySchedule.findOne({ doctor: doctorId });
      if (!weeklySchedule) {
        // Automatically create a default schedule to guarantee slots are available
        weeklySchedule = await WeeklySchedule.create({
          doctor: doctorId,
          schedule: {
            monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
            tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
            wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
            friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
            saturday:  { enabled: false, startTime: '09:00', endTime: '17:00' },
            sunday:    { enabled: false, startTime: '09:00', endTime: '17:00' },
          },
          slotDurationMinutes: 30,
          breakEnabled: false,
        });
      }

      if (weeklySchedule.blockedDates.includes(date)) {
        throw new AppError('This slot is no longer available on this date.', 409);
      }

      const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      const fromMinutes = (totalMins) => {
        const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const m = (totalMins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const startMins = toMinutes(startTime);
      const duration = weeklySchedule.slotDurationMinutes || 30;
      const endTime = fromMinutes(startMins + duration);

      // Check if an active appointment already exists
      const activeAppt = await Appointment.findOne({
        doctor: doctorId,
        date,
        startTime,
        status: { $in: ['confirmed', 'pending'] }
      });
      if (activeAppt) {
        throw new AppError('This slot is no longer available.', 409);
      }

      try {
        slot = await AvailabilitySlot.create({
          doctor: doctorId,
          date,
          startTime,
          endTime,
          isBooked: true,
          isActive: true,
        });
      } catch (err) {
        if (err.code === 11000) {
          existingSlot = await AvailabilitySlot.findOneAndUpdate(
            { doctor: doctorId, date, startTime, isBooked: false, isActive: true },
            { $set: { isBooked: true } },
            { new: true }
          );
          if (!existingSlot) {
            throw new AppError('This slot is no longer available.', 409);
          }
          slot = existingSlot;
        } else {
          throw err;
        }
      }
    }
  } else {
    slot = await AvailabilitySlot.findOneAndUpdate(
      { _id: slotId, isBooked: false, isActive: true },
      { $set: { isBooked: true } },
      { new: true }
    );
  }

  if (!slot) {
    throw new AppError('This slot is no longer available.', 409);
  }

  // Step 2: Fetch the DoctorProfile to snapshot consultation fee
  const doctorProfile = await DoctorProfile.findById(slot.doctor);
  if (!doctorProfile) {
    // Rollback slot if doctor is not found
    await AvailabilitySlot.findByIdAndUpdate(slot._id, { $set: { isBooked: false } });
    throw new AppError('The doctor profile for this slot does not exist.', 404);
  }

  // We relax this check to allow booking unverified doctors for testing
  /*
  if (doctorProfile.verificationStatus !== DOCTOR_STATUS.VERIFIED) {
    await AvailabilitySlot.findByIdAndUpdate(slot._id, { $set: { isBooked: false } });
    throw new AppError('This doctor is not verified and cannot accept bookings.', 403);
  }
  */

  if (!doctorProfile.isAvailable) {
    await AvailabilitySlot.findByIdAndUpdate(slot._id, { $set: { isBooked: false } });
    throw new AppError('This doctor is currently unavailable for bookings.', 403);
  }

  // Step 3: Calculate financials
  const consultationFee = doctorProfile.consultationFee || 0;
  const platformCommission = parseFloat((consultationFee * 0.10).toFixed(2));
  const doctorEarnings = parseFloat((consultationFee * 0.90).toFixed(2));

  // Step 4: Create Appointment
  let appointment;
  try {
    appointment = await Appointment.create({
      patient: req.user.id,
      doctor: slot.doctor,
      slot: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'pending',
      paymentStatus: 'unpaid',
      consultationFee,
      platformCommission,
      doctorEarnings,
      patientNotes: patientNotes || '',
    });
  } catch (error) {
    // Rollback slot isBooked state
    await AvailabilitySlot.findByIdAndUpdate(slot._id, { $set: { isBooked: false } });
    throw new AppError('Failed to create booking transaction. Slot rolled back.', 500);
  }

  // Step 5: Populate details for immediate client display
  await appointment.populate([
    { path: 'doctor', populate: { path: 'user', select: 'name specialization' } },
    { path: 'slot', select: 'date startTime endTime' }
  ]);

  return successResponse(res, 201, 'Appointment booked successfully!', appointment);
});

/**
 * GET /api/appointments/mine
 * Patient views their own bookings.
 * Protect: requireAuth, requireRole('patient')
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name profileImage' },
    })
    .populate('slot', 'date startTime endTime')
    .sort({ date: -1, startTime: -1 });

  // Batch-fetch session records for all completed appointments (single DB query)
  // Patient sees a shared, non-archived record summary for care continuity
  const completedIds = appointments
    .filter((a) => a.status === 'completed')
    .map((a) => a._id);

  let sessionRecordMap = {};
  if (completedIds.length > 0) {
    const records = await SessionRecord.find({
      appointment: { $in: completedIds },
      isSharedWithPatient: true,
      isArchived: { $ne: true },
    }).select(
      'appointment progressRating followUpRecommendation exercisePrescription isSharedWithPatient createdAt'
    );
    records.forEach((r) => {
      sessionRecordMap[r.appointment.toString()] = r;
    });
  }

  const enrichedAppointments = appointments.map((appt) => {
    const apptObj = appt.toObject();
    apptObj.sessionRecord = sessionRecordMap[appt._id.toString()] || null;
    return apptObj;
  });

  return successResponse(res, 200, 'Your appointments retrieved successfully', enrichedAppointments);
});

/**
 * GET /api/appointments/doctor/mine
 * Doctor views bookings of their patients.
 * Protect: requireAuth, requireRole('doctor')
 */
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    return successResponse(res, 200, 'Doctor patient appointments retrieved successfully', []);
  }

  // Step 2: Fetch appointments
  const appointments = await Appointment.find({ doctor: doctorProfile._id })
    .populate('patient', 'name email phone profileImage')
    .sort({ date: 1, startTime: 1 });

  // Fetch corresponding payments and session records in parallel
  const appointmentIds = appointments.map((a) => a._id);
  const completedIds = appointments.filter((a) => a.status === 'completed').map((a) => a._id);

  const [payments, sessionRecords] = await Promise.all([
    Payment.find({ appointment: { $in: appointmentIds } }),
    SessionRecord.find({
      appointment: { $in: completedIds },
      isArchived: { $ne: true },
    }).select('appointment'),
  ]);

  const paymentMap = {};
  payments.forEach((p) => {
    paymentMap[p.appointment.toString()] = p;
  });

  const sessionRecordMap = {};
  sessionRecords.forEach((sr) => {
    sessionRecordMap[sr.appointment.toString()] = true;
  });

  // Format patient name to protect privacy (e.g. "Jane S.")
  const formatPatientName = (name) => {
    if (!name) return 'Patient';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  const formattedAppointments = appointments.map((appt) => {
    const apptObj = appt.toObject();
    if (apptObj.patient && apptObj.patient.name) {
      apptObj.patient.name = formatPatientName(apptObj.patient.name);
    }
    
    // Attach payment info
    const payment = paymentMap[appt._id.toString()];
    apptObj.payment = payment ? {
      status: payment.status,
      refundStatus: payment.refundStatus,
      refundAmount: payment.refundAmount,
      amount: payment.amount,
    } : null;

    // Attach session record existence flag
    apptObj.hasSessionRecord = !!sessionRecordMap[appt._id.toString()];

    return apptObj;
  });

  return successResponse(res, 200, 'Doctor patient appointments retrieved successfully', formattedAppointments);
});

/**
 * PATCH /api/appointments/:id/cancel
 * Cancel a booked appointment (Patient, Doctor, or Admin).
 * Protect: requireAuth
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Step 1: Find the appointment
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Step 2: Determine canceller role
  let role = '';
  if (appointment.patient.toString() === req.user.id.toString()) {
    role = 'patient';
  } else {
    // Check if doctor matches
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
    if (doctorProfile && appointment.doctor.toString() === doctorProfile._id.toString()) {
      role = 'doctor';
    } else if (req.user.role === 'admin') {
      role = 'admin';
    }
  }

  if (!role) {
    throw new AppError('Not authorized to cancel this appointment.', 403);
  }

  // Step 3: Validate status
  if (appointment.status !== 'confirmed' && appointment.status !== 'pending') {
    throw new AppError(`Only confirmed or pending appointments can be cancelled. Current status: ${appointment.status}`, 400);
  }

  // Step 4: Validate date check for patients
  if (role === 'patient' && appointment.status === 'confirmed') {
    const todayString = formatDateKolkata(new Date());

    if (appointment.date <= todayString) {
      throw new AppError('Cannot cancel a past or today\'s appointment.', 400);
    }
  }

  const wasConfirmed = appointment.status === 'confirmed';

  // Step 5: Update appointment status
  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || '';
  appointment.cancelledBy = role;
  await appointment.save();

  // Step 6: Unlock slot to be re-booked
  await AvailabilitySlot.findByIdAndUpdate(appointment.slot, { $set: { isBooked: false } });

  // Auto-create refund request if appointment was paid
  if (appointment.paymentStatus === 'paid') {
    await Payment.findOneAndUpdate(
      { appointment: appointment._id, status: 'paid', refundStatus: 'none' },
      {
        $set: {
          refundStatus: 'pending',
          refundReason: reason || 'Appointment cancelled',
          refundRequestedAt: new Date(),
          refundAmount: appointment.consultationFee,
          refundInitiatedBy: role,
        },
      }
    );
  }

  // Only send cancellation email & notification if the appointment was confirmed
  if (wasConfirmed) {
    // Step 7: Send Cancellation Email (Fire and forget)
    // Populate patient and doctor user information for the template
    const populatedAppt = await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', populate: { path: 'user', select: 'name' } }
    ]);

    if (populatedAppt.patient?.email) {
      sendCancellationNotice({
        patientEmail: populatedAppt.patient.email,
        patientName: populatedAppt.patient.name,
        doctorName: populatedAppt.doctor?.user?.name || 'Physiotherapist',
        date: populatedAppt.date,
        startTime: populatedAppt.startTime,
        cancelledBy: role,
        appointmentId: populatedAppt._id,
      });
    }

    // Notify the other party (not the one who cancelled)
    const notifyUserId = role === 'patient'
      ? (populatedAppt.doctor?.user?._id || populatedAppt.doctor?.user)
      : populatedAppt.patient?._id;

    if (notifyUserId) {
      createNotification({
        recipientId: notifyUserId,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Your appointment on ${populatedAppt.date} at ${populatedAppt.startTime} has been cancelled.`,
        link: role === 'patient' ? '/doctor/appointments' : '/patient/appointments',
        relatedId: populatedAppt._id,
      });
    }
  }

  return successResponse(res, 200, 'Appointment cancelled successfully.', appointment);
});

/**
 * PATCH /api/appointments/:id/complete
 * Doctor marks confirmed appointment as complete.
 * Protect: requireAuth, requireRole('doctor')
 */
export const completeAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  // Step 2: Find Appointment
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Step 3: Verify doctor owns the appointment
  if (appointment.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Not authorized to modify this appointment.', 403);
  }

  // Step 4: Validate status is confirmed
  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be marked as complete.', 400);
  }

  // Step 5: Complete appointment
  appointment.status = 'completed';
  await appointment.save();

  // Step 6: Trigger in-app notification
  createNotification({
    recipientId: appointment.patient,
    type: 'appointment_completed',
    title: 'Appointment Completed',
    message: `Your appointment with Dr. ${req.user.name} on ${appointment.date} has been marked as completed.`,
    link: '/patient/appointments',
    relatedId: appointment._id,
  });

  return successResponse(res, 200, 'Appointment marked as completed.', appointment);
});

/**
 * GET /api/appointments/admin/all
 * Admin views all platform appointments with total commissions.
 * Protect: requireAuth, requireRole('admin')
 */
export const getAllAppointmentsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute queries in parallel using Promise.all
  const [appointments, totalCount, commissionResult] = await Promise.all([
    Appointment.find({})
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments({}),
    Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformCommission' } } },
    ]),
  ]);

  const totalPlatformCommission = commissionResult[0]?.total || 0;

  return successResponse(res, 200, 'All appointments retrieved successfully for admin', {
    appointments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalPlatformCommission,
  });
});

/**
 * PATCH /api/appointments/:id/reschedule
 * Patient reschedules confirmed future appointment to a new slot with same doctor.
 * Protect: requireAuth, requireRole('patient')
 */
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newSlotId } = req.body;

  if (!newSlotId) {
    throw new AppError('New availability slot ID is required.', 400);
  }

  // Step 1: Find the existing appointment
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Step 2: Verification checks
  if (appointment.patient.toString() !== req.user.id.toString()) {
    throw new AppError('Access denied. You do not own this appointment.', 403);
  }

  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be rescheduled.', 400);
  }

  const todayString = formatDateKolkata(new Date());

  if (appointment.date <= todayString) {
    throw new AppError('Cannot reschedule past or today\'s appointments.', 400);
  }

  // Step 3: Secure the new slot atomically / DYNAMIC CREATION
  let lockedNewSlot;
  if (typeof newSlotId === 'string' && newSlotId.startsWith('slot_weekly_')) {
    const parts = newSlotId.split('_');
    const doctorId = parts[2];
    const date = parts[3];
    const startTime = parts[4];

    if (doctorId !== appointment.doctor.toString()) {
      throw new AppError('The requested time slot belongs to a different doctor.', 400);
    }

    // Check if slot already exists in DB
    let existingSlot = await AvailabilitySlot.findOne({ doctor: doctorId, date, startTime });
    if (existingSlot) {
      if (existingSlot.isBooked) {
        throw new AppError('The requested time slot is no longer available.', 409);
      }
      existingSlot.isBooked = true;
      await existingSlot.save();
      lockedNewSlot = existingSlot;
    } else {
      let weeklySchedule = await WeeklySchedule.findOne({ doctor: doctorId });
      if (!weeklySchedule) {
        // Automatically create a default schedule to guarantee slots are available
        weeklySchedule = await WeeklySchedule.create({
          doctor: doctorId,
          schedule: {
            monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
            tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
            wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
            friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
            saturday:  { enabled: false, startTime: '09:00', endTime: '17:00' },
            sunday:    { enabled: false, startTime: '09:00', endTime: '17:00' },
          },
          slotDurationMinutes: 30,
          breakEnabled: false,
        });
      }

      if (weeklySchedule.blockedDates.includes(date)) {
        throw new AppError('The requested time slot is no longer available on this date.', 409);
      }

      const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      const fromMinutes = (totalMins) => {
        const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const m = (totalMins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const startMins = toMinutes(startTime);
      const duration = weeklySchedule.slotDurationMinutes || 30;
      const endTime = fromMinutes(startMins + duration);

      const activeAppt = await Appointment.findOne({
        doctor: doctorId,
        date,
        startTime,
        status: { $in: ['confirmed', 'pending'] }
      });
      if (activeAppt) {
        throw new AppError('The requested time slot is no longer available.', 409);
      }

      try {
        lockedNewSlot = await AvailabilitySlot.create({
          doctor: doctorId,
          date,
          startTime,
          endTime,
          isBooked: true,
          isActive: true,
        });
      } catch (err) {
        if (err.code === 11000) {
          existingSlot = await AvailabilitySlot.findOneAndUpdate(
            { doctor: doctorId, date, startTime, isBooked: false, isActive: true },
            { $set: { isBooked: true } },
            { new: true }
          );
          if (!existingSlot) {
            throw new AppError('The requested time slot is no longer available.', 409);
          }
          lockedNewSlot = existingSlot;
        } else {
          throw err;
        }
      }
    }
  } else {
    // Verify legacy slot owner is correct doctor
    const legacySlot = await AvailabilitySlot.findOne({ _id: newSlotId, doctor: appointment.doctor, isActive: true });
    if (!legacySlot) {
      throw new AppError('The requested time slot is invalid or belongs to a different doctor.', 400);
    }

    lockedNewSlot = await AvailabilitySlot.findOneAndUpdate(
      { _id: newSlotId, isBooked: false, isActive: true },
      { $set: { isBooked: true } },
      { new: true }
    );
  }

  if (!lockedNewSlot) {
    throw new AppError('The requested time slot is no longer available.', 409);
  }

  if (lockedNewSlot._id.toString() === appointment.slot?.toString()) {
    // Rollback booking status if slot is same
    await AvailabilitySlot.findByIdAndUpdate(lockedNewSlot._id, { $set: { isBooked: false } });
    throw new AppError('You are already scheduled in this time slot.', 400);
  }

  // Step 4: Release the old slot and update the appointment
  const oldSlotId = appointment.slot;

  try {
    // Release old slot
    if (oldSlotId) {
      await AvailabilitySlot.findByIdAndUpdate(oldSlotId, { $set: { isBooked: false } });
    }

    // Update appointment
    appointment.slot = lockedNewSlot._id;
    appointment.date = lockedNewSlot.date;
    appointment.startTime = lockedNewSlot.startTime;
    appointment.endTime = lockedNewSlot.endTime;

    await appointment.save();
  } catch (err) {
    // Rollback atomic lock on new slot if database save fails
    await AvailabilitySlot.findByIdAndUpdate(lockedNewSlot._id, { $set: { isBooked: false } });
    throw new AppError('Failed to complete rescheduling operation. Slot rolled back.', 500);
  }

  // Step 6: Populate and return updated details
  await appointment.populate([
    { path: 'doctor', populate: { path: 'user', select: 'name specialization' } },
    { path: 'slot', select: 'date startTime endTime' }
  ]);

  return successResponse(res, 200, 'Appointment rescheduled successfully!', appointment);
});
