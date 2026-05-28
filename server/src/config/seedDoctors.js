import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { ROLES, DOCTOR_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

const doctorSeeds = [
  {
    user: {
      name: 'Priya Sharma',
      email: 'priya.sharma@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Manual Therapy'],
      experience: 8,
      consultationFee: 800,
      bio: 'Dr. Priya Sharma is a certified sports physiotherapist with 8 years of clinical experience. She specializes in sports injury rehabilitation, athletic recovery, and musculoskeletal manual therapy. Over her career, she has treated numerous amateur and national-level athletes, helping them return safely and quickly to high-performance levels.',
      qualifications: ['BPT', 'MPT - Sports Medicine', 'CSCS'],
      clinicName: 'ActiveCare Physiotherapy & Sports Rehab',
      clinicAddress: 'Koregaon Park Road, Koregaon Park, Pune, Maharashtra 411001',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8935, 18.5362] },
      registrationNumber: 'MCI-PT-98271',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 23,
    }
  },
  {
    user: {
      name: 'Amit Patel',
      email: 'amit.patel@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Dry Needling'],
      experience: 12,
      consultationFee: 700,
      bio: 'Dr. Amit Patel is a senior orthopedic physical therapist with over a decade of practice. He specializes in post-surgical orthopedic rehab, chronic back and neck pain management, and dry needling. He is highly passionate about improving mobility and quality of life for patients recovery from bone, joint, and ligament disorders.',
      qualifications: ['BPT', 'MPT - Ortho', 'MIAP'],
      clinicName: 'OrthoFit Physiotherapy Clinic',
      clinicAddress: 'Baner-Balewadi Road, Baner, Pune, Maharashtra 411045',
      languages: ['English', 'Hindi', 'Gujarati'],
      clinicLocation: { type: 'Point', coordinates: [73.7898, 18.5590] },
      registrationNumber: 'MCI-PT-12495',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 31,
    }
  },
  {
    user: {
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Vestibular Rehabilitation'],
      experience: 10,
      consultationFee: 900,
      bio: 'Dr. Sneha Kulkarni is a specialized neuro-physiotherapist dedicated to treating stroke, Parkinson’s disease, multiple sclerosis, and vestibular/balance disorders. She focuses on neuroplasticity-based retraining methods to restore motor function and clinical stability for neurologically compromised patients.',
      qualifications: ['BPT', 'MPT - Neuro-Physiotherapy'],
      clinicName: 'NeuroRehab Centre of Excellence',
      clinicAddress: 'Paud Road, Rambaug Colony, Kothrud, Pune, Maharashtra 411038',
      languages: ['English', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8087, 18.5074] },
      registrationNumber: 'MCI-PT-45912',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 18,
    }
  },
  {
    user: {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Dry Needling'],
      experience: 5,
      consultationFee: 600,
      bio: 'Dr. Rohan Mehta is a dynamic sports physiotherapist working with active individuals, gym-goers, and track athletes. He implements modern evidence-based exercise therapy, active release techniques, and dry needling to manage soft-tissue injuries and facilitate faster return to play.',
      qualifications: ['BPT', 'CSCS', 'Dry Needling Practitioner'],
      clinicName: 'Apex Physio and Sports Medicine',
      clinicAddress: 'Viman Nagar Road, Datta Mandir Chowk, Viman Nagar, Pune, Maharashtra 411014',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [73.9167, 18.5679] },
      registrationNumber: 'MCI-PT-32811',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.5,
      totalReviews: 14,
    }
  },
  {
    user: {
      name: 'Anjali Deshmukh',
      email: 'anjali.deshmukh@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Geriatric Care', 'Cardiopulmonary Rehab'],
      experience: 15,
      consultationFee: 750,
      bio: 'Dr. Anjali Deshmukh is a highly skilled physiotherapist with 15 years of experience, specializing in senior citizen care and cardiopulmonary rehab. She assists older adults in managing arthritis, osteoporosis, gait problems, and post-cardiac surgery conditioning to enable independent living.',
      qualifications: ['BPT', 'MPT - Geriatrics', 'MIAP'],
      clinicName: 'Golden Age Physiotherapy Centre',
      clinicAddress: 'Solapur Road, Gadital, Hadapsar, Pune, Maharashtra 411028',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.9343, 18.5089] },
      registrationNumber: 'MCI-PT-20938',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 29,
    }
  },
  {
    user: {
      name: 'Vikram Singh',
      email: 'vikram.singh@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Manual Therapy', 'Orthopedic Physiotherapy'],
      experience: 9,
      consultationFee: 800,
      bio: 'Dr. Vikram Singh is a certified manual therapist. He combines osteopathic manipulations, spinal mobilization, and dry needling to manage acute joint locks, slip discs, sciatica, and mechanical joint disorders. His clinical treatments are highly hands-on and customized for long-term recovery.',
      qualifications: ['BPT', 'MPT - Orthopedic Physiotherapy', 'COMT'],
      clinicName: 'Spine & Joint Manual Therapy Clinic',
      clinicAddress: 'Wakad-Dange Chowk Road, Wakad, Pune, Maharashtra 411057',
      languages: ['English', 'Hindi', 'Punjabi'],
      clinicLocation: { type: 'Point', coordinates: [73.7613, 18.5986] },
      registrationNumber: 'MCI-PT-87261',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 22,
    }
  },
  {
    user: {
      name: 'Neha Joshi',
      email: 'neha.joshi@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy'],
      experience: 7,
      consultationFee: 650,
      bio: 'Dr. Neha Joshi focuses exclusively on child physical development and pediatric conditions. She provides compassionate rehabilitation for children suffering from cerebral palsy, developmental delays, muscular dystrophies, and congenital pediatric motor disorders in a kid-friendly environment.',
      qualifications: ['BPT', 'MPT - Pediatrics'],
      clinicName: 'Happy Steps Pediatric Physio',
      clinicAddress: 'DP Road, Aundh, Pune, Maharashtra 411007',
      languages: ['English', 'Hindi', 'Gujarati'],
      clinicLocation: { type: 'Point', coordinates: [73.8077, 18.5586] },
      registrationNumber: 'MCI-PT-39182',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 12,
    }
  },
  {
    user: {
      name: 'Sandeep Patil',
      email: 'sandeep.patil@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Cardiopulmonary Rehab'],
      experience: 11,
      consultationFee: 700,
      bio: 'Dr. Sandeep Patil is an expert in pulmonary and cardiac rehabilitation. He manages asthma, COPD, and post-bypass patients through systematic progressive aerobic training, breathing retraining, and cardiac safety monitoring to restore vital lung capacities.',
      qualifications: ['BPT', 'MPT - Cardiopulmonary Sciences'],
      clinicName: 'Pulse Cardio-Pulmonary Rehab Clinic',
      clinicAddress: 'MG Road, Camp, Pune, Maharashtra 411001',
      languages: ['English', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8777, 18.5176] },
      registrationNumber: 'MCI-PT-11029',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 15,
    }
  },
  {
    user: {
      name: 'Meera Nair',
      email: 'meera.nair@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Vestibular Rehabilitation', 'Neurological Rehabilitation'],
      experience: 6,
      consultationFee: 850,
      bio: 'Dr. Meera Nair focuses on balance, dizziness, and neurological retraining. She has deep clinical experience in vestibular rehab, benign paroxysmal positional vertigo (BPPV) canalith repositioning, and gait correction for elderly and post-trauma patients.',
      qualifications: ['BPT', 'MPT - Neuro-Sciences'],
      clinicName: 'Equilibrium Vestibular Clinic',
      clinicAddress: 'Deccan Gymkhana, Pune, Maharashtra 411004',
      languages: ['English', 'Malayalam', 'Tamil'],
      clinicLocation: { type: 'Point', coordinates: [73.8476, 18.5089] },
      registrationNumber: 'MCI-PT-45920',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 19,
    }
  },
  {
    user: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Manual Therapy'],
      experience: 18,
      consultationFee: 950,
      bio: 'Dr. Rajesh Kumar is a veteran physiotherapist with over 18 years of experience. He is an authority on non-surgical spine treatment, spinal decompression, sciatica, and advanced orthopedic manual therapy. He has successfully treated thousands of complicated chronic cases.',
      qualifications: ['BPT', 'MPT - Ortho', 'COMT', 'FIAOM'],
      clinicName: 'Spine & Musculoskeletal Expert Centre',
      clinicAddress: 'Hinjewadi Phase 1, Near IT Park, Hinjewadi, Pune, Maharashtra 411057',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [73.7375, 18.5914] },
      registrationNumber: 'MCI-PT-77291',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 45,
    }
  },
  {
    user: {
      name: 'Pooja Hegde',
      email: 'pooja.hegde@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Dry Needling', 'Sports Injury Rehab'],
      experience: 4,
      consultationFee: 500,
      bio: 'Dr. Pooja Hegde is a certified dry needling practitioner and clinical sports physical therapist. She specializes in myofascial trigger point release, chronic muscle spasms, shoulder impingements, and post-workout muscle restoration for active adults.',
      qualifications: ['BPT', 'Certified Dry Needling Specialist'],
      clinicName: 'Pooja Hegde Physiotherapy Clinic',
      clinicAddress: 'Shivajinagar Road, Near FC Road, Shivajinagar, Pune, Maharashtra 411005',
      languages: ['English', 'Kannada', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [73.8252, 18.5284] },
      registrationNumber: 'MCI-PT-90182',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.4,
      totalReviews: 8,
    }
  },
  {
    user: {
      name: 'Rahul Verma',
      email: 'rahul.verma@demo.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Geriatric Care'],
      experience: 14,
      consultationFee: 850,
      bio: 'Dr. Rahul Verma possesses 14 years of clinical experience in neurological and age-related physical rehabilitation. He treats stroke survivors, Parkinson’s cases, balancing disorders, and handles fall-prevention exercise programs for geriatric populations.',
      qualifications: ['BPT', 'MPT - Neuro', 'MIAP'],
      clinicName: 'CarePlus Neuro & Geriatric Care',
      clinicAddress: 'Wanowrie Main Road, Near Kedari Petrol Pump, Wanowrie, Pune, Maharashtra 411040',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [73.9015, 18.5152] },
      registrationNumber: 'MCI-PT-28938',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 20,
    }
  }
];

export const seedDoctors = async () => {
  try {
    const existingCount = await DoctorProfile.countDocuments();
    if (existingCount >= 10) {
      logger.info('[Seed] Doctors already seeded — skipping.');
      return;
    }

    logger.info(`[Seed] Starting seed of ${doctorSeeds.length} doctor profiles...`);

    for (const seed of doctorSeeds) {
      // Find or create User
      let user = await User.findOne({ email: seed.user.email });
      if (!user) {
        user = await User.create(seed.user);
        logger.info(`[Seed] Created doctor user: ${seed.user.email}`);
      }

      // Check if profile exists
      let profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        await DoctorProfile.create({
          ...seed.profile,
          user: user._id,
        });
        logger.info(`[Seed] Created profile for: Dr. ${seed.user.name}`);
      }
    }

    logger.info(`[Seed] Successfully seeded ${doctorSeeds.length} doctor profiles.`);
  } catch (err) {
    logger.error('[Seed] Failed to seed doctor profiles:', err.message);
  }
};

export default seedDoctors;
