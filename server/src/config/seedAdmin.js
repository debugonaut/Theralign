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
    const existing = await User.findOne({ role: ROLES.ADMIN });
    if (existing) {
      logger.info('[Seed] Admin account already exists — skipping seed.');
      return;
    }

    await User.create({
      name: 'Platform Admin',
      email: 'admin@theralign.com',
      password: 'Admin@Theralign1', // Hashed by pre-save hook
      role: ROLES.ADMIN,
    });

    logger.info('[Seed] Admin account created successfully.');
    logger.info('[Seed]   Email:    admin@theralign.com');
    logger.info('[Seed]   Password: Admin@Theralign1');
  } catch (err) {
    logger.error('[Seed] Failed to seed admin account:', err.message);
  }
};

export default seedAdmin;
