import mongoose from 'mongoose';
import config from './env.js';
import seedAdmin from './seedAdmin.js';
import seedDoctors from './seedDoctors.js';
import { runSeed } from './seed.js';
import Appointment from '../models/Appointment.model.js';

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

    // Run idempotent seed — safe on every startup
    await seedAdmin();
    await seedDoctors();

    // Dynamically check if full transaction & analytics data should be seeded
    const apptCount = await Appointment.countDocuments();
    if (apptCount < 50) {
      console.log(`[INFO] Low transaction count (${apptCount} records) detected. Seeding full analytics and slots...`);
      await runSeed(false); // Pass false so it does NOT close the database connection
    }
  } catch (error) {
    console.error(`[FATAL ERROR] MongoDB connection failed on initial startup:`, error);
    process.exit(1);
  }
};

export default connectDB;

