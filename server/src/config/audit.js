import mongoose from 'mongoose';
import connectDB from './db.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import Appointment from '../models/Appointment.model.js';
import { ROLES, DOCTOR_STATUS } from '../utils/constants.js';

const runAudit = async () => {
  try {
    console.log('[Audit] Connecting to database...');
    await connectDB();

    console.log('\n==================================================');
    console.log('             DATABASE SEED AUDIT REPORT            ');
    console.log('==================================================\n');

    // 1. Audit Admin Accounts
    console.log('--- 1. ADMIN ACCOUNTS ---');
    const defaultAdmin = await User.findOne({ email: 'admin@theralign.com' });
    const physioAdmin = await User.findOne({ email: 'admin@physioconnect.com' });

    console.log(`- default admin (admin@theralign.com): ${defaultAdmin ? 'EXISTS' : 'MISSING'}`);
    console.log(`- requested admin (admin@physioconnect.com): ${physioAdmin ? 'EXISTS' : 'MISSING'}`);

    // 2. Audit Doctor Profiles
    console.log('\n--- 2. DOCTOR PROFILES ---');
    const totalDoctors = await DoctorProfile.countDocuments();
    const verifiedDoctors = await DoctorProfile.countDocuments({ verificationStatus: DOCTOR_STATUS.VERIFIED });
    const pendingDoctors = await DoctorProfile.countDocuments({ verificationStatus: DOCTOR_STATUS.PENDING });

    console.log(`- Total Doctor Profiles: ${totalDoctors}`);
    console.log(`- Verified Doctors:      ${verifiedDoctors}`);
    console.log(`- Pending Doctors:       ${pendingDoctors}`);

    // 3. Audit Pune Specific Doctors
    console.log('\n--- 3. PUNE DOCTORS INDEX ---');
    const puneDoctors = await DoctorProfile.find({ city: 'Pune' }).populate('user', 'name email');
    console.log(`- Verified Doctors in Pune: ${puneDoctors.length} (Expected >= 10)`);
    puneDoctors.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. Dr. ${doc.user?.name || 'Unknown'} (${doc.user?.email || 'N/A'}) - Coordinates: [${doc.clinicLocation.coordinates.join(', ')}]`);
    });

    // 4. Audit Historical Appointments
    console.log('\n--- 4. APPOINTMENT TRANSACTION LEDGERS ---');
    const totalAppts = await Appointment.countDocuments();
    const completedAppts = await Appointment.countDocuments({ status: 'completed' });
    console.log(`- Total Appointments: ${totalAppts}`);
    console.log(`- Completed:          ${completedAppts}`);

    console.log('\n==================================================');
    console.log('               AUDIT COMPLETE                     ');
    console.log('==================================================\n');

  } catch (error) {
    console.error('[Audit] Fatal error running database seed audit:', error);
  } finally {
    await mongoose.connection.close();
    console.log('[Audit] Database connection closed.');
  }
};

runAudit();
