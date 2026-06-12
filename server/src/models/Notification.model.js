import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
    },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_cancelled',
        'appointment_completed',
        'review_received',
        'verification_approved',
        'verification_rejected',
        'document_uploaded',
        // Phase 15 — Session Records
        'session_record_available',
        'follow_up_recommended',
      ],
      required: [true, 'Notification type is required'],
    },
    title: { 
      type: String, 
      required: [true, 'Title is required'] 
    },
    message: { 
      type: String, 
      required: [true, 'Message body is required'] 
    },
    link: { 
      type: String, 
      default: null 
    }, // Frontend route to navigate to on-click
    isRead: { 
      type: Boolean, 
      default: false 
    },
    relatedId: { 
      type: mongoose.Schema.Types.ObjectId, 
      default: null 
    }, // Can point to appointmentId, reviewId, etc.
    // Phase 15: Links FOLLOW_UP_RECOMMENDED notifications to a DoctorProfile
    // so the frontend can deep-link to /doctors/{id}#book
    relatedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      default: null
    },
  },
  { timestamps: true }
);

// Indexes to speed up polling and recent fetches
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
