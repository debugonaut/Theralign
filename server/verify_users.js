import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';

dotenv.config();

const verify = async () => {
  try {
    console.log('Connecting to database:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const emails = ['patient@demo.com', 'doctor@demo.com', 'admin@physioconnect.com', 'admin@theralign.com'];
    for (const email of emails) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        console.log(`User ${email} NOT found.`);
        continue;
      }
      console.log(`\nUser: ${email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Hash: ${user.password}`);

      // Try common passwords
      const passwordsToTry = ['Demo@123456', 'Demo@1234', 'Admin@123456', 'Admin@Theralign1'];
      for (const pwd of passwordsToTry) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`  -> Password matches: "${pwd}"`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

verify();
