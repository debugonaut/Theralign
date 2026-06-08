import mongoose from 'mongoose';
import config from './env.js';
import seedAdmin from './seedAdmin.js';
import seedDoctors from './seedDoctors.js';
import seedPatient from './seedPatient.js';
import { runSeed } from './seed.js';
import Appointment from '../models/Appointment.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { DOCTOR_STATUS } from '../utils/constants.js';

const TIME_SLOTS = [
  { start: '09:00', end: '09:30' },
  { start: '10:00', end: '10:30' },
  { start: '11:00', end: '11:30' },
  { start: '14:00', end: '14:30' },
  { start: '15:00', end: '15:30' },
  { start: '16:00', end: '16:30' },
];

const getOffsetDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const refreshSlots = async () => {
  try {
    // Delete ALL unbooked slots and recreate fresh (keeps booked slots intact)
    await AvailabilitySlot.deleteMany({ isBooked: false });

    const doctors = await DoctorProfile.find({ verificationStatus: { $in: [DOCTOR_STATUS.VERIFIED, 'pending'] } });
    const docs = [];
    for (const doctor of doctors) {
      for (let day = 0; day < 30; day++) {
        const dateStr = getOffsetDateString(day);
        for (const slot of TIME_SLOTS) {
          docs.push({ doctor: doctor._id, date: dateStr, startTime: slot.start, endTime: slot.end, isBooked: false, isActive: true });
        }
      }
    }
    let insertedCount = 0;
    try {
      const result = await AvailabilitySlot.insertMany(docs, { ordered: false });
      insertedCount = result.length;
    } catch (err) {
      if (err.code === 11000 || err.name === 'BulkWriteError') {
        insertedCount = err.insertedDocs?.length ?? 0;
      } else {
        throw err;
      }
    }
    console.log(`[INFO] Slot refresh complete. ${insertedCount} new slots inserted, ${docs.length - insertedCount} already existed.`);
  } catch (err) {
    console.error('[ERROR] Slot refresh failed:', err.message);
  }
};

// Setup connection event listeners
mongoose.connection.on('connected', () => {
  console.log(`[INFO] MongoDB connection established successfully.`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[ERROR] MongoDB connection error occurred:`, err);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`[WARN] MongoDB connection disconnected.`);
});

export const connectDB = async () => {
  try {
    console.log(`[INFO] Attempting to connect to MongoDB...`);
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[INFO] MongoDB Connected: ${conn.connection.host}`);

    // Run idempotent seeds — safe on every startup
    await seedAdmin();
    await seedPatient();
    await seedDoctors();

    // Dynamically check if full transaction & analytics data should be seeded
    const apptCount = await Appointment.countDocuments();
    if (apptCount < 50) {
      console.log(`[INFO] Low transaction count (${apptCount} records) detected. Seeding full analytics and slots...`);
      await runSeed(false);
    }

    // Always refresh slots for the next 30 days on every startup
    await refreshSlots();
  } catch (error) {
    console.error(`[FATAL ERROR] MongoDB connection failed on initial startup:`, error);
    process.exit(1);
  }
};

export default connectDB;

