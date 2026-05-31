import cron from 'node-cron';
import Appointment from '../models/Appointment.model.js';
import { sendAppointmentReminder } from '../services/emailService.js';
import logger from '../utils/logger.js';

/**
 * Initializes the appointment reminder job scheduler.
 * Runs every day at 9:00 AM IST (03:30 AM UTC).
 */
export const initReminderJob = () => {
  // Cron schedule: 30 3 * * * (runs at 03:30 AM UTC / 09:00 AM IST daily)
  cron.schedule('30 3 * * *', async () => {
    logger.info('Executing scheduled daily appointment reminder job...');

    try {
      // Calculate tomorrow's date string in YYYY-MM-DD format
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Fetch tomorrow's active confirmed bookings
      const appointments = await Appointment.find({
        date: tomorrowStr,
        status: 'confirmed',
      })
        .populate('patient', 'name email')
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name',
          },
        });

      logger.info(`Found ${appointments.length} confirmed appointments for ${tomorrowStr} to remind`);

      for (const appt of appointments) {
        if (!appt.patient?.email || !appt.doctor?.user?.name) {
          logger.warn(`Skipping reminder for appointment ${appt._id} due to missing user associations`);
          continue;
        }

        // Fire-and-forget: do not let one failed send halt the whole queue loop
        sendAppointmentReminder({
          patientEmail: appt.patient.email,
          patientName: appt.patient.name,
          doctorName: appt.doctor.user.name,
          date: appt.date,
          startTime: appt.startTime,
          endTime: appt.endTime,
          appointmentId: appt._id,
        });
      }

      logger.info(`Appointment reminder job complete. Dispatched all queued reminder notifications.`);
    } catch (err) {
      logger.error(`Scheduled appointment reminder job failed: ${err.message}`);
    }
  });

  logger.info('Appointment reminder job initialized (configured daily at 09:00 AM IST)');
};
