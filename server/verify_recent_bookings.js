import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.model.js';
import Appointment from './src/models/Appointment.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas!');

    // 1. Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n--- 5 MOST RECENT REGISTERED USERS ---');
    if (recentUsers.length === 0) {
      console.log('No users found in database.');
    } else {
      recentUsers.forEach(u => {
        console.log(`- Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Created: ${u.createdAt}`);
      });
    }

    // 2. Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n--- 5 MOST RECENT APPOINTMENTS ---');
    if (recentAppointments.length === 0) {
      console.log('No appointments found in database.');
    } else {
      recentAppointments.forEach(a => {
        console.log(`- ID: ${a._id}`);
        console.log(`  Patient: ${a.patient?.name} (${a.patient?.email})`);
        console.log(`  Doctor: ${a.doctor?.user?.name} (${a.doctor?.user?.email})`);
        console.log(`  Status: ${a.status} | Payment Status: ${a.paymentStatus}`);
        console.log(`  Date/Time: ${a.date} @ ${a.startTime} - ${a.endTime}`);
        console.log(`  Created: ${a.createdAt}`);
      });
    }

  } catch (err) {
    console.error('Error running check:', err);
  } finally {
    await mongoose.connection.close();
  }
};

run();
