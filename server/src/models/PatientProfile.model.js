import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema({
  conditionName: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  notes: { type: String, trim: true, default: '' },
}, { _id: false });

const surgerySchema = new mongoose.Schema({
  surgeryName: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  description: { type: String, trim: true, default: '' },
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    required: true, 
    trim: true,
    match: [/^\d{10}$/, 'Emergency contact phone must be 10 digits']
  },
}, { _id: false });

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // BASIC INFO
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          // Must be in the past and at least 5 years old
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
          return value <= fiveYearsAgo;
        },
        message: 'Patient must be at least 5 years old',
      },
    },
    gender: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group',
      },
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [250, 'Height cannot exceed 250 cm'],
    },
    weight: {
      type: Number,
      min: [10, 'Weight must be at least 10 kg'],
      max: [300, 'Weight cannot exceed 300 kg'],
    },
    
    // MEDICAL HISTORY
    medicalHistory: {
      conditions: {
        type: [conditionSchema],
        default: [],
      },
      medications: {
        type: [String],
        default: [],
      },
      surgeries: {
        type: [surgerySchema],
        default: [],
      },
    },
    
    // LIFESTYLE
    lifestyle: {
      occupation: {
        type: String,
        trim: true,
        default: '',
      },
      activityLevel: {
        type: String,
        enum: {
          values: ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY ACTIVE', ''],
          message: '{VALUE} is not a valid activity level',
        },
        default: '',
      },
      smoking: {
        type: Boolean,
        default: null,
      },
      alcohol: {
        type: Boolean,
        default: null,
      },
    },
    
    // EMERGENCY CONTACTS
    emergencyContacts: {
      type: [emergencyContactSchema],
      validate: {
        validator: function (val) {
          return val.length <= 2;
        },
        message: 'Maximum two emergency contacts allowed',
      },
      default: [],
    },
    
    // INSURANCE
    insurance: {
      provider: {
        type: String,
        trim: true,
        default: '',
      },
      policyNumber: {
        type: String,
        trim: true,
        default: '',
      },
    },
    // STEP TRACKING
    completedSteps: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
// Virtual for profile completion percentage
patientProfileSchema.virtual('completionPercentage').get(function () {
  if (this.completedSteps && this.completedSteps.length > 0) {
    return this.completedSteps.length * 20;
  }
  
  // Fallback calculation in case completedSteps is not populated yet
  let score = 0;
  if (this.dateOfBirth && this.gender && this.bloodGroup) score += 20;
  if (
    this.medicalHistory &&
    (this.medicalHistory.conditions?.length > 0 ||
      this.medicalHistory.medications?.length > 0 ||
      this.medicalHistory.surgeries?.length > 0)
  ) {
    score += 20;
  }
  if (this.lifestyle && this.lifestyle.activityLevel) score += 20;
  if (this.emergencyContacts && this.emergencyContacts.length > 0) score += 20;
  if (this.insurance && (this.insurance.provider || this.insurance.policyNumber)) score += 20;

  return score;
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
