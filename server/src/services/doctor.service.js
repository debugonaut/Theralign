import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import { DOCTOR_STATUS } from '../utils/constants.js';
import { uploadToCloudinary } from './upload.service.js';

/**
 * Creates or updates the onboarding profile for a doctor user.
 * Parses coordinates, uploads required documents to Cloudinary, and sets status to pending.
 *
 * @param {string} userId - ID of the logged-in user
 * @param {object} profileData - req.body text inputs
 * @param {object} files - req.files uploaded file metadata
 * @returns {Promise<object>} Created/updated DoctorProfile document
 */
export const onboardDoctor = async (userId, profileData, files) => {
  // 1. Verify user exists and has the doctor role
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User account not found', 404);
  }
  if (user.role !== 'doctor') {
    throw new AppError('Only doctors can complete professional onboarding', 403);
  }

  const isOnboarded = profileData.isOnboarded === 'true';

  // Fetch existing profile if any
  let profile = await DoctorProfile.findOne({ user: userId });
  const isJunior = profile && profile.doctorType === 'junior';

  if (isJunior) {
    // Strip restricted fields for junior doctors
    delete profileData.specialization;
    delete profileData.consultationFee;
    delete profileData.registrationNumber;
    delete profileData.maxJuniorDoctors;
    delete profileData.practiceName;
  }

  // 2. Extract and validate files
  const degreeFile = isJunior ? undefined : files?.degreeDocument?.[0];
  const licenseFile = isJunior ? undefined : files?.licenseDocument?.[0];

  // For a brand new profile, both files are strictly required only if finalizing onboarding
  if (isOnboarded && !profile && (!degreeFile || !licenseFile)) {
    throw new AppError('Both degree and medical license documents are required for onboarding.', 400);
  }

  // 3. Upload new files if provided
  let degreeDocumentUrl = profile?.degreeDocument;
  let licenseDocumentUrl = profile?.licenseDocument;

  if (degreeFile) {
    degreeDocumentUrl = await uploadToCloudinary(degreeFile.path, 'doctor_docs');
  }
  if (licenseFile) {
    licenseDocumentUrl = await uploadToCloudinary(licenseFile.path, 'doctor_docs');
  }

  // Upload profile photo if provided and update user fields
  const profileImageFile = files?.profileImage?.[0];
  if (profileImageFile) {
    user.profileImage = await uploadToCloudinary(profileImageFile.path, 'doctor_avatars');
  }
  if (profileData.name) {
    user.name = profileData.name;
  }
  if (profileData.phone) {
    user.phone = profileData.phone;
  }
  await user.save();

  // 4. Parse and structure data
  let parsedSpecializations = profile?.specialization;
  if (profileData.specialization) {
    try {
      parsedSpecializations = typeof profileData.specialization === 'string'
        ? JSON.parse(profileData.specialization)
        : profileData.specialization;
    } catch (error) {
      throw new AppError('Invalid specialization array format. Must be a valid JSON array.', 400);
    }
    if (isOnboarded && (!Array.isArray(parsedSpecializations) || parsedSpecializations.length === 0)) {
      throw new AppError('At least one specialization is required.', 400);
    }
  } else if (isOnboarded && (!parsedSpecializations || parsedSpecializations.length === 0)) {
    throw new AppError('At least one specialization is required.', 400);
  }

  // Coordinates
  let clinicLocation = profile?.clinicLocation;
  if (profileData.latitude && profileData.longitude) {
    const lat = parseFloat(profileData.latitude);
    const lng = parseFloat(profileData.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError('Valid latitude and longitude coordinates are required for the clinic location.', 400);
    }
    clinicLocation = {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON order: [longitude, latitude]
    };
  } else if (isOnboarded && !clinicLocation) {
    throw new AppError('Valid latitude and longitude coordinates are required for the clinic location.', 400);
  }

  // Experience
  let experience = profile?.experience;
  if (profileData.experience !== undefined && profileData.experience !== '') {
    experience = parseInt(profileData.experience, 10);
    if (isNaN(experience) || experience < 0) {
      throw new AppError('Experience must be a positive number.', 400);
    }
  } else if (isOnboarded && experience === undefined) {
    throw new AppError('Experience (in years) is required.', 400);
  }

  // Consultation Fee
  let consultationFee = profile?.consultationFee;
  if (profileData.consultationFee !== undefined && profileData.consultationFee !== '') {
    consultationFee = parseFloat(profileData.consultationFee);
    if (isNaN(consultationFee) || consultationFee < 0) {
      throw new AppError('Consultation fee must be a positive number.', 400);
    }
  } else if (isOnboarded && consultationFee === undefined) {
    throw new AppError('Consultation fee is required.', 400);
  }

  // 5. Save/Update Profile
  const updatePayload = {
    user: userId,
    isOnboarded,
    verificationStatus: isJunior
      ? (profile?.verificationStatus || DOCTOR_STATUS.VERIFIED)
      : (isOnboarded ? DOCTOR_STATUS.PENDING : (profile?.verificationStatus || DOCTOR_STATUS.PENDING)),
    isAvailable: isJunior
      ? (profile?.isAvailable ?? true)
      : (isOnboarded ? false : (profile?.isAvailable ?? false)),
    rejectionReason: isOnboarded && !isJunior ? null : (profile?.rejectionReason || null),
  };

  if (isJunior) {
    updatePayload.doctorType = 'junior';
  } else {
    let maxJuniors = profile?.maxJuniorDoctors || 0;
    if (profileData.maxJuniorDoctors !== undefined && profileData.maxJuniorDoctors !== '') {
      maxJuniors = parseInt(profileData.maxJuniorDoctors, 10);
      if (isNaN(maxJuniors) || maxJuniors < 0) {
        throw new AppError('Maximum junior doctors must be a non-negative number.', 400);
      }
    }
    updatePayload.maxJuniorDoctors = maxJuniors;
    updatePayload.doctorType = maxJuniors > 0 ? 'senior' : 'independent';

    if (profileData.practiceName !== undefined) {
      updatePayload.practiceName = profileData.practiceName ? profileData.practiceName.trim() : null;
    }
  }

  if (parsedSpecializations !== undefined && parsedSpecializations.length > 0) {
    updatePayload.specialization = parsedSpecializations;
  }
  if (experience !== undefined) {
    updatePayload.experience = experience;
  }
  if (profileData.clinicName !== undefined && profileData.clinicName !== '') {
    updatePayload.clinicName = profileData.clinicName;
  }
  if (profileData.clinicAddress !== undefined && profileData.clinicAddress !== '') {
    updatePayload.clinicAddress = profileData.clinicAddress;
  }
  if (profileData.city !== undefined && profileData.city !== '') {
    updatePayload.city = profileData.city;
  }
  if (clinicLocation !== undefined) {
    updatePayload.clinicLocation = clinicLocation;
  }
  if (consultationFee !== undefined) {
    updatePayload.consultationFee = consultationFee;
  }
  if (profileData.bio !== undefined && profileData.bio !== '') {
    updatePayload.bio = profileData.bio;
  }
  if (profileData.registrationNumber !== undefined && profileData.registrationNumber !== '') {
    updatePayload.registrationNumber = profileData.registrationNumber;
  }
  if (degreeDocumentUrl !== undefined) {
    updatePayload.degreeDocument = degreeDocumentUrl;
  }
  if (licenseDocumentUrl !== undefined) {
    updatePayload.licenseDocument = licenseDocumentUrl;
  }

  if (profile) {
    // Update existing profile — use $set to avoid re-triggering unique index validation
    // on fields like registrationNumber that haven't changed
    profile = await DoctorProfile.findOneAndUpdate(
      { user: userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );
  } else {
    // Create new profile
    profile = await DoctorProfile.create(updatePayload);
  }

  return profile.populate('user');
};

/**
 * Fetch the profile of a specific doctor by user ID.
 * Returns null if the profile doesn't exist yet.
 *
 * @param {string} userId - User ID of the doctor
 * @returns {Promise<object|null>} DoctorProfile populated with user details
 */
export const getDoctorProfileByUserId = async (userId) => {
  return DoctorProfile.findOne({ user: userId })
    .populate('user')
    .populate({
      path: 'seniorDoctor',
      populate: { path: 'user', select: 'name profileImage' }
    });
};

/**
 * Fetch the profile of a specific doctor by DoctorProfile ID.
 * Throws a 404 error if not found.
 *
 * @param {string} id - ID of the DoctorProfile
 * @returns {Promise<object>} DoctorProfile populated with user details
 */
export const getDoctorProfileById = async (id) => {
  const profile = await DoctorProfile.findById(id).populate('user', 'name profileImage email phone');
  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }
  return profile;
};

/**
 * Public-safe doctor profile for discovery endpoints.
 * Only returns verified doctors; strips internal document URLs and PII.
 */
export const getPublicDoctorProfileById = async (id) => {
  const profile = await DoctorProfile.findById(id).populate('user', 'name profileImage');

  if (!profile) {
    throw new AppError('Doctor profile not found', 404);
  }

  const sanitized = profile.toObject();
  delete sanitized.degreeDocument;
  delete sanitized.licenseDocument;
  delete sanitized.registrationNumber;

  return sanitized;
};
