import cron from 'node-cron';
import Appointment from '../models/Appointment.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import logger from '../utils/logger.js';

const PENDING_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Cancels unpaid pending appointments and releases their slots.
 */
export const expireStalePendingAppointments = async () => {
  const cutoff = new Date(Date.now() - PENDING_TTL_MS);

  const stale = await Appointment.find({
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: { $lt: cutoff },
  });

  if (stale.length === 0) return 0;

  for (const appt of stale) {
    appt.status = 'cancelled';
    appt.cancellationReason = 'Auto-cancelled: payment not completed within 15 minutes';
    appt.cancelledBy = 'system';
    await appt.save();

    if (appt.slot) {
      await AvailabilitySlot.findByIdAndUpdate(appt.slot, { $set: { isBooked: false } });
    }
  }

  return stale.length;
};

/**
 * Runs every 5 minutes to release slots held by abandoned checkouts.
 */
export const initExpirePendingJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const count = await expireStalePendingAppointments();
      if (count > 0) {
        logger.info(`[ExpirePending] Auto-cancelled ${count} unpaid pending appointment(s).`);
      }
    } catch (err) {
      logger.error(`[ExpirePending] Job failed: ${err.message}`);
    }
  });

  logger.info('Pending appointment expiry job initialized (every 5 minutes, 15-minute TTL).');
};
