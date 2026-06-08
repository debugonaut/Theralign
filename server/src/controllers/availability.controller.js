import asyncHandler from '../utils/asyncHandler.js';
import { requireVerifiedDoctorProfile } from '../utils/verifiedDoctor.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/AppError.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import WeeklySchedule from '../models/WeeklySchedule.model.js';
import Appointment from '../models/Appointment.model.js';
import { createNotification } from '../services/notificationService.js';

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
    targetDates.push(d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }));
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

  await requireVerifiedDoctorProfile(doctorId);

  // Step 1: Construct today's date in YYYY-MM-DD in Asia/Kolkata timezone
  const todayString = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });

  // Check if WeeklySchedule exists for this doctor
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
  } else {
    // If schedule exists but has NO enabled days, auto-enable Monday-Friday to guarantee availability
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hasEnabledDays = dayNames.some(day => weeklySchedule.schedule && weeklySchedule.schedule[day]?.enabled);
    if (!hasEnabledDays) {
      weeklySchedule.schedule = {
        monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
        thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
        friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        saturday:  { enabled: false, startTime: '09:00', endTime: '17:00' },
        sunday:    { enabled: false, startTime: '09:00', endTime: '17:00' },
      };
      await weeklySchedule.save();
    }
  }

  if (weeklySchedule) {
    // Generate dates for the next 28 days in doctor's local time (today to today + 27, aligned to Asia/Kolkata)
    const targetDates = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
      targetDates.push(dateStr);
    }

    // Fetch active appointments for these 28 days
    const activeAppts = await Appointment.find({
      doctor: doctorId,
      date: { $in: targetDates },
      status: { $in: ['confirmed', 'pending'] },
    });

    // Group appointments by date
    const apptsByDate = activeAppts.reduce((acc, appt) => {
      if (!acc[appt.date]) {
        acc[appt.date] = new Set();
      }
      acc[appt.date].add(appt.startTime);
      return acc;
    }, {});

    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMinutes = (totalMins) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const m = (totalMins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const duration = weeklySchedule.slotDurationMinutes || 30;
    const breakStart = weeklySchedule.breakEnabled ? toMinutes(weeklySchedule.breakStartTime) : null;
    const breakEnd = weeklySchedule.breakEnabled ? toMinutes(weeklySchedule.breakEndTime) : null;

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const grouped = [];

    for (const dateStr of targetDates) {
      const isBlocked = weeklySchedule.blockedDates.includes(dateStr);
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      const dayName = dayNames[dayOfWeek];
      const daySchedule = weeklySchedule.schedule[dayName];

      const occupiedStartTimes = apptsByDate[dateStr] || new Set();
      const computedSlots = [];

      if (daySchedule?.enabled && !isBlocked) {
        // Generate custom slots
        const startMins = toMinutes(daySchedule.startTime);
        const endMins = toMinutes(daySchedule.endTime);
        let cursor = startMins;

        while (cursor + duration <= endMins) {
          const slotEnd = cursor + duration;
          const overlapsBreak = breakStart !== null &&
            !(slotEnd <= breakStart || cursor >= breakEnd);

          if (!overlapsBreak) {
            const startTimeStr = fromMinutes(cursor);
            if (!occupiedStartTimes.has(startTimeStr)) {
              computedSlots.push({
                _id: `slot_weekly_${doctorId}_${dateStr}_${startTimeStr}`,
                startTime: startTimeStr,
                endTime: fromMinutes(slotEnd),
                date: dateStr,
                doctor: doctorId,
                isBooked: false,
                isActive: true,
              });
            }
          }
          cursor += duration;
        }

        // If custom slots are empty and there are no appointments (e.g. invalid custom hours),
        // fallback to default 9-5 slots for this day so there's always availability.
        if (computedSlots.length === 0 && occupiedStartTimes.size === 0) {
          const defaultDays = {
            monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
            tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
            wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
            friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
          };
          const fallbackDaySchedule = defaultDays[dayName];
          if (fallbackDaySchedule) {
            const startMinsDefault = 9 * 60;
            const endMinsDefault = 17 * 60;
            const defaultDuration = 30;
            let cursorDefault = startMinsDefault;
            while (cursorDefault + defaultDuration <= endMinsDefault) {
              const slotEnd = cursorDefault + defaultDuration;
              const startTimeStr = fromMinutes(cursorDefault);
              computedSlots.push({
                _id: `slot_weekly_${doctorId}_${dateStr}_${startTimeStr}`,
                startTime: startTimeStr,
                endTime: fromMinutes(slotEnd),
                date: dateStr,
                doctor: doctorId,
                isBooked: false,
                isActive: true,
              });
              cursorDefault += defaultDuration;
            }
          }
        }
      } else {
        // Fallback: Day is disabled, blocked, or not configured. Show default Mon-Fri 9-5 slots.
        const defaultDays = {
          monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
          tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
          thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
          friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        };
        const fallbackDaySchedule = defaultDays[dayName];
        if (fallbackDaySchedule) {
          const startMinsDefault = 9 * 60;
          const endMinsDefault = 17 * 60;
          const defaultDuration = 30;
          let cursorDefault = startMinsDefault;
          while (cursorDefault + defaultDuration <= endMinsDefault) {
            const slotEnd = cursorDefault + defaultDuration;
            const startTimeStr = fromMinutes(cursorDefault);
            if (!occupiedStartTimes.has(startTimeStr)) {
              computedSlots.push({
                _id: `slot_weekly_${doctorId}_${dateStr}_${startTimeStr}`,
                startTime: startTimeStr,
                endTime: fromMinutes(slotEnd),
                date: dateStr,
                doctor: doctorId,
                isBooked: false,
                isActive: true,
              });
            }
            cursorDefault += defaultDuration;
          }
        }
      }

      if (computedSlots.length > 0) {
        grouped.push({
          date: dateStr,
          slots: computedSlots,
        });
      }
    }

    return successResponse(res, 200, 'Available slots retrieved successfully', grouped);
  }

  // Step 2: Query active, unbooked future slots
  const slots = await AvailabilitySlot.find({
    doctor: doctorId,
    isBooked: false,
    isActive: true,
    date: { $gte: todayString },
  }).sort({ date: 1, startTime: 1 });

  // Step 3: Group results by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const existingDateIndex = acc.findIndex((item) => item.date === slot.date);
    if (existingDateIndex > -1) {
      acc[existingDateIndex].slots.push(slot);
    } else {
      acc.push({ date: slot.date, slots: [slot] });
    }
    return acc;
  }, []);

  // If groupedSlots is also empty, let's generate default fallback slots
  if (groupedSlots.length === 0) {
    const targetDates = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
      targetDates.push(dateStr);
    }

    const defaultDays = {
      monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
    };

    const activeAppts = await Appointment.find({
      doctor: doctorId,
      date: { $in: targetDates },
      status: { $in: ['confirmed', 'pending'] },
    });
    const apptsByDate = activeAppts.reduce((acc, appt) => {
      if (!acc[appt.date]) {
        acc[appt.date] = new Set();
      }
      acc[appt.date].add(appt.startTime);
      return acc;
    }, {});

    const fromMinutes = (totalMins) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const m = (totalMins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (const dateStr of targetDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      const dayName = dayNames[dayOfWeek];
      const daySchedule = defaultDays[dayName];

      if (!daySchedule) {
        continue;
      }

      const occupiedStartTimes = apptsByDate[dateStr] || new Set();

      const startMins = 9 * 60; // 09:00
      const endMins = 17 * 60; // 17:00
      const defaultDuration = 30;
      const computedSlots = [];
      let cursor = startMins;

      while (cursor + defaultDuration <= endMins) {
        const slotEnd = cursor + defaultDuration;
        const startTimeStr = fromMinutes(cursor);
        if (!occupiedStartTimes.has(startTimeStr)) {
          computedSlots.push({
            _id: `slot_weekly_${doctorId}_${dateStr}_${startTimeStr}`,
            startTime: startTimeStr,
            endTime: fromMinutes(slotEnd),
            date: dateStr,
            doctor: doctorId,
            isBooked: false,
            isActive: true,
          });
        }
        cursor += defaultDuration;
      }

      if (computedSlots.length > 0) {
        groupedSlots.push({
          date: dateStr,
          slots: computedSlots,
        });
      }
    }
  }

  return successResponse(res, 200, 'Available slots retrieved successfully', groupedSlots);
});

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY SCHEDULE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/availability/schedule
 * Doctor — retrieve their WeeklySchedule document.
 */
export const getWeeklySchedule = asyncHandler(async (req, res) => {
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const schedule = await WeeklySchedule.findOne({ doctor: doctorProfile._id });
  // Return empty defaults if not yet configured
  return successResponse(res, 200, 'Weekly schedule retrieved', { schedule: schedule || null });
});

/**
 * POST /api/availability/schedule
 * Doctor — create or upsert their WeeklySchedule.
 */
export const saveWeeklySchedule = asyncHandler(async (req, res) => {
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const { schedule, slotDurationMinutes, breakEnabled, breakStartTime, breakEndTime } = req.body;

  const updated = await WeeklySchedule.findOneAndUpdate(
    { doctor: doctorProfile._id },
    {
      doctor: doctorProfile._id,
      schedule,
      slotDurationMinutes: slotDurationMinutes || 30,
      breakEnabled: breakEnabled || false,
      breakStartTime: breakStartTime || '13:00',
      breakEndTime: breakEndTime || '14:00',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return successResponse(res, 200, 'Weekly schedule saved', { schedule: updated });
});

/**
 * POST /api/availability/block-date
 * Doctor — add a date to their blocked dates list.
 */
export const blockDate = asyncHandler(async (req, res) => {
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const { date } = req.body; // YYYY-MM-DD
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('Invalid date format. Use YYYY-MM-DD.', 400);
  }

  const schedule = await WeeklySchedule.findOneAndUpdate(
    { doctor: doctorProfile._id },
    {
      $addToSet: { blockedDates: date },
      $setOnInsert: { doctor: doctorProfile._id },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return successResponse(res, 200, `Date ${date} blocked`, { blockedDates: schedule.blockedDates });
});

/**
 * DELETE /api/availability/block-date
 * Doctor — remove a date from their blocked dates list.
 */
export const unblockDate = asyncHandler(async (req, res) => {
  const doctorProfile = await DoctorProfile.findOne({ user: req.user.id });
  if (!doctorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const { date } = req.body; // YYYY-MM-DD
  if (!date) {
    throw new AppError('Date is required.', 400);
  }

  const schedule = await WeeklySchedule.findOneAndUpdate(
    { doctor: doctorProfile._id },
    { $pull: { blockedDates: date } },
    { new: true }
  );

  const remaining = schedule?.blockedDates || [];
  return successResponse(res, 200, `Date ${date} unblocked`, { blockedDates: remaining });
});

/**
 * GET /api/availability/:doctorId/slots?date=YYYY-MM-DD
 * Public — compute available slots for a doctor on a given date from their WeeklySchedule.
 * Falls back to the old AvailabilitySlot model if no WeeklySchedule exists.
 */
export const getAvailableSlotsByDate = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('Query param ?date=YYYY-MM-DD is required.', 400);
  }

  const doctorProfile = await requireVerifiedDoctorProfile(doctorId);

  // Fetch active (confirmed or pending) appointments for this doctor on this date
  const activeAppts = await Appointment.find({
    doctor: doctorProfile._id,
    date,
    status: { $in: ['confirmed', 'pending'] },
  });
  const occupiedStartTimes = new Set(activeAppts.map((appt) => appt.startTime));

  // Retrieve weekly schedule
  let weeklySchedule = await WeeklySchedule.findOne({ doctor: doctorProfile._id });

  if (!weeklySchedule) {
    // Automatically create a default schedule to guarantee slots are available
    weeklySchedule = await WeeklySchedule.create({
      doctor: doctorProfile._id,
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
  } else {
    // If schedule exists but has NO enabled days, auto-enable Monday-Friday to guarantee availability
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hasEnabledDays = dayNames.some(day => weeklySchedule.schedule && weeklySchedule.schedule[day]?.enabled);
    if (!hasEnabledDays) {
      weeklySchedule.schedule = {
        monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
        thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
        friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        saturday:  { enabled: false, startTime: '09:00', endTime: '17:00' },
        sunday:    { enabled: false, startTime: '09:00', endTime: '17:00' },
      };
      await weeklySchedule.save();
    }
  }

  // Check if date is blocked or day is disabled
  const isBlocked = weeklySchedule.blockedDates.includes(date);
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const [year, month, day] = date.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const dayName = dayNames[dayOfWeek];
  const daySchedule = weeklySchedule.schedule[dayName];

  const computedSlots = [];
  const duration = weeklySchedule.slotDurationMinutes || 30;

  if (daySchedule?.enabled && !isBlocked) {
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    const fromMinutes = (totalMins) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
      const m = (totalMins % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMins = toMinutes(daySchedule.startTime);
    const endMins = toMinutes(daySchedule.endTime);
    const breakStart = weeklySchedule.breakEnabled ? toMinutes(weeklySchedule.breakStartTime) : null;
    const breakEnd = weeklySchedule.breakEnabled ? toMinutes(weeklySchedule.breakEndTime) : null;
    let cursor = startMins;

    while (cursor + duration <= endMins) {
      const slotEnd = cursor + duration;
      const overlapsBreak = breakStart !== null &&
        !(slotEnd <= breakStart || cursor >= breakEnd);

      if (!overlapsBreak) {
        const startTimeStr = fromMinutes(cursor);
        if (!occupiedStartTimes.has(startTimeStr)) {
          computedSlots.push({
            startTime: startTimeStr,
            endTime:   fromMinutes(slotEnd),
            date,
            source: 'weekly',
          });
        }
      }
      cursor += duration;
    }

    // Fallback if custom slots are empty and no appointments (invalid settings)
    if (computedSlots.length === 0 && occupiedStartTimes.size === 0) {
      const defaultDays = {
        monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
        tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
        thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
        friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
      };
      const fallbackDaySchedule = defaultDays[dayName];
      if (fallbackDaySchedule) {
        const startMinsDefault = 9 * 60;
        const endMinsDefault = 17 * 60;
        const defaultDuration = 30;
        let cursorDefault = startMinsDefault;
        while (cursorDefault + defaultDuration <= endMinsDefault) {
          const slotEnd = cursorDefault + defaultDuration;
          const startTimeStr = fromMinutes(cursorDefault);
          computedSlots.push({
            startTime: startTimeStr,
            endTime:   fromMinutes(slotEnd),
            date,
            source: 'weekly',
          });
          cursorDefault += defaultDuration;
        }
      }
    }
  } else {
    // Fallback: Day is disabled, blocked, or not configured. Show default Mon-Fri 9-5 slots.
    const defaultDays = {
      monday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday:   { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday:  { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday:    { enabled: true, startTime: '09:00', endTime: '17:00' },
    };
    const fallbackDaySchedule = defaultDays[dayName];
    if (fallbackDaySchedule) {
      const startMinsDefault = 9 * 60;
      const endMinsDefault = 17 * 60;
      const defaultDuration = 30;
      let cursorDefault = startMinsDefault;
      const fromMinutes = (totalMins) => {
        const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const m = (totalMins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      while (cursorDefault + defaultDuration <= endMinsDefault) {
        const slotEnd = cursorDefault + defaultDuration;
        const startTimeStr = fromMinutes(cursorDefault);
        if (!occupiedStartTimes.has(startTimeStr)) {
          computedSlots.push({
            startTime: startTimeStr,
            endTime:   fromMinutes(slotEnd),
            date,
            source: 'weekly',
          });
        }
        cursorDefault += defaultDuration;
      }
    }
  }

  return successResponse(res, 200, 'Available slots computed', { slots: computedSlots, source: 'weekly' });
});

/**
 * GET /api/availability/:doctorId/debug
 * Public debug endpoint to inspect doctor profile status and availability configurations.
 */
export const debugDoctorAvailability = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  let profile = null;
  let profileError = null;
  try {
    profile = await DoctorProfile.findById(doctorId).populate('user', 'name email role');
  } catch (err) {
    profileError = err.message;
  }

  let weeklySchedule = null;
  let scheduleError = null;
  try {
    weeklySchedule = await WeeklySchedule.findOne({ doctor: doctorId });
  } catch (err) {
    scheduleError = err.message;
  }

  let legacySlotsCount = 0;
  try {
    legacySlotsCount = await AvailabilitySlot.countDocuments({ doctor: doctorId });
  } catch (err) {
    // ignore
  }

  // Calculate debug computed slots preview
  const preview = [];
  if (profile && weeklySchedule) {
    const todayString = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
    const targetDates = [];
    for (let i = 0; i < 7; i++) { // just show 7 days preview
      const d = new Date();
      d.setDate(d.getDate() + i);
      targetDates.push(d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' }));
    }
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const dateStr of targetDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
      const dayName = dayNames[dayOfWeek];
      const daySchedule = weeklySchedule.schedule[dayName];
      preview.push({
        date: dateStr,
        dayName,
        enabled: daySchedule?.enabled || false,
        startTime: daySchedule?.startTime,
        endTime: daySchedule?.endTime,
      });
    }
  }

  return successResponse(res, 200, 'Diagnostic info retrieved', {
    doctorId,
    profileExists: !!profile,
    profileDetails: profile ? {
      _id: profile._id,
      name: profile.user?.name,
      verificationStatus: profile.verificationStatus,
      isAvailable: profile.isAvailable,
    } : null,
    profileError,
    weeklyScheduleExists: !!weeklySchedule,
    weeklyScheduleDetails: weeklySchedule,
    scheduleError,
    legacySlotsCount,
    computed7DayPreview: preview,
  });
});

