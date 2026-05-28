import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import AvailabilitySlot from '../models/AvailabilitySlot.model.js';
import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
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

const runSeed = async () => {
  try {
    logger.info('[Seed] Initializing Phase 5 database seed...');
    await connectDB();

    // ─── 1. Find or Create Demo Patient ──────────────────────────────────────
    let patient = await User.findOne({ role: ROLES.PATIENT });
    if (!patient) {
      patient = await User.create({
        name: 'Demo Patient',
        email: 'patient@demo.com',
        password: 'Patient@123', // Hashed automatically by schema hook
        role: ROLES.PATIENT,
        phone: '9876543210',
      });
      logger.info(`[Seed] Created demo patient account: ${patient.email}`);
    } else {
      logger.info(`[Seed] Found existing patient account: ${patient.email}`);
    }

    // ─── 2. Retrieve Verified Doctors ────────────────────────────────────────
    const doctors = await DoctorProfile.find({ verificationStatus: DOCTOR_STATUS.VERIFIED }).populate('user');
    if (doctors.length === 0) {
      logger.warn('[Seed] No verified doctor profiles found in the database. Please run seedDoctors first!');
      return;
    }
    logger.info(`[Seed] Found ${doctors.length} verified doctors to populate slots.`);

    // ─── 3. Seed Availability Slots ──────────────────────────────────────────
    const timeSlots = [
      { start: '09:00', end: '09:30' },
      { start: '10:00', end: '10:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
    ];

    let slotsCreated = 0;
    
    // Seed availability slots for the next 7 days for each doctor
    for (const doctor of doctors) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dateStr = getOffsetDateString(dayOffset);
        
        for (const slotTime of timeSlots) {
          try {
            // Idempotent slot creation: check if exists or use try-catch for compound unique key error
            const exists = await AvailabilitySlot.findOne({
              doctor: doctor._id,
              date: dateStr,
              startTime: slotTime.start,
            });

            if (!exists) {
              await AvailabilitySlot.create({
                doctor: doctor._id,
                date: dateStr,
                startTime: slotTime.start,
                endTime: slotTime.end,
                isBooked: false,
                isActive: true,
              });
              slotsCreated++;
            }
          } catch (slotError) {
            // Skip unique conflicts if duplicates arise during parallel seeding
            if (slotError.code !== 11000) {
              throw slotError;
            }
          }
        }
      }
    }
    logger.info(`[Seed] Availability slot seeding complete. Created ${slotsCreated} slots.`);

    // ─── 4. Seed 3 Sample Bookings ───────────────────────────────────────────
    logger.info('[Seed] Seeding sample appointment bookings...');
    const firstDoctor = doctors[0];
    const fee = firstDoctor.consultationFee || 500;
    const comm = parseFloat((fee * 0.10).toFixed(2));
    const earn = parseFloat((fee * 0.90).toFixed(2));

    // Clear existing appointments to prevent database bloat
    await Appointment.deleteMany({
      $or: [
        { patientNotes: '[Demo] Upcoming confirmed visit' },
        { patientNotes: '[Demo] Past completed visit' },
        { patientNotes: '[Demo] Cancelled schedule conflict' }
      ]
    });

    // Clear existing demo payments
    await Payment.deleteMany({
      razorpayOrderId: { $regex: /^order_demo_/ }
    });

    // A) 1 Upcoming Confirmed Appointment (Tomorrow, 09:00 slot)
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

    // B) 1 Past Completed Appointment (Yesterday, 14:00 slot)
    const dateYesterday = getOffsetDateString(-1);
    let slotB = await AvailabilitySlot.findOne({
      doctor: firstDoctor._id,
      date: dateYesterday,
      startTime: '14:00',
    });

    if (slotB) {
      slotB.isBooked = true;
      await slotB.save();

      const demoPaymentId = 'pay_demo_' + Date.now();

      const apptB = await Appointment.create({
        patient: patient._id,
        doctor: firstDoctor._id,
        slot: slotB._id,
        date: slotB.date,
        startTime: slotB.startTime,
        endTime: slotB.endTime,
        status: APPOINTMENT_STATUS.COMPLETED,
        consultationFee: fee,
        platformCommission: comm,
        doctorEarnings: earn,
        patientNotes: '[Demo] Past completed visit',
        paymentStatus: 'paid',
        paymentId: demoPaymentId,
      });

      // Create a corresponding Payment document
      await Payment.create({
        appointment: apptB._id,
        patient: patient._id,
        doctor: firstDoctor._id,
        razorpayOrderId: 'order_demo_' + Date.now(),
        razorpayPaymentId: demoPaymentId,
        razorpaySignature: 'demo_signature_hash',
        amount: fee,
        currency: 'INR',
        status: 'paid',
        platformCommission: comm,
        doctorEarnings: earn,
      });

      logger.info(`[Seed] Created completed past booking: ${apptB._id} on ${apptB.date}`);
      logger.info('[Seed] Payment seed: 1 demo payment record created');
    }

    // C) 1 Cancelled Appointment (Yesterday, 15:00 slot)
    let slotC = await AvailabilitySlot.findOne({
      doctor: firstDoctor._id,
      date: dateYesterday,
      startTime: '15:00',
    });

    if (slotC) {
      // Cancelled slot should remain isBooked: false in DB so it can be re-booked!
      slotC.isBooked = false;
      await slotC.save();

      const apptC = await Appointment.create({
        patient: patient._id,
        doctor: firstDoctor._id,
        slot: slotC._id,
        date: slotC.date,
        startTime: slotC.startTime,
        endTime: slotC.endTime,
        status: APPOINTMENT_STATUS.CANCELLED,
        consultationFee: fee,
        platformCommission: comm,
        doctorEarnings: earn,
        patientNotes: '[Demo] Cancelled schedule conflict',
        cancellationReason: 'Doctor had an emergency surgery.',
        cancelledBy: 'doctor',
      });
      logger.info(`[Seed] Created cancelled past booking: ${apptC._id} on ${apptC.date}`);
    }

    logger.info('[Seed] Database seeding run finished successfully.');
  } catch (err) {
    logger.error('[Seed] Database seeding run failed:', err);
  } finally {
    await mongoose.connection.close();
    logger.info('[Seed] Database connection closed.');
  }
};

runSeed();
