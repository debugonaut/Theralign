import mongoose from 'mongoose';

const exercisePrescriptionItemSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true, trim: true },
  exerciseLibraryId: {
    type: String,
    default: null,
    // exercise.id from exerciseLibrary.js — null for manually typed exercises
  },
  sets:                 { type: Number, min: 1, default: null },
  reps:                 { type: Number, min: 1, default: null },
  frequency:            { type: String, default: null },  // e.g. 'twice daily', '3x per week'
  duration:             { type: String, default: null },  // e.g. '30 seconds', '10 minutes' (hold time)
  prescriptionDuration: { type: String, default: null },  // e.g. '2 weeks', '1 month' (overall duration)
  notes:                { type: String, default: null }
}, { _id: true });

const sessionRecordSchema = new mongoose.Schema({

  // ── Core references ──────────────────────────────────
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true  // One record per appointment — enforced at DB level (ADR-007)
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Clinical fields ───────────────────────────────────
  presentingCondition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  treatmentProvided: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  progressRating: {
    type: String,
    required: true,
    enum: ['worse', 'no_change', 'slight_improvement', 'significant_improvement', 'resolved']
  },
  painScoreBefore: { type: Number, min: 0, max: 10, default: null },
  painScoreAfter:  { type: Number, min: 0, max: 10, default: null },
  exercisePrescription: {
    type: [exercisePrescriptionItemSchema],
    default: []
  },
  medications: {
    type: [String],
    default: []
  },
  clinicalObservations: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: null
  },
  followUpRecommendation: {
    recommended:   { type: Boolean, default: false },
    intervalDays:  { type: Number, default: null },   // e.g. 7, 14, 30
    suggestedDate: { type: String, default: null },   // YYYY-MM-DD string — ADR-005
    sessionGoal:   { type: String, default: null }    // What to achieve next session
  },

  // ── Visibility ────────────────────────────────────────
  isSharedWithPatient: {
    type: Boolean,
    default: true  // Shared by default — doctor must explicitly opt out
  },

  // ── Audit fields ─────────────────────────────────────
  doctorSignedAt: {
    type: Date,
    default: null  // Set at creation time — used for 24-hour edit window
  },

  // Every time the doctor edits within the 24-hour window, append a record here.
  // Enables compliance review if a patient disputes a change.
  editHistory: [{
    editedAt:      { type: Date, required: true },
    changedFields: { type: [String], required: true }
  }],

  // Soft archive — admin-only. Never hard-delete session records.
  // Archived records are hidden from patient/doctor views but remain in DB
  // for compliance and dispute resolution.
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt:   { type: Date, default: null },
  archivedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────
sessionRecordSchema.index({ appointment: 1 }, { unique: true });
sessionRecordSchema.index({ doctor: 1 });
sessionRecordSchema.index({ patient: 1 });
// Compound index for patient timeline query (highest-traffic read path)
sessionRecordSchema.index({ patient: 1, isSharedWithPatient: 1, createdAt: -1 });
// Compound index for doctor history query
sessionRecordSchema.index({ doctor: 1, createdAt: -1 });

const SessionRecord = mongoose.model('SessionRecord', sessionRecordSchema);
export default SessionRecord;
