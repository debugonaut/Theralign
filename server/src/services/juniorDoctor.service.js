import crypto from 'crypto';
import mongoose from 'mongoose';
import DoctorProfile from '../models/DoctorProfile.model.js';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { DOCTOR_STATUS } from '../utils/constants.js';
import {
  sendJuniorInviteEmail,
  sendJuniorAcceptedEmail,
  sendJuniorRemovedEmail,
} from './emailService.js';

/**
 * juniorDoctor.service.js
 *
 * Implements the invitation-based junior doctor team hierarchy.
 */

// ─── 1. Invite a Junior Doctor ───────────────────────────────────────────────
export const inviteJuniorDoctor = async (seniorUserId, juniorEmail) => {
  const emailLower = juniorEmail.toLowerCase().trim();

  // 1. Find senior doctor profile
  const seniorProfile = await DoctorProfile.findOne({ user: seniorUserId })
    .populate('user', 'name');

  if (!seniorProfile) {
    throw new AppError('Senior doctor profile not found.', 404);
  }

  // Verify doctorType or capacity
  if (seniorProfile.doctorType === 'independent' && (seniorProfile.maxJuniorDoctors || 0) === 0) {
    throw new AppError('You have not registered as a senior doctor. Update your practice settings first.', 400);
  }

  // Auto transition to senior if they have capacity but are marked independent
  if (seniorProfile.doctorType === 'independent' && (seniorProfile.maxJuniorDoctors || 0) > 0) {
    seniorProfile.doctorType = 'senior';
  }

  const capacity = seniorProfile.maxJuniorDoctors || 0;
  const activeCount = seniorProfile.juniorDoctors?.length || 0;

  if (activeCount >= capacity) {
    throw new AppError(`You have reached your maximum number of junior doctors (${capacity}).`, 400);
  }

  // 2. Check if the email is already registered as a junior under this senior
  const existingJunior = await DoctorProfile.findOne({
    seniorDoctor: seniorProfile._id,
  }).populate('user');
  if (existingJunior && existingJunior.user?.email.toLowerCase() === emailLower) {
    throw new AppError('This doctor is already part of your practice.', 409);
  }

  // 3. Generate token & handle resend or new invite
  const token = crypto.randomBytes(32).toString('hex');
  const existingInviteIndex = seniorProfile.juniorInvitations.findIndex(
    (inv) => inv.email === emailLower && inv.status === 'pending'
  );

  if (existingInviteIndex !== -1) {
    // Revoke old token and issue a new one
    seniorProfile.juniorInvitations[existingInviteIndex].token = token;
    seniorProfile.juniorInvitations[existingInviteIndex].invitedAt = new Date();
  } else {
    seniorProfile.juniorInvitations.push({
      email: emailLower,
      invitedAt: new Date(),
      status: 'pending',
      token,
    });
  }

  await seniorProfile.save();

  // Send invitation email (fire-and-forget)
  sendJuniorInviteEmail({
    email: emailLower,
    seniorName: seniorProfile.user.name,
    practiceName: seniorProfile.practiceName,
    token,
  }).catch((err) => logger.error(`Failed to send junior invitation email: ${err.message}`));

  logger.info(`Junior invite sent to ${emailLower} by senior user ${seniorUserId}`);

  return { message: `Invitation sent to ${emailLower}` };
};

// ─── 2. Accept Invitation ────────────────────────────────────────────────────
export const acceptJuniorInvitation = async (token, registrationData) => {
  const { name, email, password, phone } = registrationData;
  const emailLower = email.toLowerCase().trim();

  // 1. Find the senior profile with this pending invite token
  const seniorProfile = await DoctorProfile.findOne({
    'juniorInvitations.token': token,
    'juniorInvitations.status': 'pending',
  }).populate('user', 'name email');

  if (!seniorProfile) {
    throw new AppError('This invitation link is invalid or has already been used.', 404);
  }

  // 2. Confirm email matches the invited record
  const invitation = seniorProfile.juniorInvitations.find((inv) => inv.token === token);
  if (invitation.email !== emailLower) {
    throw new AppError('The email address does not match the invitation.', 400);
  }

  // 3. Validate user email uniqueness
  const existingUser = await User.findOne({ email: emailLower });
  if (existingUser) {
    throw new AppError('An account with this email already exists. Log in to link your account.', 409);
  }

  // 4. Create User
  const user = await User.create({
    name,
    email: emailLower,
    password, // automatic pre-save hash hook
    role: 'doctor',
    phone,
    isActive: true,
  });

  // 5. Create Junior Profile (inherits verification Status, consultationFee 0)
  const juniorProfile = await DoctorProfile.create({
    user: user._id,
    doctorType: 'junior',
    seniorDoctor: seniorProfile._id,
    verificationStatus: DOCTOR_STATUS.VERIFIED,
    verificationNote: `Junior doctor. Verified by Dr. ${seniorProfile.user.name} (senior). No admin review required.`,
    consultationFee: 0,
    isOnboarded: false,
  });

  // 6. Push to senior's junior list and mark invitation accepted
  seniorProfile.juniorDoctors.push(juniorProfile._id);
  invitation.status = 'accepted';
  await seniorProfile.save();

  // Send acceptance notification email to senior (fire-and-forget)
  sendJuniorAcceptedEmail({
    seniorEmail: seniorProfile.user.email,
    juniorName: user.name,
    seniorName: seniorProfile.user.name,
  }).catch((err) => logger.error(`Failed to send junior acceptance email: ${err.message}`));

  logger.info(`Junior doctor ${emailLower} accepted invite from senior ${seniorProfile._id}`);

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    message: 'Registration complete. You can now log in.',
  };
};

// ─── 3. Get Team / Practice Summary ─────────────────────────────────────────
export const getJuniorDoctors = async (seniorUserId) => {
  const seniorProfile = await DoctorProfile.findOne({ user: seniorUserId })
    .populate({
      path: 'juniorDoctors',
      populate: { path: 'user', select: 'name email profileImage phone' },
      select: 'verificationStatus isOnboarded registrationNumber specialization experience clinicName updatedAt',
    })
    .lean();

  if (!seniorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  if (seniorProfile.doctorType !== 'senior') {
    throw new AppError('You are not registered as a senior doctor.', 403);
  }

  const pendingInvitations = (seniorProfile.juniorInvitations || []).filter(
    (inv) => inv.status === 'pending'
  );

  return {
    juniorDoctors: seniorProfile.juniorDoctors || [],
    pendingInvitations,
    maxJuniorDoctors: seniorProfile.maxJuniorDoctors || 0,
    practiceName: seniorProfile.practiceName || null,
  };
};

// ─── 4. Remove a Junior Doctor ────────────────────────────────────────────────
export const removeJuniorDoctor = async (seniorUserId, juniorProfileId) => {
  // Find senior profile
  const seniorProfile = await DoctorProfile.findOne({ user: seniorUserId });
  if (!seniorProfile) {
    throw new AppError('Senior doctor profile not found.', 404);
  }

  const isJuniorInTeam = seniorProfile.juniorDoctors.some(
    (id) => id.toString() === juniorProfileId
  );
  if (!isJuniorInTeam) {
    throw new AppError('This junior doctor is not part of your practice.', 404);
  }

  // Find junior profile
  const juniorProfile = await DoctorProfile.findById(juniorProfileId)
    .populate('user', 'email name');

  if (!juniorProfile) {
    throw new AppError('Junior doctor profile not found.', 404);
  }

  // Update junior profile: convert to independent
  juniorProfile.doctorType = 'independent';
  juniorProfile.seniorDoctor = null;
  await juniorProfile.save();

  // Remove from senior's list
  seniorProfile.juniorDoctors = seniorProfile.juniorDoctors.filter(
    (id) => id.toString() !== juniorProfileId
  );
  await seniorProfile.save();

  // Send removed email notification (fire-and-forget)
  if (juniorProfile.user?.email) {
    sendJuniorRemovedEmail({
      juniorEmail: juniorProfile.user.email,
      seniorName: seniorProfile.practiceName || 'your senior supervisor',
    }).catch((err) => logger.error(`Failed to send junior removed email: ${err.message}`));
  }

  logger.info(`Junior doctor ${juniorProfileId} removed from senior ${seniorProfile._id}`);

  return { message: 'Junior doctor removed from practice.' };
};

// ─── 5. Update Practice Settings ──────────────────────────────────────────────
export const updatePracticeSettings = async (seniorUserId, { maxJuniorDoctors, practiceName }) => {
  const seniorProfile = await DoctorProfile.findOne({ user: seniorUserId });
  if (!seniorProfile) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const currentJuniorCount = seniorProfile.juniorDoctors?.length || 0;
  if (maxJuniorDoctors < currentJuniorCount) {
    throw new AppError(`Cannot reduce limit below current number of junior doctors (${currentJuniorCount}).`, 400);
  }

  seniorProfile.maxJuniorDoctors = maxJuniorDoctors;
  seniorProfile.practiceName = practiceName ? practiceName.trim() : null;

  // Enforce doctorType changes based on maxJuniorDoctors
  if (maxJuniorDoctors > 0 && seniorProfile.doctorType === 'independent') {
    seniorProfile.doctorType = 'senior';
  } else if (maxJuniorDoctors === 0 && currentJuniorCount === 0) {
    seniorProfile.doctorType = 'independent';
  }

  await seniorProfile.save();
  return seniorProfile;
};

// ─── 6. Cancel Junior Invitation ─────────────────────────────────────────────
export const cancelJuniorInvitation = async (seniorUserId, juniorEmail) => {
  const emailLower = juniorEmail.toLowerCase().trim();
  const seniorProfile = await DoctorProfile.findOne({ user: seniorUserId });
  if (!seniorProfile) {
    throw new AppError('Senior doctor profile not found.', 404);
  }

  seniorProfile.juniorInvitations = seniorProfile.juniorInvitations.filter(
    (inv) => !(inv.email === emailLower && inv.status === 'pending')
  );

  await seniorProfile.save();
  return { message: `Invitation to ${emailLower} cancelled.` };
};
