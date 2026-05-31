import User from '../models/User.model.js';
import { ROLES } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * Idempotent admin seed.
 * Checks for an existing admin before creating one — safe to run on every startup.
 * The password is hashed by the User model's pre-save hook.
 *
 * Demo credentials (document in README):
 *   Email:    admin@theralign.com
 *   Password: Admin@Theralign1
 */
const seedAdmin = async () => {
  try {
    // 1. Seed admin@theralign.com
    const existingTheralign = await User.findOne({ email: 'admin@theralign.com' });
    if (!existingTheralign) {
      await User.create({
        name: 'Platform Admin',
        email: 'admin@theralign.com',
        password: 'Admin@Theralign1', // Hashed by pre-save hook
        role: ROLES.ADMIN,
      });
      logger.info('[Seed] Admin account admin@theralign.com created successfully.');
    } else {
      logger.info('[Seed] Admin account admin@theralign.com already exists.');
    }

    // 2. Seed admin@physioconnect.com
    const existingPhysio = await User.findOne({ email: 'admin@physioconnect.com' });
    if (!existingPhysio) {
      await User.create({
        name: 'Platform Admin',
        email: 'admin@physioconnect.com',
        password: 'Admin@123456', // Hashed by pre-save hook
        role: ROLES.ADMIN,
      });
      logger.info('[Seed] Admin account admin@physioconnect.com created successfully.');
    } else {
      logger.info('[Seed] Admin account admin@physioconnect.com already exists.');
    }
  } catch (err) {
    logger.error('[Seed] Failed to seed admin accounts:', err.message);
  }
};

export default seedAdmin;
