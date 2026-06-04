import mongoose from 'mongoose';

/**
 * WeeklySchedule — stores a doctor's recurring weekly availability pattern.
 *
 * This replaces the day-by-day AvailabilitySlot approach for recurring hours.
 * The patient booking flow queries this model to derive available time slots
 * for any given future date, computing them dynamically from the weekly pattern.
 *
 * Blocked dates are stored here too, so the computation can exclude them.
 */
const dayScheduleSchema = new mongoose.Schema(
  {
    enabled:   { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' }, // HH:MM 24-hr format
    endTime:   { type: String, default: '17:00' },
  },
  { _id: false }
);

const weeklyScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
      unique: true,
      index: true,
    },

    // ─── 7-day schedule ─────────────────────────────────────────────────────
    schedule: {
      monday:    { type: dayScheduleSchema, default: () => ({}) },
      tuesday:   { type: dayScheduleSchema, default: () => ({}) },
      wednesday: { type: dayScheduleSchema, default: () => ({}) },
      thursday:  { type: dayScheduleSchema, default: () => ({}) },
      friday:    { type: dayScheduleSchema, default: () => ({}) },
      saturday:  { type: dayScheduleSchema, default: () => ({}) },
      sunday:    { type: dayScheduleSchema, default: () => ({}) },
    },

    // ─── Slot settings ───────────────────────────────────────────────────────
    slotDurationMinutes: {
      type: Number,
      enum: [30, 45, 60],
      default: 30,
    },

    // ─── Optional break period ───────────────────────────────────────────────
    breakEnabled:    { type: Boolean, default: false },
    breakStartTime:  { type: String, default: '13:00' },
    breakEndTime:    { type: String, default: '14:00' },

    // ─── Blocked dates ───────────────────────────────────────────────────────
    // YYYY-MM-DD strings. Doctor can mark days as unavailable (holidays, etc.)
    blockedDates: [{ type: String }],

    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true }
);

export default mongoose.model('WeeklySchedule', weeklyScheduleSchema);
