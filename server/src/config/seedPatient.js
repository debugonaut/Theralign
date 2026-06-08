import User from '../models/User.model.js';
import config from './env.js';
import { ROLES } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Idempotent patient seed.
 * Ensures the demo patient account exists and has the correct password on startup.
 */
export const seedPatient = async () => {
  try {
    const email = 'patient@demo.com';
    let patient = await User.findOne({ email });

    if (!patient) {
      patient = await User.create({
        name: 'Demo Patient',
        email,
        password: 'Demo@123456', // Hashed by User model pre-save hook
        role: ROLES.PATIENT,
        phone: '9876543210',
        isActive: true,
      });
      logger.info(`[Seed] Created demo patient account: ${email}`);
    } else if (config.nodeEnv !== 'production') {
      patient.password = 'Demo@123456';
      patient.isActive = true;
      await patient.save();
      logger.info(`[Seed] Verified demo patient account and password: ${email}`);
    }
  } catch (err) {
    logger.error('[Seed] Failed to seed demo patient account:', err.message);
  }
};

export default seedPatient;
