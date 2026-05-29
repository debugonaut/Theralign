import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
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
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AvailabilitySlot',
      default: null,
      // Required via booking-flow validation, not schema-level
    },

    // Denormalized for display and cancellation logic without extra joins
    date: { 
      type: String, 
      required: [true, 'Date is required'] 
    },         // "YYYY-MM-DD"
    startTime: { 
      type: String, 
      required: [true, 'Start time is required'] 
    },    // "HH:mm"
    endTime: { 
      type: String, 
      required: [true, 'End time is required'] 
    },      // "HH:mm"

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },

    // Financial snapshot — recorded at booking time, not recalculated later
    consultationFee: { 
      type: Number, 
      required: [true, 'Consultation fee is required'] 
    },
    platformCommission: { 
      type: Number, 
      required: [true, 'Platform commission fee is required'] 
    },  // 10% of consultationFee
    doctorEarnings: { 
      type: Number, 
      required: [true, 'Doctor earnings are required'] 
    },      // 90% of consultationFee

    // Phase 6 (Razorpay) will populate these
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentId: { 
      type: String, 
      default: null 
    },

    patientNotes: { 
      type: String, 
      maxlength: 500, 
      default: '' 
    },
    cancellationReason: { 
      type: String, 
      default: '' 
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', ''],
      default: '',
    },

    // Phase 7 (Reviews) will check this flag before allowing review submission
    reviewSubmitted: { 
      type: Boolean, 
      default: false 
    },

    // Feature F3: Session Documents (prescriptions, clinical notes)
    sessionDocument: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // For deletion in Cloudinary
      uploadedAt: { type: Date, default: null },
      fileName: { type: String, default: null }, // Display name
    },
  },
  { timestamps: true }
);

// Required Indexes
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ slot: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
