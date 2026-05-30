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
        values: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'],
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
  },
  {
    timestamps: true,
  }
);

// Virtual for profile completion percentage
patientProfileSchema.virtual('completionPercentage').get(function () {
  let filledFields = 0;
  let totalFields = 0;

  // Basic Info check
  const basicInfoFields = ['dateOfBirth', 'gender', 'bloodGroup']; // skipping height/weight as they aren't explicitly in basic info form, but could be added
  basicInfoFields.forEach(field => {
    totalFields++;
    if (this[field]) filledFields++;
  });
  
  // Also check User fields (name, phone) usually via populated user, but we'll approximate based on what is commonly required.
  // The actual percentage might also incorporate the phone number if available.

  totalFields++; // Lifestyle (at least one field filled)
  if (this.lifestyle && (this.lifestyle.occupation || this.lifestyle.activityLevel)) filledFields++;

  totalFields++; // Medical History (considered filled if array length > 0, or just let them leave it empty)
  // Actually, for arrays, it's better to consider them "reviewed" if saved.
  // To avoid punishing users with no conditions, we might just scale based on scalar fields.
  
  // A simpler completion logic:
  // 5 sections: Basic Info, Medical History, Lifestyle, Emergency Contacts, Insurance
  // We'll give 20% for each section that has been touched/saved.
  // Since we use $set to update sections, we can check if data exists.
  
  // For the sake of this virtual, we can calculate based on specific keys:
  let score = 0;
  
  if (this.dateOfBirth && this.bloodGroup) score += 20;
  // If arrays are defined (even if empty, meaning they saved it)
  if (this.medicalHistory) score += 20; 
  if (this.lifestyle && this.lifestyle.activityLevel) score += 20;
  if (this.emergencyContacts && this.emergencyContacts.length > 0) score += 20;
  if (this.insurance && this.insurance.provider) score += 20;

  return score;
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
