import mongoose from 'mongoose';
import { DOCTOR_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

const doctorProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true, // Enforces 1-to-1 doctor-to-profile relationship
    },

    specialization: {
      type: [String],
      required: [true, 'At least one specialization is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A doctor must have at least one specialization',
      },
    },

    experience: {
      type: Number,
      required: [true, 'Experience (in years) is required'],
      min: [0, 'Experience cannot be negative'],
    },

    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },

    clinicAddress: {
      type: String,
      required: [true, 'Clinic address is required'],
      trim: true,
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    clinicLocation: {
      type: {
        type: String,
        enum: {
          values: ['Point'],
          message: 'clinicLocation type must be "Point"',
        },
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Geospatial coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          },
          message: 'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]',
        },
      },
    },

    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },

    bio: {
      type: String,
      required: [true, 'Professional biography is required'],
      minlength: [50, 'Biography must be at least 50 characters long'],
      maxlength: [1000, 'Biography must not exceed 1000 characters'],
    },

    registrationNumber: {
      type: String,
      required: [true, 'Medical license registration number is required'],
      unique: true,
      trim: true,
    },

    degreeDocument: {
      type: String, // Cloudinary URL
      required: [true, 'Degree document is required'],
    },

    licenseDocument: {
      type: String, // Cloudinary URL
      required: [true, 'Medical license document is required'],
    },

    verificationStatus: {
      type: String,
      enum: {
        values: [DOCTOR_STATUS.PENDING, DOCTOR_STATUS.VERIFIED, DOCTOR_STATUS.REJECTED],
        message: 'Invalid verification status',
      },
      default: DOCTOR_STATUS.PENDING,
      required: true,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    verificationNote: {
      type: String,
      default: null,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative'],
    },

    qualifications: {
      type: [String],
      default: [],
    },

    languages: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    aiSummary: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// clinicLocation 2dsphere index is CRITICAL for geospatial proximity queries
doctorProfileSchema.index({ clinicLocation: '2dsphere' });
doctorProfileSchema.index({ verificationStatus: 1 });
doctorProfileSchema.index({ experience: -1 });
doctorProfileSchema.index({ city: 1 });

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

export default DoctorProfile;
