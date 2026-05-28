import mongoose from 'mongoose';
import config from './env.js';
import seedAdmin from './seedAdmin.js';

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
  } catch (error) {
    console.error(`[FATAL ERROR] MongoDB connection failed on initial startup:`, error);
    process.exit(1);
  }
};

export default connectDB;

