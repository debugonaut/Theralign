import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import All Models
import User from './src/models/User.model.js';
import DoctorProfile from './src/models/DoctorProfile.model.js';
import PatientProfile from './src/models/PatientProfile.model.js';
import AvailabilitySlot from './src/models/AvailabilitySlot.model.js';
import WeeklySchedule from './src/models/WeeklySchedule.model.js';
import Waitlist from './src/models/Waitlist.model.js';
import Appointment from './src/models/Appointment.model.js';
import Payment from './src/models/Payment.model.js';
import Review from './src/models/Review.model.js';
import Notification from './src/models/Notification.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const clean = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    // 1. Find all test users to delete
    // Demo accounts have emails ending in @demo.com or are admin@theralign.com
    const usersToDelete = await User.find({
      email: { 
        $not: /@demo\.com$/i,
        $ne: 'admin@theralign.com'
      }
    });

    if (usersToDelete.length === 0) {
      console.log('No registered test users found. Database is already clean!');
      return;
    }

    const deleteUserIds = usersToDelete.map(u => u._id);
    const deleteEmails = usersToDelete.map(u => u.email);

    console.log(`\nFound ${usersToDelete.length} test user(s) to delete:`);
    deleteEmails.forEach(email => console.log(` - ${email}`));

    // Fetch doctor profiles associated with these users
    const doctorProfiles = await DoctorProfile.find({ user: { $in: deleteUserIds } });
    const deleteDoctorProfileIds = doctorProfiles.map(p => p._id);

    console.log(`Found ${doctorProfiles.length} associated doctor profile(s) to delete.`);

    // 2. Perform deletions across all associated collections in dependency order
    console.log('\nCleaning up database records...');

    // A. Availability slots of deleted doctors
    const slotRes = await AvailabilitySlot.deleteMany({ doctor: { $in: deleteDoctorProfileIds } });
    console.log(`Deleted ${slotRes.deletedCount} availability slot(s).`);

    // B. Weekly schedules of deleted doctors
    const scheduleRes = await WeeklySchedule.deleteMany({ doctor: { $in: deleteDoctorProfileIds } });
    console.log(`Deleted ${scheduleRes.deletedCount} weekly schedule(s).`);

    // C. Waitlists involving deleted patients or doctors
    const waitlistRes = await Waitlist.deleteMany({
      $or: [
        { patient: { $in: deleteUserIds } },
        { doctor: { $in: deleteDoctorProfileIds } }
      ]
    });
    console.log(`Deleted ${waitlistRes.deletedCount} waitlist entry/entries.`);

    // D. Appointments involving deleted patients or doctors
    const apptRes = await Appointment.deleteMany({ 
      $or: [
        { patient: { $in: deleteUserIds } },
        { doctor: { $in: deleteDoctorProfileIds } }
      ]
    });
    console.log(`Deleted ${apptRes.deletedCount} appointment(s).`);

    // E. Payments involving deleted patients or doctors
    const payRes = await Payment.deleteMany({
      $or: [
        { patient: { $in: deleteUserIds } },
        { doctor: { $in: deleteDoctorProfileIds } }
      ]
    });
    console.log(`Deleted ${payRes.deletedCount} payment ledger record(s).`);

    // F. Patient profiles of deleted patients
    const patientProfileRes = await PatientProfile.deleteMany({ user: { $in: deleteUserIds } });
    console.log(`Deleted ${patientProfileRes.deletedCount} patient profile(s).`);

    // G. Doctor profiles of deleted doctors
    const profileRes = await DoctorProfile.deleteMany({ _id: { $in: deleteDoctorProfileIds } });
    console.log(`Deleted ${profileRes.deletedCount} doctor profile(s).`);

    // H. Reviews submitted by deleted patients
    const reviewRes = await Review.deleteMany({ patient: { $in: deleteUserIds } });
    console.log(`Deleted ${reviewRes.deletedCount} review(s).`);

    // I. Notifications destined for deleted users
    const notifyRes = await Notification.deleteMany({ recipient: { $in: deleteUserIds } });
    console.log(`Deleted ${notifyRes.deletedCount} notification(s).`);

    // J. User accounts
    const userRes = await User.deleteMany({ _id: { $in: deleteUserIds } });
    console.log(`Deleted ${userRes.deletedCount} user account(s).`);

    console.log('\nCleanup completed successfully!');

  } catch (err) {
    console.error('Error occurred during database cleanup:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

clean();
