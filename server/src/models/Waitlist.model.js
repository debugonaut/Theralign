import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor reference is required'],
    },
    notified: {
      type: Boolean,
      default: false, // Set to true once they are notified of opening slots
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce unique index for patient-doctor combination to ensure single entry idempotency
waitlistSchema.index({ patient: 1, doctor: 1 }, { unique: true });

// Index for scanning unnotified waitlists quickly
waitlistSchema.index({ doctor: 1, notified: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
