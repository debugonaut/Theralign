import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor reference is required'],
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: [true, 'Date string (YYYY-MM-DD) is required'],
    },
    startTime: {
      type: String, // Format: "HH:mm" — e.g., "09:00"
      required: [true, 'Start time string (HH:mm) is required'],
    },
    endTime: {
      type: String, // Format: "HH:mm" — e.g., "09:30"
      required: [true, 'End time string (HH:mm) is required'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate slots for same doctor/date/time
availabilitySlotSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  { unique: true }
);

// Query index — used heavily when fetching available slots for a doctor
availabilitySlotSchema.index({ doctor: 1, date: 1, isBooked: 1 });

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

export default AvailabilitySlot;
