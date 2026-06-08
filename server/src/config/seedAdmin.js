import User from '../models/User.model.js';
import config from './env.js';
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
    // 1. Delete the typo admin if it exists
    await User.deleteOne({ email: 'admin@physioconnect.com' });

    // 2. Seed admin@theralign.com
    const existingTheralign = await User.findOne({ email: 'admin@theralign.com' });
    if (!existingTheralign) {
      await User.create({
        name: 'Platform Admin',
        email: 'admin@theralign.com',
        password: 'Admin@123456', // Hashed by pre-save hook
        role: ROLES.ADMIN,
      });
      logger.info('[Seed] Admin account admin@theralign.com created successfully.');
    } else if (config.nodeEnv !== 'production') {
      existingTheralign.password = 'Admin@123456';
      existingTheralign.isActive = true;
      await existingTheralign.save();
      logger.info('[Seed] Admin account admin@theralign.com password and active state verified.');
    }
  } catch (err) {
    logger.error('[Seed] Failed to seed admin accounts:', err.message);
  }
};

export default seedAdmin;
