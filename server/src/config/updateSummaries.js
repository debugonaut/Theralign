import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import logger from '../utils/logger.js';
import { ROLES } from '../utils/constants.js';

const doctorSeeds = [
  {
    email: 'priya.sharma@demo.com',
    aiSummary: 'Dr. Priya Sharma specializes in sports injury rehabilitation and manual therapy with over 8 years of experience. She combines evidence-based athletic recovery methods with custom rehabilitation plans to safely return patients to their peak performance.',
  },
  {
    email: 'amit.patel@demo.com',
    aiSummary: 'Dr. Amit Patel specializes in orthopedic physiotherapy and dry needling with 12 years of experience. He is dedicated to post-surgical rehabilitation and chronic pain management, helping patients regain optimal mobility and joint function.',
  },
  {
    email: 'sneha.kulkarni@demo.com',
    aiSummary: 'Dr. Sneha Kulkarni is a neurological physical therapist with 10 years of experience specializing in stroke recovery and balance retraining. She uses neuroplasticity-based methods to restore motor control and physical independence.',
  },
  {
    email: 'rohan.mehta@demo.com',
    aiSummary: 'Dr. Rohan Mehta specializes in sports injury rehabilitation and dry needling with 5 years of experience. He uses dynamic, evidence-based exercise therapies to manage soft-tissue injuries and speed up athletic return-to-play.',
  },
  {
    email: 'anjali.deshmukh@demo.com',
    aiSummary: 'Dr. Anjali Deshmukh has 15 years of experience specializing in geriatric care and cardiopulmonary rehabilitation. She is dedicated to helping older adults manage arthritis, regain stability, and improve overall functional independence.',
  },
  {
    email: 'vikram.singh@demo.com',
    aiSummary: 'Dr. Vikram Singh is a manual therapy and orthopedic specialist with 9 years of experience. He uses hands-on spinal mobilization and chiropractic techniques to treat acute joint pain, slip discs, and sciatica.',
  },
  {
    email: 'neha.joshi@demo.com',
    aiSummary: 'Dr. Neha Joshi is a pediatric physiotherapist with 7 years of experience helping children with physical development challenges. She provides gentle, specialized care for cerebral palsy and developmental delays in a welcoming environment.',
  },
  {
    email: 'sandeep.patil@demo.com',
    aiSummary: 'Dr. Sandeep Patil is a cardiopulmonary specialist with 11 years of experience in cardiac and respiratory rehabilitation. He designs personalized progressive exercise programs to restore lung capacity and heart health.',
  },
  {
    email: 'meera.nair@demo.com',
    aiSummary: 'Dr. Meera Nair focuses on balance, dizziness, and neurological retraining. She has deep clinical experience in vestibular rehab, benign paroxysmal positional vertigo (BPPV) canalith repositioning, and gait correction for elderly and post-trauma patients.',
  },
  {
    email: 'rajesh.kumar@demo.com',
    aiSummary: 'Dr. Rajesh Kumar is a veteran physiotherapist with over 18 years of experience. He is an authority on non-surgical spine treatment, spinal decompression, sciatica, and advanced orthopedic manual therapy. He has successfully treated thousands of complicated chronic cases.',
  },
  {
    email: 'pooja.hegde@demo.com',
    aiSummary: 'Dr. Pooja Hegde is a certified dry needling practitioner and clinical sports physical therapist. She specializes in myofascial trigger point release, chronic muscle spasms, shoulder impingements, and post-workout muscle restoration for active adults.',
  },
  {
    email: 'rahul.verma@demo.com',
    aiSummary: 'Dr. Rahul Verma possesses 14 years of clinical experience in neurological and age-related physical rehabilitation. He treats stroke survivors, Parkinson’s cases, balancing disorders, and handles fall-prevention exercise programs for geriatric populations.',
  }
];

const updateSummaries = async () => {
  try {
    logger.info('[Update] Initializing summaries update script...');
    await connectDB();

    for (const seed of doctorSeeds) {
      const user = await User.findOne({ email: seed.email, role: ROLES.DOCTOR });
      if (user) {
        const profile = await DoctorProfile.findOne({ user: user._id });
        if (profile) {
          profile.aiSummary = seed.aiSummary;
          await profile.save();
          logger.info(`[Update] Pre-seeded summary for: Dr. ${user.name}`);
        } else {
          logger.warn(`[Update] Profile not found for doctor: ${seed.email}`);
        }
      } else {
        logger.warn(`[Update] User not found for doctor: ${seed.email}`);
      }
    }

    logger.info('[Update] AI summaries pre-seeding update completed successfully.');
  } catch (err) {
    logger.error('[Update] Summaries update failed:', err);
  } finally {
    await mongoose.connection.close();
    logger.info('[Update] Database connection closed.');
  }
};

updateSummaries();
