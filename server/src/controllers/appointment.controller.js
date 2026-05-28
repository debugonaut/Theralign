import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import Appointment from '../models/Appointment.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';

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

  // Step 1: ATOMIC SLOT LOCK
  const slot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, isBooked: false, isActive: true },
    { $set: { isBooked: true } },
    { new: true }
  );

  if (!slot) {
    throw new AppError('This slot is no longer available.', 409);
  }

  // Step 2: Fetch the DoctorProfile to snapshot consultation fee
  const doctorProfile = await DoctorProfile.findById(slot.doctor);
  if (!doctorProfile) {
    // Rollback slot if doctor is not found
    await AvailabilitySlot.findByIdAndUpdate(slotId, { $set: { isBooked: false } });
    throw new AppError('The doctor profile for this slot does not exist.', 404);
  }

  // Step 3: Calculate financials
  const consultationFee = doctorProfile.consultationFee;
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
      status: 'confirmed',
      consultationFee,
      platformCommission,
      doctorEarnings,
      patientNotes: patientNotes || '',
    });
  } catch (error) {
    // Rollback slot isBooked state
    await AvailabilitySlot.findByIdAndUpdate(slotId, { $set: { isBooked: false } });
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

  return successResponse(res, 200, 'Your appointments retrieved successfully', appointments);
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
    throw new AppError('Doctor profile not found.', 404);
  }

  // Step 2: Fetch appointments
  const appointments = await Appointment.find({ doctor: doctorProfile._id })
    .populate('patient', 'name email phone profileImage')
    .sort({ date: 1, startTime: 1 });

  return successResponse(res, 200, 'Doctor patient appointments retrieved successfully', appointments);
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
  if (appointment.status !== 'confirmed') {
    throw new AppError(`Only confirmed appointments can be cancelled. Current status: ${appointment.status}`, 400);
  }

  // Step 4: Validate date check for patients
  if (role === 'patient') {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    if (appointment.date <= todayString) {
      throw new AppError('Cannot cancel a past or today\'s appointment.', 400);
    }
  }

  // Step 5: Update appointment status
  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || '';
  appointment.cancelledBy = role;
  await appointment.save();

  // Step 6: Unlock slot to be re-booked
  await AvailabilitySlot.findByIdAndUpdate(appointment.slot, { $set: { isBooked: false } });

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
