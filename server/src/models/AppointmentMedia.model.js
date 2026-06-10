import mongoose from 'mongoose';

const appointmentMediaSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment reference is required'],
    },
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor'],
      required: [true, 'uploadedBy field is required'],
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required'],
    },
    
    // Media metadata
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: [true, 'Media type is required'],
    },
    fileType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4'],
      required: [true, 'File type is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileSize: {
      type: Number, // in bytes
      required: [true, 'File size is required'],
    },
    
    // Cloudinary storage
    cloudinaryUrl: {
      type: String,
      required: [true, 'Cloudinary URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    
    // Media properties
    duration: {
      type: Number, // in seconds, for video/audio only
      default: null,
    },
    
    // Description or note about the media (optional)
    description: {
      type: String,
      maxlength: 200,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
appointmentMediaSchema.index({ appointment: 1 });
appointmentMediaSchema.index({ uploadedBy: 1 });
appointmentMediaSchema.index({ uploader: 1 });

const AppointmentMedia = mongoose.model('AppointmentMedia', appointmentMediaSchema);

export default AppointmentMedia;
