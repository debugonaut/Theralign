import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },

    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,       // Populated after payment capture
    },
    razorpaySignature: {
      type: String,
      default: null,       // Populated after signature verification
    },

    amount: {
      type: Number,
      required: true,      // Stored in rupees (not paise) for readability
    },
    currency: {
      type: String,
      default: 'INR',
    },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },

    // Breakdown snapshot (copied from Appointment at payment time)
    platformCommission: { type: Number, required: true },
    doctorEarnings: { type: Number, required: true },

    // Refund tracking
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'pending', 'approved', 'rejected', 'processed'],
      default: 'none',
    },
    refundReason: { type: String, default: '' },
    refundId: { type: String, default: null },       // Razorpay refund ID
    refundAdminNote: { type: String, default: '' },
    adminNote: { type: String, default: '' },
    refundAmount: { type: Number, default: null },
    refundInitiatedBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', null],
      default: null,
    },
    refundRequestedAt: { type: Date, default: null },
    refundProcessedAt: { type: Date, default: null },
    refundResolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Required Indexes
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
