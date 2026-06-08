import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './src/models/User.model.js';
import DoctorProfile from './src/models/DoctorProfile.model.js';
import WeeklySchedule from './src/models/WeeklySchedule.model.js';
import Appointment from './src/models/Appointment.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const check = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const doctorId = '6a263963c408edc8d71c53e2';
    console.log('\n--- Checking DoctorProfile ---');
    const doctorProfile = await DoctorProfile.findById(doctorId).populate('user');
    if (!doctorProfile) {
      console.log('DoctorProfile not found by ID:', doctorId);
    } else {
      console.log('DoctorProfile found:');
      console.log('  Name:', doctorProfile.user?.name);
      console.log('  Email:', doctorProfile.user?.email);
      console.log('  Verification Status:', doctorProfile.verificationStatus);
      console.log('  Is Available:', doctorProfile.isAvailable);
    }

    console.log('\n--- Checking WeeklySchedule ---');
    const weeklySchedule = await WeeklySchedule.findOne({ doctor: doctorId });
    if (!weeklySchedule) {
      console.log('No WeeklySchedule found for doctor:', doctorId);
    } else {
      console.log('WeeklySchedule found:');
      console.log(JSON.stringify(weeklySchedule.toObject(), null, 2));
    }

    // Run getAvailableSlots logic
    console.log('\n--- Running getAvailableSlots Mock ---');
    const todayString = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
    console.log('Today (Asia/Kolkata):', todayString);

    if (weeklySchedule) {
      const targetDates = [];
      for (let i = 0; i < 28; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' });
        targetDates.push(dateStr);
      }

      const activeAppts = await Appointment.find({
        doctor: doctorId,
        date: { $in: targetDates },
        status: { $in: ['confirmed', 'pending'] },
      });
      console.log('Active appointments found:', activeAppts.length);

      const apptsByDate = activeAppts.reduce((acc, appt) => {
        if (!acc[appt.date]) acc[appt.date] = new Set();
        acc[appt.date].add(appt.startTime);
        return acc;
      }, {});

      const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      const fromMinutes = (totalMins) => {
        const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const m = (totalMins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const duration = weeklySchedule.slotDurationMinutes || 30;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const grouped = [];

      for (const dateStr of targetDates) {
        const isBlocked = weeklySchedule.blockedDates.includes(dateStr);
        const [year, month, day] = dateStr.split('-').map(Number);
        // Note: new Date(year, month - 1, day) vs Date.UTC
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();
        const dayName = dayNames[dayOfWeek];
        const daySchedule = weeklySchedule.schedule[dayName];

        console.log(`Checking date: ${dateStr} (${dayName}), blocked: ${isBlocked}, schedule.enabled: ${daySchedule?.enabled}`);

        const occupiedStartTimes = apptsByDate[dateStr] || new Set();
        const computedSlots = [];

        if (daySchedule?.enabled && !isBlocked) {
          const startMins = toMinutes(daySchedule.startTime);
          const endMins = toMinutes(daySchedule.endTime);
          let cursor = startMins;

          while (cursor + duration <= endMins) {
            const slotEnd = cursor + duration;
            const startTimeStr = fromMinutes(cursor);
            if (!occupiedStartTimes.has(startTimeStr)) {
              computedSlots.push({
                startTime: startTimeStr,
                endTime: fromMinutes(slotEnd),
              });
            }
            cursor += duration;
          }
        }
        if (computedSlots.length > 0) {
          grouped.push({ date: dateStr, count: computedSlots.length });
        }
      }
      console.log('Grouped available slots count:', grouped.length);
      console.log('Grouped slot details:', grouped);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
};

check();
