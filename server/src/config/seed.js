import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
import Review from '../models/Review.model.js';
import logger from '../utils/logger.js';
import { ROLES, APPOINTMENT_STATUS, DOCTOR_STATUS } from '../utils/constants.js';

// Date helper to construct "YYYY-MM-DD" local strings relative to today
const getOffsetDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const runSeed = async (shouldCloseConnection = true) => {
  try {
    logger.info('[Seed] Initializing high-fidelity demo database seed...');
    
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // ─── 1. Find or Create Demo Patient ──────────────────────────────────────
    let patient = await User.findOne({ email: 'patient@demo.com' });
    if (!patient) {
      patient = await User.create({
        name: 'Demo Patient',
        email: 'patient@demo.com',
        password: 'Demo@1234', // Updated to match README
        role: ROLES.PATIENT,
        phone: '9876543210',
      });
      logger.info(`[Seed] Created demo patient account: ${patient.email}`);
    } else {
      // Ensure password is aligned with README
      patient.password = 'Demo@1234';
      await patient.save();
      logger.info(`[Seed] Found and verified patient account: ${patient.email}`);
    }

    // ─── 2. Retrieve Verified Doctors ────────────────────────────────────────
    const doctors = await DoctorProfile.find({ verificationStatus: DOCTOR_STATUS.VERIFIED }).populate('user');
    if (doctors.length === 0) {
      logger.warn('[Seed] No verified doctor profiles found in the database. Please run seedDoctors first!');
      return;
    }
    logger.info(`[Seed] Found ${doctors.length} verified doctors to seed data for.`);

    // ─── 3. Clear existing transaction/slot records ───────────────────────────
    logger.info('[Seed] Clearing all existing slots, appointments, payments, and reviews for a clean demo slate...');
    await AvailabilitySlot.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});

    // ─── 4. Seed Availability Slots ──────────────────────────────────────────
    const timeSlots = [
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '10:30' },
      { start: '11:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
      { start: '16:00', end: '16:30' },
    ];

    let slotsCreated = 0;
    
    // Seed availability slots for the next 7 days for each doctor
    for (const doctor of doctors) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dateStr = getOffsetDateString(dayOffset);
        
        for (const slotTime of timeSlots) {
          try {
            await AvailabilitySlot.create({
              doctor: doctor._id,
              date: dateStr,
              startTime: slotTime.start,
              endTime: slotTime.end,
              isBooked: false,
              isActive: true,
            });
            slotsCreated++;
          } catch (slotError) {
            if (slotError.code !== 11000) {
              throw slotError;
            }
          }
        }
      }
    }
    logger.info(`[Seed] Availability slot seeding complete. Created ${slotsCreated} slots.`);

    // ─── 5. Seed Realistic Reviews ───────────────────────────────────────────
    logger.info('[Seed] Seeding patient reviews and updating rating averages...');
    
    const reviewComments = [
      "Excellent treatment! My shoulder pain is completely gone after 3 sessions.",
      "Very professional and knowledgeable physiotherapist. Highly recommended!",
      "Great experience. The clinic is clean and they follow all hygiene standards.",
      "The exercises suggested were very effective. Feeling much better now.",
      "Very patient and listens to all symptoms carefully. Exceptional care.",
      "Highly skilled. Explained the anatomy of my injury and recovery plan clearly.",
      "Excellent hands-on manual therapy. Had instant relief from back lock.",
      "Very polite staff and the doctor is extremely experienced. Outstanding!",
      "I was struggling with chronic knee pain for months, but the sports rehab was a lifesaver.",
      "Great posture correction routines. Already seeing improvements in my neck strain."
    ];
    
    let reviewsCreated = 0;
    
    // Seed 2 reviews per doctor to trigger post-save hook aggregations
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const fee = doctor.consultationFee || 800;
      const comm = parseFloat((fee * 0.10).toFixed(2));
      const earn = parseFloat((fee * 0.90).toFixed(2));
      
      for (let j = 0; j < 2; j++) {
        const offsetDays = -(j * 3 + 2); // -2, -5 days ago
        const dateStr = getOffsetDateString(offsetDays);
        const seedTimestamp = new Date(dateStr);
        const demoPaymentId = `pay_review_${i}_${j}_${Date.now()}`;
        
        const appt = await Appointment.create({
          patient: patient._id,
          doctor: doctor._id,
          slot: null,
          date: dateStr,
          startTime: j === 0 ? '10:00' : '15:00',
          endTime: j === 0 ? '10:30' : '15:30',
          status: APPOINTMENT_STATUS.COMPLETED,
          consultationFee: fee,
          platformCommission: comm,
          doctorEarnings: earn,
          patientNotes: `[Review Seed] Completed session ${j + 1}`,
          paymentStatus: 'paid',
          paymentId: demoPaymentId,
          createdAt: seedTimestamp,
          updatedAt: seedTimestamp,
        });
        
        await Payment.create({
          appointment: appt._id,
          patient: patient._id,
          doctor: doctor._id,
          razorpayOrderId: `order_review_${i}_${j}_${Date.now()}`,
          razorpayPaymentId: demoPaymentId,
          razorpaySignature: 'demo_review_sig_hash',
          amount: fee,
          currency: 'INR',
          status: 'paid',
          platformCommission: comm,
          doctorEarnings: earn,
          createdAt: seedTimestamp,
          updatedAt: seedTimestamp,
        });
        
        const rating = i % 2 === 0 ? (j === 0 ? 5 : 4) : 5; // Give alternating 5 and 4.5 star ratings
        const comment = reviewComments[(i * 2 + j) % reviewComments.length];
        
        await Review.create({
          appointment: appt._id,
          patient: patient._id,
          doctor: doctor._id,
          rating,
          comment,
          isVisible: true,
          createdAt: seedTimestamp,
          updatedAt: seedTimestamp,
        });
        
        reviewsCreated++;
      }
    }
    logger.info(`[Seed] Seeded ${reviewsCreated} realistic patient reviews and updated ratings.`);

    // ─── 6. Seed Sample Live Bookings ─────────────────────────────────────────
    logger.info('[Seed] Seeding sample upcoming bookings...');
    const firstDoctor = doctors[0];
    const fee = firstDoctor.consultationFee || 800;
    const comm = parseFloat((fee * 0.10).toFixed(2));
    const earn = parseFloat((fee * 0.90).toFixed(2));

    // Upcoming Confirmed Appointment (Tomorrow, 09:00 slot)
    const dateTomorrow = getOffsetDateString(1);
    let slotA = await AvailabilitySlot.findOne({
      doctor: firstDoctor._id,
      date: dateTomorrow,
      startTime: '09:00',
    });

    if (slotA) {
      slotA.isBooked = true;
      await slotA.save();

      const apptA = await Appointment.create({
        patient: patient._id,
        doctor: firstDoctor._id,
        slot: slotA._id,
        date: slotA.date,
        startTime: slotA.startTime,
        endTime: slotA.endTime,
        status: APPOINTMENT_STATUS.CONFIRMED,
        consultationFee: fee,
        platformCommission: comm,
        doctorEarnings: earn,
        patientNotes: '[Demo] Upcoming confirmed visit',
      });
      logger.info(`[Seed] Created confirmed booking: ${apptA._id} on ${apptA.date}`);
    }

    // ─── 7. Seed 30-Day Historical Data for Analytics Charts ─────────────────
    logger.info('[Seed] Seeding 30-day historical data for analytics...');

    // Build the list of past dates (30 days ago → yesterday)
    const pastDates = [];
    for (let i = 30; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      pastDates.push(`${year}-${month}-${day}`);
    }

    let historicalCount = 0;

    for (const dateStr of pastDates) {
      const appointmentsForDay = Math.floor(Math.random() * 3) + 2; // 2-4 per day
      for (let i = 0; i < appointmentsForDay; i++) {
        // Choose doctors in a round-robin style to distribute earnings
        const doctorIndex = historicalCount % doctors.length;
        const doctor = doctors[doctorIndex];
        const fee = doctor.consultationFee || 800;
        const commission = parseFloat((fee * 0.10).toFixed(2));
        const earnings = parseFloat((fee * 0.90).toFixed(2));

        const seedTimestamp = new Date(dateStr);

        try {
          const appt = await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            slot: null,
            date: dateStr,
            startTime: '10:00',
            endTime: '10:30',
            status: 'completed',
            consultationFee: fee,
            platformCommission: commission,
            doctorEarnings: earnings,
            paymentStatus: 'paid',
            reviewSubmitted: false,
            patientNotes: `[Historical] Demo session ${i + 1}`,
            createdAt: seedTimestamp,
            updatedAt: seedTimestamp,
          });

          await Payment.create({
            appointment: appt._id,
            patient: patient._id,
            doctor: doctor._id,
            razorpayOrderId: `order_hist_${dateStr}_${i}_${Date.now()}`,
            razorpayPaymentId: `pay_hist_${dateStr}_${i}`,
            razorpaySignature: 'historical_seed_sig',
            amount: fee,
            currency: 'INR',
            status: 'paid',
            platformCommission: commission,
            doctorEarnings: earnings,
            createdAt: seedTimestamp,
            updatedAt: seedTimestamp,
          });

          historicalCount++;
        } catch (seedErr) {
          if (seedErr.code !== 11000) {
            logger.warn(`[Seed] Historical seed error on ${dateStr}: ${seedErr.message}`);
          }
        }
      }
    }

    logger.info(`[Seed] Historical seeding complete. Created ${historicalCount} historical records.`);
    logger.info('[Seed] Database seeding run finished successfully.');
  } catch (err) {
    logger.error('[Seed] Database seeding run failed:', err);
  } finally {
    if (shouldCloseConnection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('[Seed] Database connection closed.');
    }
  }
};

// Check if run directly
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('seed.js') || 
  process.argv[1].endsWith('seed')
);

if (isDirectRun) {
  runSeed(true);
}
