import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import Waitlist from '../models/Waitlist.model.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Helper to notify patients on the waitlist when the doctor adds slot availability.
 */
const notifyWaitlist = async (doctorProfileId, doctorName) => {
  try {
    const waitlistEntries = await Waitlist.find({
      doctor: doctorProfileId,
      notified: false,
    });

    for (const entry of waitlistEntries) {
      createNotification({
        recipientId: entry.patient,
        type: 'appointment_booked', // Reuse closest category
        title: 'New Slots Available',
        message: `Dr. ${doctorName} has added new availability slots. Book now before they fill up!`,
        link: `/doctors/${doctorProfileId}`,
      });

      entry.notified = true;
      entry.notifiedAt = new Date();
      await entry.save();
    }
  } catch (err) {
    console.error('[ERROR] Waitlist notify task failed:', err);
  }
};

/**
 * POST /api/availability/slots
 * Doctor creates a single availability slot.
 * Protect: requireAuth, requireRole('doctor')
 */
export const createSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;

  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found. Please complete your onboarding first.', 404);
  }

  // Step 2: Validate fields are present
  if (!date || !startTime || !endTime) {
    throw new AppError('Please provide date, startTime, and endTime.', 400);
  }

  // Step 3: Validate startTime < endTime
  if (startTime >= endTime) {
    throw new AppError('Start time must be strictly before end time.', 400);
  }

  try {
    // Step 4: Create slot
    const slot = await AvailabilitySlot.create({
      doctor: doctorProfile._id,
      date,
      startTime,
      endTime,
    });

    // Notify waitlisted patients (fire and forget)
    notifyWaitlist(doctorProfile._id, req.user.name);

    return successResponse(res, 201, 'Availability slot created successfully', slot);
  } catch (error) {
    // Handle MongoDB unique duplicate key error (code 11000)
    if (error.code === 11000) {
      throw new AppError('A slot already exists for this date and time.', 409);
    }
    throw error;
  }
});

/**
 * POST /api/availability/slots/recurring
 * Doctor creates weekly recurring availability slots.
 * Protect: requireAuth, requireRole('doctor')
 */
export const createRecurringSlots = asyncHandler(async (req, res) => {
  const { date, startTime, endTime, repeatWeeks } = req.body;

  // Step 1: Validate fields are present
  if (!date || !startTime || !endTime || !repeatWeeks) {
    throw new AppError('Please provide date, startTime, endTime, and repeatWeeks.', 400);
  }

  const repeatWeeksNum = Number(repeatWeeks);
  if (isNaN(repeatWeeksNum) || repeatWeeksNum < 1 || repeatWeeksNum > 12) {
    throw new AppError('repeatWeeks must be a number between 1 and 12.', 400);
  }

  // Step 2: Validate startTime < endTime
  if (startTime >= endTime) {
    throw new AppError('Start time must be strictly before end time.', 400);
  }

  // Step 3: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found. Please complete your onboarding first.', 404);
  }

  // Step 4: Generate weekly dates without timezone shift
  const targetDates = [];
  const baseDate = new Date(date + 'T00:00:00');

  for (let week = 0; week < repeatWeeksNum; week++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + week * 7);
    targetDates.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
  }

  // Step 5: Attempt to create all slots individually, skipping duplicates (index collisions)
  const results = { created: 0, skipped: 0, dates: [] };

  for (const slotDate of targetDates) {
    try {
      const slot = await AvailabilitySlot.create({
        doctor: doctorProfile._id,
        date: slotDate,
        startTime,
        endTime,
      });
      results.created++;
      results.dates.push(slotDate);
    } catch (err) {
      if (err.code === 11000) {
        results.skipped++; // Already exists, skip silently
      } else {
        throw err;
      }
    }
  }

  // Notify waitlisted patients if any slot was successfully created
  if (results.created > 0) {
    notifyWaitlist(doctorProfile._id, req.user.name);
  }

  return successResponse(
    res,
    201,
    `Created ${results.created} slots. Skipped ${results.skipped} duplicates.`,
    results
  );
});

/**
 * GET /api/availability/slots/mine
 * Doctor views their own slots.
 * Protect: requireAuth, requireRole('doctor')
 */
export const getMySlots = asyncHandler(async (req, res) => {
  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    return successResponse(res, 200, 'Your availability slots retrieved successfully', []);
  }

  // Step 2: Query slots and sort chronologically
  const slots = await AvailabilitySlot.find({ doctor: doctorProfile._id }).sort({
    date: 1,
    startTime: 1,
  });

  return successResponse(res, 200, 'Your availability slots retrieved successfully', slots);
});

/**
 * PUT /api/availability/slots/:slotId
 * Doctor updates a slot.
 * Protect: requireAuth, requireRole('doctor')
 */
export const updateSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { startTime, endTime, isActive } = req.body;

  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  // Step 2: Find slot by ID
  const slot = await AvailabilitySlot.findById(slotId);
  if (!slot) {
    throw new AppError('Availability slot not found.', 404);
  }

  // Step 3: Verify slot owner
  if (slot.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Access denied. You do not own this slot.', 403);
  }

  // Step 4: If slot is already booked, prevent modifications
  if (slot.isBooked) {
    throw new AppError('Cannot modify a slot that is already booked.', 400);
  }

  // Step 5: Update allowed fields
  if (startTime !== undefined) slot.startTime = startTime;
  if (endTime !== undefined) slot.endTime = endTime;
  if (isActive !== undefined) slot.isActive = isActive;

  // Step 6: Validate startTime < endTime after update
  if (slot.startTime >= slot.endTime) {
    throw new AppError('Start time must be strictly before end time.', 400);
  }

  await slot.save();

  return successResponse(res, 200, 'Availability slot updated successfully', slot);
});

/**
 * DELETE /api/availability/slots/:slotId
 * Doctor deletes a slot.
 * Protect: requireAuth, requireRole('doctor')
 */
export const deleteSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;

  // Step 1: Find DoctorProfile where user === req.user.id
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  // Step 2: Find slot
  const slot = await AvailabilitySlot.findById(slotId);
  if (!slot) {
    throw new AppError('Availability slot not found.', 404);
  }

  // Step 3: Verify owner
  if (slot.doctor.toString() !== doctorProfile._id.toString()) {
    throw new AppError('Access denied. You do not own this slot.', 403);
  }

  // Step 4: If slot is booked, prevent deleting
  if (slot.isBooked) {
    throw new AppError('Cannot delete a slot with an existing booking.', 400);
  }

  await AvailabilitySlot.findByIdAndDelete(slotId);

  return successResponse(res, 200, 'Slot deleted.');
});

/**
 * GET /api/availability/:doctorId/available
 * Public: Patient views doctor's open slots.
 * Protect: None
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  // Step 1: Construct today's date in YYYY-MM-DD using local timezone values
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  // Step 2: Query active, unbooked future slots
  const slots = await AvailabilitySlot.find({
    doctor: doctorId,
    isBooked: false,
    isActive: true,
    date: { $gte: todayString },
  }).sort({ date: 1, startTime: 1 });

  // Step 3: Group results by date
  const grouped = slots.reduce((acc, slot) => {
    const existingDateIndex = acc.findIndex((item) => item.date === slot.date);
    if (existingDateIndex > -1) {
      acc[existingDateIndex].slots.push(slot);
    } else {
      acc.push({ date: slot.date, slots: [slot] });
    }
    return acc;
  }, []);

  return successResponse(res, 200, 'Available slots retrieved successfully', grouped);
});
