import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import { ROLES, DOCTOR_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

const doctorSeeds = [
  // ─── PUNE (6 Doctors) ───────────────────────────────────────────────────────
  {
    user: {
      name: 'Priya Sharma',
      email: 'doctor@demo.com', // Map README demo doctor email
      password: 'Demo@123456',
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
      city: 'Pune',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8935, 18.5362] },
      registrationNumber: 'MCI-PT-98271',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 23,
      aiSummary: 'Dr. Priya Sharma specializes in sports injury rehabilitation and manual therapy with over 8 years of experience. She combines evidence-based athletic recovery methods with custom rehabilitation plans to safely return patients to their peak performance.',
    }
  },
  {
    user: {
      name: 'Amit Patel',
      email: 'amit.patel@demo.com',
      password: 'Demo@1234',
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
      city: 'Pune',
      languages: ['English', 'Hindi', 'Gujarati'],
      clinicLocation: { type: 'Point', coordinates: [73.7898, 18.5590] },
      registrationNumber: 'MCI-PT-12495',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 31,
      aiSummary: 'Dr. Amit Patel specializes in orthopedic physiotherapy and dry needling with 12 years of experience. He is dedicated to post-surgical rehabilitation and chronic pain management, helping patients regain optimal mobility and joint function.',
    }
  },
  {
    user: {
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@demo.com',
      password: 'Demo@1234',
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
      city: 'Pune',
      languages: ['English', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8087, 18.5074] },
      registrationNumber: 'MCI-PT-45912',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 18,
      aiSummary: 'Dr. Sneha Kulkarni is a neurological physical therapist with 10 years of experience specializing in stroke recovery and balance retraining. She uses neuroplasticity-based methods to restore motor control and physical independence.',
    }
  },
  {
    user: {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@demo.com',
      password: 'Demo@1234',
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
      city: 'Pune',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [73.9167, 18.5679] },
      registrationNumber: 'MCI-PT-32811',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.5,
      totalReviews: 14,
      aiSummary: 'Dr. Rohan Mehta specializes in sports injury rehabilitation and dry needling with 5 years of experience. He uses dynamic, evidence-based exercise therapies to manage soft-tissue injuries and speed up athletic return-to-play.',
    }
  },
  {
    user: {
      name: 'Anjali Deshmukh',
      email: 'anjali.deshmukh@demo.com',
      password: 'Demo@1234',
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
      city: 'Pune',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.9343, 18.5089] },
      registrationNumber: 'MCI-PT-20938',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 29,
      aiSummary: 'Dr. Anjali Deshmukh has 15 years of experience specializing in geriatric care and cardiopulmonary rehabilitation. She is dedicated to helping older adults manage arthritis, regain stability, and improve overall functional independence.',
    }
  },
  {
    user: {
      name: 'Neha Joshi',
      email: 'neha.joshi@demo.com',
      password: 'Demo@1234',
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
      city: 'Pune',
      languages: ['English', 'Hindi', 'Gujarati'],
      clinicLocation: { type: 'Point', coordinates: [73.8077, 18.5586] },
      registrationNumber: 'MCI-PT-39182',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 12,
      aiSummary: 'Dr. Neha Joshi is a pediatric physiotherapist with 7 years of experience helping children with physical development challenges. She provides gentle, specialized care for cerebral palsy and developmental delays in a welcoming environment.',
    }
  },
  {
    user: {
      name: 'Vikram Deshpande',
      email: 'vikram.deshpande@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Manual Therapy'],
      experience: 11,
      consultationFee: 750,
      bio: 'Dr. Vikram Deshpande is an orthopedic and spinal manual therapy expert with 11 years of experience. He specializes in lumbar disc disorders, sciatica, and cervical strain management using chiropractic alignments and core stabilization routines.',
      qualifications: ['BPT', 'MPT - Ortho', 'COMT'],
      clinicName: 'SpineCare & Joints Physio Clinic',
      clinicAddress: 'Senapati Bapat Road, Shivajinagar, Pune, Maharashtra 411016',
      city: 'Pune',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8306, 18.5309] },
      registrationNumber: 'MCI-PT-77281',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 20,
      aiSummary: 'Dr. Vikram Deshpande specializes in spine care, joint manual therapy, and orthopedic rehabilitation. He has over 11 years of experience in Pune.',
    }
  },
  {
    user: {
      name: 'Meera Nair',
      email: 'meera.nair@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy', 'Neurological Rehabilitation'],
      experience: 9,
      consultationFee: 700,
      bio: 'Dr. Meera Nair is a dedicated pediatric and neuro-developmental therapist with 9 years of practice. She specializes in cerebral palsy rehabilitation, developmental motor delays, and children sensory motor training programs.',
      qualifications: ['BPT', 'MPT - Pediatrics'],
      clinicName: 'Healwell Posture & Pediatric Care',
      clinicAddress: 'MG Road, Camp, Pune, Maharashtra 411001',
      city: 'Pune',
      languages: ['English', 'Hindi', 'Malayalam'],
      clinicLocation: { type: 'Point', coordinates: [73.8789, 18.5178] },
      registrationNumber: 'MCI-PT-66192',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 15,
      aiSummary: 'Dr. Meera Nair focuses on child motor progress and pediatric neurological conditions with 9 years of clinical rehabilitation experience in Camp, Pune.',
    }
  },
  {
    user: {
      name: 'Rajesh Patil',
      email: 'rajesh.patil@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Dry Needling'],
      experience: 6,
      consultationFee: 600,
      bio: 'Dr. Rajesh Patil specializes in dry needling and sports strain rehabilitation. He works with track athletes and gym goers in Pune to help them recover from acute knee pain, runner strain, and soft-tissue injury limits.',
      qualifications: ['BPT', 'CSCS', 'Dry Needling Cert'],
      clinicName: 'Patil Sports & Orthopedic Clinic',
      clinicAddress: 'J.M. Road, Deccan Gymkhana, Pune, Maharashtra 411004',
      city: 'Pune',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8446, 18.5190] },
      registrationNumber: 'MCI-PT-33829',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 18,
      aiSummary: 'Dr. Rajesh Patil uses active sports rehab and systematic dry needling to manage athletic soft tissue sprains and joint pain with 6 years of experience.',
    }
  },
  {
    user: {
      name: 'Harish Kale',
      email: 'harish.kale@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Geriatric Care'],
      experience: 14,
      consultationFee: 800,
      bio: 'Dr. Harish Kale has spent 14 years in clinical practice treating neurological stroke survivors, Parkinson’s, and senior gait disorders. He is dedicated to helping older adults manage chronic balance problems.',
      qualifications: ['BPT', 'MPT - Neuro', 'MIAP'],
      clinicName: 'Kale Neurological & Geriatric Clinic',
      clinicAddress: 'Satara Road, Bibwewadi, Pune, Maharashtra 411037',
      city: 'Pune',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [73.8598, 18.4876] },
      registrationNumber: 'MCI-PT-22938',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 26,
      aiSummary: 'Dr. Harish Kale specializes in stroke rehabilitation, geriatric balance training, and neurological care with 14 years of clinical practice in Bibwewadi, Pune.',
    }
  },

  // ─── MUMBAI (7 Doctors) ─────────────────────────────────────────────────────
  {
    user: {
      name: 'Karan Malhotra',
      email: 'karan.malhotra@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Dry Needling'],
      experience: 9,
      consultationFee: 1000,
      bio: 'Dr. Karan Malhotra is a premium sports physiotherapist in South Mumbai. He provides physical therapy, muscular assessment, dry needling, and athletic tape support to professional marathoners, footballers, and active corporate athletes.',
      qualifications: ['BPT', 'MPT - Sports Injury', 'Dry Needling Cert'],
      clinicName: 'ProStrike Sports Rehab & Fitness',
      clinicAddress: 'Colaba Causeway, Near Gateway, Mumbai, Maharashtra 400001',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Punjabi'],
      clinicLocation: { type: 'Point', coordinates: [72.8276, 18.9102] },
      registrationNumber: 'MCI-PT-77182',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 35,
      aiSummary: 'Dr. Karan Malhotra has 9 years of experience in high-performance sports injury rehabilitation and dry needling. He works extensively with competitive athletes in Mumbai to prevent and recover from major muscle and joint injuries.',
    }
  },
  {
    user: {
      name: 'Shalini Sen',
      email: 'shalini.sen@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Vestibular Rehabilitation'],
      experience: 14,
      consultationFee: 1200,
      bio: 'Dr. Shalini Sen is a highly acclaimed neurological therapist. She specializes in motor control recovery for post-stroke hemiplegia, vestibular neuronitis balance training, and chronic neuropathic pain management using neuro-developmental techniques (NDT).',
      qualifications: ['BPT', 'MPT - Neurology', 'NDT Certified'],
      clinicName: 'NeuroAction Rehabilitation Clinic',
      clinicAddress: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      city: 'Mumbai',
      languages: ['English', 'Bengali', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [72.8339, 19.0600] },
      registrationNumber: 'MCI-PT-33291',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 27,
      aiSummary: 'Dr. Shalini Sen is an NDT-certified neurological physical therapist with 14 years of experience. She focuses on complex stroke recovery and vestibular balance rehabilitation in South-Central Mumbai.',
    }
  },
  {
    user: {
      name: 'Aditya Roy',
      email: 'aditya.roy@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Manual Therapy'],
      experience: 11,
      consultationFee: 950,
      bio: 'Dr. Aditya Roy is a passionate joint mobilization expert specializing in non-surgical relief for lumbar disc herniation, cervical spondylosis, and knee arthritis. His hands-on manual adjustment techniques are supported by modern postural correction routines.',
      qualifications: ['BPT', 'MPT - Orthopedics', 'COMT'],
      clinicName: 'SpineAlign Joint & Manual Clinic',
      clinicAddress: 'Gokhale Road, Dadar West, Mumbai, Maharashtra 400028',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Bengali'],
      clinicLocation: { type: 'Point', coordinates: [72.8362, 19.0178] },
      registrationNumber: 'MCI-PT-82711',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 19,
      aiSummary: 'Dr. Aditya Roy is an orthopedic manual physical therapist with 11 years of experience in Mumbai. He is widely recognized for his expertise in spinal alignments and postural muscle retraining.',
    }
  },
  {
    user: {
      name: 'Riddhi Shah',
      email: 'riddhi.shah@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Geriatric Care', 'Orthopedic Physiotherapy'],
      experience: 16,
      consultationFee: 850,
      bio: 'Dr. Riddhi Shah has spent 16 years focusing on musculoskeletal conditions in elderly populations. She assists seniors with osteoporosis, rheumatoid arthritis, osteoarthritis, and age-related balance instabilities to reduce fall risks and sustain daily living comfort.',
      qualifications: ['BPT', 'MPT - Geriatrics'],
      clinicName: 'Healthy Aging Physiotherapy',
      clinicAddress: 'SV Road, Andheri West, Mumbai, Maharashtra 400058',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Gujarati'],
      clinicLocation: { type: 'Point', coordinates: [72.8479, 19.1197] },
      registrationNumber: 'MCI-PT-11028',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 24,
      aiSummary: 'Dr. Riddhi Shah specializes in geriatric care and orthopedic physiotherapy with 16 years of clinical experience. She helps senior patients in Mumbai manage arthritis, regain balance, and preserve independence.',
    }
  },
  {
    user: {
      name: 'Sameer Kazi',
      email: 'sameer.kazi@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Cardiopulmonary Rehab'],
      experience: 13,
      consultationFee: 900,
      bio: 'Dr. Sameer Kazi provides clinical cardiopulmonary physical therapy, focusing on exercise prescription for post-bypass surgery recovery, asthma control, COPD management, and strengthening vital chest expansion muscles.',
      qualifications: ['BPT', 'MPT - Cardiopulmonary Sciences', 'MIAP'],
      clinicName: 'Pulse Cardio Lung Rehab',
      clinicAddress: 'LBS Marg, Ghatkopar West, Mumbai, Maharashtra 400086',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [72.9102, 19.0864] },
      registrationNumber: 'MCI-PT-92081',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 16,
      aiSummary: 'Dr. Sameer Kazi is an expert in cardiopulmonary rehabilitation with 13 years of clinical practice. He specializes in post-cardiac surgery recovery and lung volume optimization.',
    }
  },
  {
    user: {
      name: 'Tanvi Joshi',
      email: 'tanvi.joshi@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy'],
      experience: 6,
      consultationFee: 800,
      bio: 'Dr. Tanvi Joshi specializes in compassionate pediatric therapy. She works with babies and kids experiencing sensory integration issues, cerebral palsy, torticollis, developmental milestone delays, and hypermobility.',
      qualifications: ['BPT', 'MPT - Pediatrics'],
      clinicName: 'Little Steps Pediatric Care',
      clinicAddress: 'Eastern Express Hwy, Thane West, Mumbai, Maharashtra 400601',
      city: 'Mumbai',
      languages: ['English', 'Hindi', 'Marathi'],
      clinicLocation: { type: 'Point', coordinates: [72.9781, 19.2183] },
      registrationNumber: 'MCI-PT-48291',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.5,
      totalReviews: 11,
      aiSummary: 'Dr. Tanvi Joshi has 6 years of experience specializing in pediatric developmental physical therapy. She designs play-based exercises to help children achieve critical mobility milestones.',
    }
  },
  {
    user: {
      name: 'Vikram Seth',
      email: 'vikram.seth@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Manual Therapy', 'Dry Needling'],
      experience: 10,
      consultationFee: 1100,
      bio: 'Dr. Vikram Seth is a renowned osteopathic and chiropractic manual therapist in South Mumbai. He applies targeted spinal adjustments, dry needling, and myofascial triggers release to eliminate severe back locks, neck strain, and tension headaches.',
      qualifications: ['BPT', 'MPT - Ortho', 'COMT', 'Dry Needling Cert'],
      clinicName: 'Seth Osteo & Manual Clinic',
      clinicAddress: 'Pedder Road, Kemps Corner, Mumbai, Maharashtra 400026',
      city: 'Mumbai',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [72.8089, 18.9702] },
      registrationNumber: 'MCI-PT-88273',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 22,
      aiSummary: 'Dr. Vikram Seth combines advanced joint manual therapy and dry needling with 10 years of experience. He is dedicated to chronic postural correction and immediate spine pain relief.',
    }
  },

  // ─── BANGALORE (7 Doctors) ──────────────────────────────────────────────────
  {
    user: {
      name: 'Rohan Kapoor',
      email: 'rohan.kapoor@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Manual Therapy'],
      experience: 10,
      consultationFee: 1100,
      bio: 'Dr. Rohan Kapoor is an elite sports and manual therapist in Bangalore. He manages acute ligament sprains, tennis elbow, ACL tears, and provides customized biomechanical alignment corrections for running enthusiasts.',
      qualifications: ['BPT', 'MPT - Sports Physio', 'Cert Manual Therapist'],
      clinicName: 'Elite Sports Science Clinic',
      clinicAddress: '100 Feet Road, Indiranagar, Bangalore, Karnataka 560038',
      city: 'Bangalore',
      languages: ['English', 'Hindi', 'Kannada'],
      clinicLocation: { type: 'Point', coordinates: [77.6409, 12.9719] },
      registrationNumber: 'MCI-PT-90281',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 42,
      aiSummary: 'Dr. Rohan Kapoor is a highly experienced sports Injury rehab and manual therapist based in Indiranagar, Bangalore. He specializes in athletic assessment, runners knee rehabilitation, and pre/post-operative sports surgeries recovery.',
    }
  },
  {
    user: {
      name: 'Deepika Iyer',
      email: 'deepika.iyer@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Vestibular Rehabilitation'],
      experience: 8,
      consultationFee: 950,
      bio: 'Dr. Deepika Iyer is a clinical neuro-physiotherapist specializing in balance control, multiple sclerosis rehab, stroke recovery, and vestibular canalith repositioning for benign paroxysmal positional vertigo (BPPV).',
      qualifications: ['BPT', 'MPT - Neurological Sciences'],
      clinicName: 'Equilibrium Neuro Balance Lab',
      clinicAddress: '80 Feet Road, Koramangala, Bangalore, Karnataka 560034',
      city: 'Bangalore',
      languages: ['English', 'Tamil', 'Kannada'],
      clinicLocation: { type: 'Point', coordinates: [77.6186, 12.9352] },
      registrationNumber: 'MCI-PT-45911',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 15,
      aiSummary: 'Dr. Deepika Iyer has 8 years of neurological and vestibular rehabilitation expertise in Bangalore. She implements motor sensory retraining and balance training loops to re-establish coordination.',
    }
  },
  {
    user: {
      name: 'Karthik Rao',
      email: 'karthik.rao@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Dry Needling'],
      experience: 13,
      consultationFee: 900,
      bio: 'Dr. Karthik Rao is a certified dry needling therapist. He manages osteoarthritis knee pain, frozen shoulder, chronic plantar fasciitis, and lumbar muscle trigger points through highly systematic and painless dry needle therapy.',
      qualifications: ['BPT', 'MPT - Ortho', 'Dry Needling Cert'],
      clinicName: 'Rao Ortho & Muscle Rehab',
      clinicAddress: 'Outer Ring Road, HSR Layout, Bangalore, Karnataka 560102',
      city: 'Bangalore',
      languages: ['English', 'Kannada', 'Telugu'],
      clinicLocation: { type: 'Point', coordinates: [77.6412, 12.9116] },
      registrationNumber: 'MCI-PT-28919',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 28,
      aiSummary: 'Dr. Karthik Rao specializes in orthopedic conditions and dry needling in South Bangalore with 13 years of experience. He is dedicated to relieving chronic myofascial pain and improving joint range.',
    }
  },
  {
    user: {
      name: 'Kavitha Swamy',
      email: 'kavitha.swamy@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Geriatric Care', 'Cardiopulmonary Rehab'],
      experience: 18,
      consultationFee: 1000,
      bio: 'Dr. Kavitha Swamy has spent nearly two decades assisting elderly individuals in regaining movement. She specializes in cardiac post-surgical rehab, geriatric balance stabilization, arthritis management, and custom safe home exercise program coaching.',
      qualifications: ['BPT', 'MPT - Geriatrics', 'MIAP'],
      clinicName: 'Aria Senior Physiotherapy Center',
      clinicAddress: 'Bannerghatta Main Road, JP Nagar, Bangalore, Karnataka 560078',
      city: 'Bangalore',
      languages: ['English', 'Kannada', 'Tamil'],
      clinicLocation: { type: 'Point', coordinates: [77.5960, 12.9074] },
      registrationNumber: 'MCI-PT-18290',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 33,
      aiSummary: 'Dr. Kavitha Swamy is a veteran senior care and cardiopulmonary physiotherapist with 18 years of experience. She focuses on cardiac reconditioning and longevity enhancement for active elders.',
    }
  },
  {
    user: {
      name: 'Siddharth Hegde',
      email: 'siddharth.hegde@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Manual Therapy', 'Orthopedic Physiotherapy'],
      experience: 7,
      consultationFee: 850,
      bio: 'Dr. Siddharth Hegde is a certified spinal manual therapist. He specializes in osteopathic adjustments, lumbar traction, mechanical traction, active release techniques (ART), and deep friction massage for acute muscle locks.',
      qualifications: ['BPT', 'MPT - Ortho', 'COMT'],
      clinicName: 'Hegde Spine & Joint Care',
      clinicAddress: 'CMH Road, Halasuru, Bangalore, Karnataka 560008',
      city: 'Bangalore',
      languages: ['English', 'Kannada', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.6264, 12.9778] },
      registrationNumber: 'MCI-PT-98282',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 14,
      aiSummary: 'Dr. Siddharth Hegde is an orthopedic manual physical therapist with 7 years of clinical experience. He applies targeted chiropractic and manual spinal techniques to restore range of motion.',
    }
  },
  {
    user: {
      name: 'Namrata Reddy',
      email: 'namrata.reddy@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy'],
      experience: 9,
      consultationFee: 800,
      bio: 'Dr. Namrata Reddy is a pediatric motor development physical therapist. She designs developmental exercises for children with congenital neuromuscular conditions, cerebral palsy, and muscular dystrophies.',
      qualifications: ['BPT', 'MPT - Pediatric Physiotherapy'],
      clinicName: 'First Steps Pediatric Clinic',
      clinicAddress: '100 Feet Road, HAL 2nd Stage, Bangalore, Karnataka 560008',
      city: 'Bangalore',
      languages: ['English', 'Telugu', 'Kannada'],
      clinicLocation: { type: 'Point', coordinates: [77.6398, 12.9698] },
      registrationNumber: 'MCI-PT-49281',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 21,
      aiSummary: 'Dr. Namrata Reddy specializes in developmental delay and pediatric conditions. She provides playful and supportive physical therapy to help children improve their walking and core motor stability.',
    }
  },
  {
    user: {
      name: 'Abhishek Gowda',
      email: 'abhishek.gowda@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Cardiopulmonary Rehab', 'Sports Injury Rehab'],
      experience: 11,
      consultationFee: 900,
      bio: 'Dr. Abhishek Gowda specializes in respiratory care and progressive endurance reconditioning. He assists elite sports athletes, post-surgical lung patients, and post-COVID survivors in increasing metabolic stamina and lung vital capacity.',
      qualifications: ['BPT', 'MPT - Cardiopulmonary Sciences'],
      clinicName: 'CardioFit Endurance Care',
      clinicAddress: 'Sarjapur Main Road, Bellandur, Bangalore, Karnataka 560103',
      city: 'Bangalore',
      languages: ['English', 'Kannada', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.6749, 12.9284] },
      registrationNumber: 'MCI-PT-28394',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 18,
      aiSummary: 'Dr. Abhishek Gowda is a cardiopulmonary specialist with 11 years of experience in Bangalore. He integrates pulmonary health with progressive load-bearing exercise programs to speed recovery.',
    }
  },

  // ─── DELHI (6 Doctors) ──────────────────────────────────────────────────────
  {
    user: {
      name: 'Vikrant Chaudhary',
      email: 'vikrant.chaudhary@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Manual Therapy'],
      experience: 11,
      consultationFee: 1000,
      bio: 'Dr. Vikrant Chaudhary is a highly respected sports physical therapist in Delhi NCR. He focuses on muscle tear healing, dry needling, active release techniques, and functional movement screens for professional and collegiate athletes.',
      qualifications: ['BPT', 'MPT - Sports Medicine', 'CSCS'],
      clinicName: 'National Sports Injury & Manual Centre',
      clinicAddress: 'Pusa Road, Karol Bagh, New Delhi, Delhi 110005',
      city: 'Delhi',
      languages: ['English', 'Hindi', 'Punjabi'],
      clinicLocation: { type: 'Point', coordinates: [77.1902, 28.6441] },
      registrationNumber: 'MCI-PT-82713',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 38,
      aiSummary: 'Dr. Vikrant Chaudhary is an elite sports physiotherapist with 11 years of experience in Central Delhi. He specializes in athletic muscle reconditioning, joint mechanics, and return-to-sport protocols.',
    }
  },
  {
    user: {
      name: 'Ritu Verma',
      email: 'ritu.verma@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Vestibular Rehabilitation'],
      experience: 12,
      consultationFee: 950,
      bio: 'Dr. Ritu Verma is a dedicated neuro-rehab clinician. She implements neuroplasticity training programs for patients recovering from traumatic brain injuries, stroke, balance loss, and chronic vestibular vertigo.',
      qualifications: ['BPT', 'MPT - Neurology', 'NDT Cert'],
      clinicName: 'Cognitive & Neuro-Rehab Center',
      clinicAddress: 'Ring Road, Lajpat Nagar III, New Delhi, Delhi 110024',
      city: 'Delhi',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.2435, 28.5694] },
      registrationNumber: 'MCI-PT-39281',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 24,
      aiSummary: 'Dr. Ritu Verma specializes in neurological and vestibular rehab in Delhi with 12 years of experience. She focuses on motor control learning and coordination training.',
    }
  },
  {
    user: {
      name: 'Manish Gupta',
      email: 'manish.gupta@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Dry Needling'],
      experience: 15,
      consultationFee: 900,
      bio: 'Dr. Manish Gupta has extensive clinical practice in spinal decompression, knee osteoarthritis therapies, and post-fracture joint stiffening treatments. He is a certified dry needling expert.',
      qualifications: ['BPT', 'MPT - Orthopedics', 'Dry Needling Spec'],
      clinicName: 'Apex Spine & Orthopedic Care',
      clinicAddress: 'Connaught Place, Radial Road 3, New Delhi, Delhi 110001',
      city: 'Delhi',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.2197, 28.6304] },
      registrationNumber: 'MCI-PT-11928',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 29,
      aiSummary: 'Dr. Manish Gupta has 15 years of experience specializing in orthopedic care and dry needling in Central Delhi. He handles non-surgical disk pain management and joint mobilization.',
    }
  },
  {
    user: {
      name: 'Sneh Lata',
      email: 'sneh.lata@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Geriatric Care', 'Orthopedic Physiotherapy'],
      experience: 19,
      consultationFee: 850,
      bio: 'Dr. Sneh Lata is a senior geriatric movement physical therapist. She supports senior citizens managing rheumatoid arthritis, gait problems, spinal stenosis, and designs safe physical conditioning routines.',
      qualifications: ['BPT', 'MPT - Geriatric Physio', 'MIAP'],
      clinicName: 'Golden Years Active Living Clinic',
      clinicAddress: 'Saket District Centre, Saket, New Delhi, Delhi 110017',
      city: 'Delhi',
      languages: ['English', 'Hindi', 'Punjabi'],
      clinicLocation: { type: 'Point', coordinates: [77.2084, 28.5221] },
      registrationNumber: 'MCI-PT-11029',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 31,
      aiSummary: 'Dr. Sneh Lata specializes in senior physical therapy and age-related orthopedic issues in South Delhi. She has 19 years of clinical expertise focused on functional motor independence.',
    }
  },
  {
    user: {
      name: 'Kunal Kapoor',
      email: 'kunal.kapoor@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Cardiopulmonary Rehab'],
      experience: 10,
      consultationFee: 800,
      bio: 'Dr. Kunal Kapoor specializes in respiratory physiotherapy and active cardiovascular reconditioning. He assists asthma, bronchitis, and post-infarct cardiac patients in strengthening respiratory stamina.',
      qualifications: ['BPT', 'MPT - Cardiopulmonary Rehab'],
      clinicName: 'Stamina Cardio-Pulmonary Care',
      clinicAddress: 'Vikas Marg, Laxmi Nagar, New Delhi, Delhi 110092',
      city: 'Delhi',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.2798, 28.6360] },
      registrationNumber: 'MCI-PT-38194',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 17,
      aiSummary: 'Dr. Kunal Kapoor is a cardiopulmonary physical therapist with 10 years of experience in East Delhi. He focuses on chest clearance, breathing exercises, and aerobic endurance training.',
    }
  },
  {
    user: {
      name: 'Preeti Bansal',
      email: 'preeti.bansal@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy'],
      experience: 8,
      consultationFee: 750,
      bio: 'Dr. Preeti Bansal provides pediatric physical therapy. She designs play-based developmental exercises for infants and kids experiencing torticollis, cerebral palsy, and mild motor delay coordinates.',
      qualifications: ['BPT', 'MPT - Pediatrics'],
      clinicName: 'Happy Kids Motor Clinic',
      clinicAddress: 'Netaji Subhash Place, Pitampura, New Delhi, Delhi 110034',
      city: 'Delhi',
      languages: ['English', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [77.1512, 28.6948] },
      registrationNumber: 'MCI-PT-49201',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 12,
      aiSummary: 'Dr. Preeti Bansal is a dedicated pediatric physical therapist with 8 years of clinical experience in North Delhi. She designs child-friendly motor milestone progress guides.',
    }
  },

  // ─── HYDERABAD (6 Doctors) ──────────────────────────────────────────────────
  {
    user: {
      name: 'Srinivas Murthy',
      email: 'srinivas.murthy@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Sports Injury Rehab', 'Dry Needling'],
      experience: 10,
      consultationFee: 950,
      bio: 'Dr. Srinivas Murthy is a premier sports physiotherapist in Hyderabad. He handles athletic groin strains, hamstring tears, knee patellofemoral pain, and dry needling trigger point releases.',
      qualifications: ['BPT', 'MPT - Sports Medicine', 'Dry Needling Practitioner'],
      clinicName: 'Murthy Sports Fitness Rehab',
      clinicAddress: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
      city: 'Hyderabad',
      languages: ['English', 'Telugu', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [78.4067, 17.4320] },
      registrationNumber: 'MCI-PT-90184',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 31,
      aiSummary: 'Dr. Srinivas Murthy has 10 years of experience in high-performance sports injury rehabilitation and dry needling in Jubilee Hills, Hyderabad.',
    }
  },
  {
    user: {
      name: 'Deepthi Rao',
      email: 'deepthi.rao@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Neurological Rehabilitation', 'Vestibular Rehabilitation'],
      experience: 11,
      consultationFee: 1000,
      bio: 'Dr. Deepthi Rao specializes in neurological balance recovery, stroke paralysis retraining, parkinsonian movement support, and benign positional vertigo vestibular correction.',
      qualifications: ['BPT', 'MPT - Neuro Sciences', 'NDT Spec'],
      clinicName: 'Rao Neuro Movement Lab',
      clinicAddress: 'Hitech City Road, Madhapur, Hyderabad, Telangana 500081',
      city: 'Hyderabad',
      languages: ['English', 'Telugu', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [78.3842, 17.4484] },
      registrationNumber: 'MCI-PT-39185',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.8,
      totalReviews: 22,
      aiSummary: 'Dr. Deepthi Rao is a specialized neurological and vestibular therapist with 11 years of experience in Hyderabads tech corridor.',
    }
  },
  {
    user: {
      name: 'Rajesh Yarlagadda',
      email: 'rajesh.yarlagadda@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Orthopedic Physiotherapy', 'Manual Therapy'],
      experience: 14,
      consultationFee: 900,
      bio: 'Dr. Rajesh Yarlagadda is a senior spinal decompression specialist. He treats lumbar disc pain, sciatica, frozen shoulder, and mechanical joint locks with hands-on manipulation techniques.',
      qualifications: ['BPT', 'MPT - Ortho', 'COMT'],
      clinicName: 'Spine & Joint Manual Rehab',
      clinicAddress: 'Gachibowli Stadium Road, Gachibowli, Hyderabad, Telangana 500032',
      city: 'Hyderabad',
      languages: ['English', 'Telugu'],
      clinicLocation: { type: 'Point', coordinates: [78.3489, 17.4402] },
      registrationNumber: 'MCI-PT-28913',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 25,
      aiSummary: 'Dr. Rajesh Yarlagadda has 14 years of orthopedic physical therapy experience. He specializes in spinal decompression and pain-reducing manual adjustments.',
    }
  },
  {
    user: {
      name: 'Venkata Reddy',
      email: 'venkata.reddy@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Geriatric Care', 'Orthopedic Physiotherapy'],
      experience: 17,
      consultationFee: 850,
      bio: 'Dr. Venkata Reddy is a dedicated geriatric physical therapist. He helps senior citizens manage osteoarthritis knee pain, age-related gait changes, and implements post-fall safety conditioning programs.',
      qualifications: ['BPT', 'MPT - Geriatrics', 'MIAP'],
      clinicName: 'Seniors Active Mobility Lab',
      clinicAddress: 'Himayatnagar Main Road, Himayatnagar, Hyderabad, Telangana 500029',
      city: 'Hyderabad',
      languages: ['English', 'Telugu', 'Hindi'],
      clinicLocation: { type: 'Point', coordinates: [78.4842, 17.4021] },
      registrationNumber: 'MCI-PT-11030',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.9,
      totalReviews: 29,
      aiSummary: 'Dr. Venkata Reddy is a geriatric care specialist with 17 years of experience in Hyderabad. He focus on maintaining senior motor stamina and bone strength.',
    }
  },
  {
    user: {
      name: 'Harika Chennupati',
      email: 'harika.chennupati@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Cardiopulmonary Rehab'],
      experience: 9,
      consultationFee: 800,
      bio: 'Dr. Harika Chennupati is an expert in pulmonary chest clearance and cardiac conditioning. She provides deep breathing reconditioning, progressive cardiopulmonary exercises, and posture releases.',
      qualifications: ['BPT', 'MPT - Cardiopulmonary Science'],
      clinicName: 'Pulse Cardiopulmonary Health',
      clinicAddress: 'Begumpet Main Road, Begumpet, Hyderabad, Telangana 500016',
      city: 'Hyderabad',
      languages: ['English', 'Telugu'],
      clinicLocation: { type: 'Point', coordinates: [78.4589, 17.4412] },
      registrationNumber: 'MCI-PT-38102',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.6,
      totalReviews: 14,
      aiSummary: 'Dr. Harika Chennupati is a cardiopulmonary specialist with 9 years of experience in Hyderabad. She designs progressive chest re-expansion programs.',
    }
  },
  {
    user: {
      name: 'Kiran Goud',
      email: 'kiran.goud@demo.com',
      password: 'Demo@1234',
      role: ROLES.DOCTOR,
    },
    profile: {
      specialization: ['Pediatric Physiotherapy', 'Neurological Rehabilitation'],
      experience: 7,
      consultationFee: 750,
      bio: 'Dr. Kiran Goud focuses on sensory-motor developmental correction in infants and children. He supports cerebral palsy children, handles milestone delays, and runs kid posture games.',
      qualifications: ['BPT', 'MPT - Pediatrics'],
      clinicName: 'Happy Child Pediatric Care',
      clinicAddress: 'KPHB Colony Road, Kukatpally, Hyderabad, Telangana 500072',
      city: 'Hyderabad',
      languages: ['English', 'Telugu'],
      clinicLocation: { type: 'Point', coordinates: [78.3912, 17.4948] },
      registrationNumber: 'MCI-PT-49102',
      degreeDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/degree_sample.pdf',
      licenseDocument: 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/license_sample.pdf',
      verificationStatus: DOCTOR_STATUS.VERIFIED,
      averageRating: 4.7,
      totalReviews: 11,
      aiSummary: 'Dr. Kiran Goud specializes in pediatric movement physical therapy and childhood neuro developmental delay in Hyderabad Kukatpally.',
    }
  }
];

export const seedDoctors = async () => {
  try {
    const existingCount = await DoctorProfile.countDocuments();
    // If we have less than 36 doctors, we assume we need to upgrade database to our premium 36-doctor set (with 10 Pune doctors).
    if (existingCount >= 36) {
      logger.info('[Seed] High-fidelity multi-city doctors are already seeded — skipping.');
      return;
    }

    logger.info('[Seed] Cleaning up old doctor user accounts and profiles to prevent conflicts...');
    
    // Find all doctors registered with emails in our list or who have doctor role
    const oldDoctors = await User.find({ role: ROLES.DOCTOR });
    const oldDoctorIds = oldDoctors.map(d => d._id);
    
    await DoctorProfile.deleteMany({ user: { $in: oldDoctorIds } });
    await User.deleteMany({ role: ROLES.DOCTOR });

    logger.info(`[Seed] Starting seed of ${doctorSeeds.length} high-fidelity doctor profiles...`);

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
        logger.info(`[Seed] Created profile for: Dr. ${seed.user.name} in ${seed.profile.city}`);
      }
    }

    logger.info(`[Seed] Successfully seeded ${doctorSeeds.length} doctor profiles across multiple cities.`);

    // ─── Idempotent safety net ─────────────────────────────────────────────────
    // Ensure ALL seeded doctors are verified and available (covers re-runs / stale docs)
    const fixResult = await DoctorProfile.updateMany(
      { verificationStatus: { $ne: DOCTOR_STATUS.VERIFIED } },
      { $set: { verificationStatus: DOCTOR_STATUS.VERIFIED, isAvailable: true } }
    );
    if (fixResult.modifiedCount > 0) {
      logger.info(`[Seed] Fixed ${fixResult.modifiedCount} doctor profiles to verified status.`);
    }
  } catch (err) {
    logger.error('[Seed] Failed to seed doctor profiles:', err.message);
  }
};

export default seedDoctors;
