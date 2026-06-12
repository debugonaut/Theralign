// client/src/data/exerciseLibrary.js

export const EXERCISE_CATEGORIES = [
  {
    id: 'spine',
    label: 'Spine & Back',
    icon: 'spine',           // maps to SpineIcon SVG component
    color: '#0B4F6C',        // primary — structural, foundational
    subcategories: [
      {
        id: 'lumbar',
        label: 'Lumbar (Lower Back)',
        exercises: [
          {
            id: 'lumbar_pelvic_tilt',
            name: 'Pelvic Tilt',
            targetArea: 'Lower back stabilizers',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',    // lying | sitting | standing | prone
            youtubeId: 'P1xMHnGTZNM',   // YouTube video ID only — not full URL
            youtubeTitle: 'Pelvic Tilt Exercise — Physiotherapy',
            tags: ['lower back pain', 'lumbar stability', 'core']
          },
          {
            id: 'lumbar_cat_cow',
            name: 'Cat-Cow Stretch',
            targetArea: 'Lumbar spine mobility',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'prone',
            youtubeId: 'kqnua4rHVVA',
            youtubeTitle: 'Cat Cow Stretch — Physiotherapy',
            tags: ['lumbar mobility', 'spine flexibility', 'morning routine']
          },
          {
            id: 'lumbar_bridge',
            name: 'Glute Bridge',
            targetArea: 'Gluteus maximus, lumbar stabilizers',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'OUgsJ8-Vi0E',
            youtubeTitle: 'Glute Bridge Exercise — Physiotherapy',
            tags: ['glutes', 'lower back', 'hip stability']
          },
          {
            id: 'lumbar_bird_dog',
            name: 'Bird Dog',
            targetArea: 'Core, lumbar extensors',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'intermediate',
            equipment: 'none',
            position: 'prone',
            youtubeId: 'wiFNA3sqjCA',
            youtubeTitle: 'Bird Dog Exercise — Physiotherapy',
            tags: ['core stability', 'lower back', 'balance']
          },
          {
            id: 'lumbar_knee_to_chest',
            name: 'Knee-to-Chest Stretch',
            targetArea: 'Lumbar flexors, hip extensors',
            defaultSets: 2,
            defaultReps: null,
            defaultDuration: '30 seconds each side',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'EPM5t_6FQYY',
            youtubeTitle: 'Knee to Chest Stretch — Physiotherapy',
            tags: ['lower back stretch', 'hip flexors', 'pain relief']
          }
        ]
      },
      {
        id: 'cervical',
        label: 'Cervical (Neck)',
        exercises: [
          {
            id: 'cervical_chin_tuck',
            name: 'Chin Tuck',
            targetArea: 'Deep cervical flexors',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'three times daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'sitting',
            youtubeId: 'wQylqaCl8Zo',
            youtubeTitle: 'Chin Tuck Exercise — Physiotherapy',
            tags: ['neck pain', 'posture', 'cervical']
          },
          {
            id: 'cervical_rotation',
            name: 'Cervical Rotation',
            targetArea: 'Cervical rotators',
            defaultSets: 2,
            defaultReps: null,
            defaultDuration: '10 seconds each side',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'sitting',
            youtubeId: 'V0bCn-_xEzk',
            youtubeTitle: 'Neck Rotation Stretch — Physiotherapy',
            tags: ['neck mobility', 'cervical range of motion']
          },
          {
            id: 'cervical_side_bend',
            name: 'Cervical Side Bend',
            targetArea: 'Cervical lateral flexors, upper trapezius',
            defaultSets: 2,
            defaultReps: null,
            defaultDuration: '15 seconds each side',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'sitting',
            youtubeId: 'vr2KhElbpGQ',
            youtubeTitle: 'Neck Side Bend Stretch — Physiotherapy',
            tags: ['neck stretch', 'upper trapezius', 'posture']
          }
        ]
      },
      {
        id: 'thoracic',
        label: 'Thoracic (Mid Back)',
        exercises: [
          {
            id: 'thoracic_extension',
            name: 'Thoracic Extension over Chair',
            targetArea: 'Thoracic extensors, rhomboids',
            defaultSets: 2,
            defaultReps: null,
            defaultDuration: '30 seconds',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'chair',
            position: 'sitting',
            youtubeId: 'A4_yjfqmf2k',
            youtubeTitle: 'Thoracic Extension Stretch — Physiotherapy',
            tags: ['mid back', 'posture', 'thoracic mobility']
          },
          {
            id: 'thoracic_rotation',
            name: 'Thoracic Rotation',
            targetArea: 'Thoracic rotators',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'sitting',
            youtubeId: 'r1CmqM9FBKM',
            youtubeTitle: 'Thoracic Rotation Exercise — Physiotherapy',
            tags: ['thoracic mobility', 'rotation', 'back pain']
          }
        ]
      }
    ]
  },

  {
    id: 'knee',
    label: 'Knee & Leg',
    icon: 'knee',
    color: '#0A7E6E',       // teal — recovery, healing
    subcategories: [
      {
        id: 'knee_strengthening',
        label: 'Knee Strengthening',
        exercises: [
          {
            id: 'knee_quad_set',
            name: 'Quad Set',
            targetArea: 'Quadriceps',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '10 seconds hold',
            defaultFrequency: 'three times daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'KyaqMRmQJpM',
            youtubeTitle: 'Quad Set Exercise — Physiotherapy',
            tags: ['quadriceps', 'knee strengthening', 'post-surgical']
          },
          {
            id: 'knee_straight_leg_raise',
            name: 'Straight Leg Raise',
            targetArea: 'Quadriceps, hip flexors',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'AKMJnJDfBVY',
            youtubeTitle: 'Straight Leg Raise — Physiotherapy',
            tags: ['quadriceps', 'knee', 'hip flexors']
          },
          {
            id: 'knee_terminal_extension',
            name: 'Terminal Knee Extension',
            targetArea: 'Quadriceps (terminal range)',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'resistance band',
            position: 'standing',
            youtubeId: 'XGTMvqKjdZ4',
            youtubeTitle: 'Terminal Knee Extension — Physiotherapy',
            tags: ['quadriceps', 'ACL rehab', 'knee extension']
          },
          {
            id: 'knee_mini_squat',
            name: 'Mini Squat',
            targetArea: 'Quadriceps, gluteus, hamstrings',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'intermediate',
            equipment: 'none',
            position: 'standing',
            youtubeId: 'HWkXz3CU_3Q',
            youtubeTitle: 'Mini Squat Exercise — Physiotherapy',
            tags: ['quadriceps', 'knee', 'functional strength']
          }
        ]
      },
      {
        id: 'knee_mobility',
        label: 'Knee Mobility & Flexibility',
        exercises: [
          {
            id: 'knee_heel_slide',
            name: 'Heel Slide',
            targetArea: 'Knee flexion range of motion',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'three times daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'E3OV7VXJNLI',
            youtubeTitle: 'Heel Slide Exercise — Physiotherapy',
            tags: ['knee flexion', 'range of motion', 'post-surgical']
          },
          {
            id: 'knee_prone_hang',
            name: 'Prone Knee Extension Hang',
            targetArea: 'Knee extension range of motion',
            defaultSets: 1,
            defaultReps: null,
            defaultDuration: '10 minutes',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'prone',
            youtubeId: 'vOVmf3eTT3E',
            youtubeTitle: 'Prone Knee Extension Hang — Physiotherapy',
            tags: ['knee extension', 'range of motion', 'ACL']
          }
        ]
      }
    ]
  },

  {
    id: 'shoulder',
    label: 'Shoulder & Arm',
    icon: 'shoulder',
    color: '#B45309',       // amber — caution area, complex joint
    subcategories: [
      {
        id: 'rotator_cuff',
        label: 'Rotator Cuff',
        exercises: [
          {
            id: 'shoulder_external_rotation',
            name: 'External Rotation with Band',
            targetArea: 'Infraspinatus, teres minor',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'resistance band',
            position: 'standing',
            youtubeId: 'FE2EkNyqSMo',
            youtubeTitle: 'Shoulder External Rotation — Physiotherapy',
            tags: ['rotator cuff', 'shoulder stability', 'external rotation']
          },
          {
            id: 'shoulder_pendulum',
            name: 'Pendulum Exercise',
            targetArea: 'Glenohumeral joint decompression',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '1 minute each direction',
            defaultFrequency: 'three times daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'standing',
            youtubeId: 'qMTKBMVKJcA',
            youtubeTitle: 'Pendulum Exercise — Physiotherapy',
            tags: ['frozen shoulder', 'decompression', 'acute phase']
          },
          {
            id: 'shoulder_scaption',
            name: 'Scaption',
            targetArea: 'Supraspinatus, serratus anterior',
            defaultSets: 3,
            defaultReps: 12,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'intermediate',
            equipment: 'light dumbbells',
            position: 'standing',
            youtubeId: 'lbtzNwFfPGY',
            youtubeTitle: 'Scaption Exercise — Physiotherapy',
            tags: ['rotator cuff', 'shoulder elevation', 'strengthening']
          }
        ]
      },
      {
        id: 'shoulder_mobility',
        label: 'Shoulder Mobility',
        exercises: [
          {
            id: 'shoulder_wall_slide',
            name: 'Wall Slide',
            targetArea: 'Serratus anterior, shoulder flexion',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'wall',
            position: 'standing',
            youtubeId: '5Jdj8BakxLs',
            youtubeTitle: 'Wall Slide Exercise — Physiotherapy',
            tags: ['shoulder mobility', 'scapular control', 'posture']
          },
          {
            id: 'shoulder_doorway_stretch',
            name: 'Doorway Pectoral Stretch',
            targetArea: 'Pectoralis major, anterior shoulder',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '30 seconds',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'doorway',
            position: 'standing',
            youtubeId: 'FpfKZAlQMCo',
            youtubeTitle: 'Doorway Pec Stretch — Physiotherapy',
            tags: ['chest stretch', 'anterior shoulder', 'posture']
          }
        ]
      }
    ]
  },

  {
    id: 'hip',
    label: 'Hip & Pelvis',
    icon: 'hip',
    color: '#0B4F6C',
    subcategories: [
      {
        id: 'hip_strengthening',
        label: 'Hip Strengthening',
        exercises: [
          {
            id: 'hip_clamshell',
            name: 'Clamshell',
            targetArea: 'Gluteus medius, hip external rotators',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'resistance band optional',
            position: 'lying',
            youtubeId: 'E3OV7VXJNLI',
            youtubeTitle: 'Clamshell Exercise — Physiotherapy',
            tags: ['glute med', 'hip stability', 'IT band']
          },
          {
            id: 'hip_abduction',
            name: 'Standing Hip Abduction',
            targetArea: 'Gluteus medius',
            defaultSets: 3,
            defaultReps: 15,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'resistance band optional',
            position: 'standing',
            youtubeId: 'XX8zMSiMHTY',
            youtubeTitle: 'Standing Hip Abduction — Physiotherapy',
            tags: ['glute med', 'hip strengthening', 'balance']
          }
        ]
      },
      {
        id: 'hip_flexibility',
        label: 'Hip Flexibility',
        exercises: [
          {
            id: 'hip_flexor_stretch',
            name: 'Hip Flexor Stretch (Kneeling)',
            targetArea: 'Iliopsoas, rectus femoris',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '30 seconds each side',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'kneeling',
            youtubeId: 'YqF3PrMhCYY',
            youtubeTitle: 'Hip Flexor Stretch — Physiotherapy',
            tags: ['hip flexors', 'lower back', 'posture']
          },
          {
            id: 'hip_pigeon',
            name: 'Figure-4 Stretch',
            targetArea: 'Piriformis, hip external rotators',
            defaultSets: 2,
            defaultReps: null,
            defaultDuration: '45 seconds each side',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'PdvlMVBGHbQ',
            youtubeTitle: 'Figure 4 Piriformis Stretch — Physiotherapy',
            tags: ['piriformis', 'hip tightness', 'sciatica']
          }
        ]
      }
    ]
  },

  {
    id: 'ankle_foot',
    label: 'Ankle & Foot',
    icon: 'ankle',
    color: '#0A7E6E',
    subcategories: [
      {
        id: 'ankle_strengthening',
        label: 'Ankle Strengthening',
        exercises: [
          {
            id: 'ankle_alphabet',
            name: 'Ankle Alphabet',
            targetArea: 'Ankle stabilizers, peroneal muscles',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '1 full alphabet each foot',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'sitting',
            youtubeId: 'OlCMrHPIzUQ',
            youtubeTitle: 'Ankle Alphabet Exercise — Physiotherapy',
            tags: ['ankle stability', 'proprioception', 'sprain rehab']
          },
          {
            id: 'ankle_calf_raise',
            name: 'Calf Raise',
            targetArea: 'Gastrocnemius, soleus',
            defaultSets: 3,
            defaultReps: 20,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'standing',
            youtubeId: 'gwLzBJYoWlI',
            youtubeTitle: 'Calf Raise Exercise — Physiotherapy',
            tags: ['calf strengthening', 'ankle', 'Achilles']
          }
        ]
      }
    ]
  },

  {
    id: 'posture_core',
    label: 'Posture & Core',
    icon: 'core',
    color: '#F4845F',       // coral — active, energetic category
    subcategories: [
      {
        id: 'core_stability',
        label: 'Core Stability',
        exercises: [
          {
            id: 'core_dead_bug',
            name: 'Dead Bug',
            targetArea: 'Deep core stabilizers, transverse abdominis',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'once daily',
            difficulty: 'intermediate',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'g_7_BGDG_hE',
            youtubeTitle: 'Dead Bug Exercise — Physiotherapy',
            tags: ['core', 'stability', 'lower back']
          },
          {
            id: 'core_plank',
            name: 'Forearm Plank',
            targetArea: 'Core, transverse abdominis, shoulders',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '20 seconds',
            defaultFrequency: 'once daily',
            difficulty: 'intermediate',
            equipment: 'none',
            position: 'prone',
            youtubeId: 'B296mZDhrP4',
            youtubeTitle: 'Forearm Plank — Physiotherapy',
            tags: ['core strength', 'stability', 'endurance']
          }
        ]
      },
      {
        id: 'posture_correction',
        label: 'Posture Correction',
        exercises: [
          {
            id: 'posture_wall_angel',
            name: 'Wall Angel',
            targetArea: 'Thoracic extensors, scapular retractors',
            defaultSets: 3,
            defaultReps: 10,
            defaultDuration: null,
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'wall',
            position: 'standing',
            youtubeId: 'OzBO7_2FmFI',
            youtubeTitle: 'Wall Angel Exercise — Physiotherapy',
            tags: ['posture', 'upper back', 'shoulder blades']
          }
        ]
      }
    ]
  },

  {
    id: 'neurological',
    label: 'Neurological',
    icon: 'neuro',
    color: '#6B5CE7',       // purple — distinct from other categories
    subcategories: [
      {
        id: 'balance_coordination',
        label: 'Balance & Coordination',
        exercises: [
          {
            id: 'neuro_single_leg_stand',
            name: 'Single Leg Stand',
            targetArea: 'Proprioception, ankle stabilizers, core',
            defaultSets: 3,
            defaultReps: null,
            defaultDuration: '30 seconds each leg',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'standing',
            youtubeId: 'KN8HiJs4dXo',
            youtubeTitle: 'Single Leg Balance — Physiotherapy',
            tags: ['balance', 'proprioception', 'ankle stability']
          },
          {
            id: 'neuro_tandem_walk',
            name: 'Tandem Walk (Heel-to-Toe)',
            targetArea: 'Balance, gait control',
            defaultSets: 1,
            defaultReps: null,
            defaultDuration: '10 metres',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'standing',
            youtubeId: 'J3tM7xDiQlY',
            youtubeTitle: 'Tandem Walk Balance Exercise — Physiotherapy',
            tags: ['gait', 'balance', 'neurological rehab']
          }
        ]
      }
    ]
  },

  {
    id: 'breathing_relaxation',
    label: 'Breathing & Relaxation',
    icon: 'breathing',
    color: '#0A7E6E',
    subcategories: [
      {
        id: 'diaphragmatic',
        label: 'Diaphragmatic Breathing',
        exercises: [
          {
            id: 'breathing_diaphragmatic',
            name: 'Diaphragmatic Breathing',
            targetArea: 'Diaphragm, respiratory muscles, parasympathetic activation',
            defaultSets: 1,
            defaultReps: null,
            defaultDuration: '5 minutes',
            defaultFrequency: 'twice daily',
            difficulty: 'beginner',
            equipment: 'none',
            position: 'lying',
            youtubeId: 'gR9K_jHJvog',
            youtubeTitle: 'Diaphragmatic Breathing — Physiotherapy',
            tags: ['breathing', 'relaxation', 'pain management', 'anxiety']
          }
        ]
      }
    ]
  }
];

// ── Helper functions ──────────────────────────────────────────

// Flatten all exercises across all categories for search
export const getAllExercises = () =>
  EXERCISE_CATEGORIES.flatMap(cat =>
    cat.subcategories.flatMap(sub =>
      sub.exercises.map(ex => ({
        ...ex,
        categoryId: cat.id,
        categoryLabel: cat.label,
        categoryColor: cat.color,
        subcategoryId: sub.id,
        subcategoryLabel: sub.label
      }))
    )
  );

// Get exercises for a specific category
export const getExercisesByCategory = (categoryId) => {
  const cat = EXERCISE_CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.subcategories.flatMap(sub => sub.exercises) : [];
};

// Find a single exercise by id — used when patient views prescription
export const getExerciseById = (exerciseId) =>
  getAllExercises().find(ex => ex.id === exerciseId) || null;

// Search exercises by name or tags
export const searchExercises = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return getAllExercises();
  return getAllExercises().filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.tags.some(t => t.includes(q)) ||
    ex.targetArea.toLowerCase().includes(q)
  );
};
