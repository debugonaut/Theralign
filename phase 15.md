Read both files carefully before generating anything.Full context absorbed. Phase 14 is complete. I know exactly what the exercise prescription system currently looks like — free text entry, basic fields, no visual layer. Now I know exactly what you want to build on top of it. Here is the complete prompt.

---

# Theralign — Phase 15
## Visual Exercise Library & Prescription System

---

### Context

You are building Phase 15 of Theralign. Read `MASTER_CONTEXT.md` fully before touching any file. Phases 1–14 are complete and production-live. Phase 14 introduced the `SessionRecord` model with an `exercisePrescription` array where doctors currently type exercise names as free text. Phase 15 replaces that free-text entry entirely with a structured, visual exercise library — hardcoded, categorized, icon-driven, and linked to YouTube demonstrations.

This is a frontend-heavy phase. The backend changes are minimal and surgical. The majority of the work is building the exercise library data layer, the category and exercise browsing UI for doctors, and the exercise demonstration experience for patients.

**The core experience in one paragraph:** A doctor prescribing exercises no longer types anything. They open the exercise library, browse by body region or condition category, see a visual grid of illustrated exercise cards, click one, adjust sets and reps with a simple counter, and add it to the prescription. The patient who receives the prescription sees their exercises as illustrated cards. Clicking any card opens a YouTube video demonstrating the exercise exactly. No typing. No searching YouTube manually. No forgotten exercise names.

---

### Absolute Constraints

All ADRs from `MASTER_CONTEXT.md` are binding. The most relevant to this phase:

**ADR-007:** `SessionRecord` is a separate collection linked to `Appointment`. The `exercisePrescription` array lives on `SessionRecord`. Do not move it, do not duplicate it, do not create a new collection for it.

**ADR-005:** Dates use `YYYY-MM-DD` string format in storage. Not relevant to exercises directly but applies to any timestamp fields added.

**ADR-003 (Development Rules):** No new npm dependencies without explicit justification. This phase uses zero new dependencies. All icons are SVG components built inline or existing Lucide icons. No exercise icon library is installed.

**Theralign Design DNA:** The visual exercise library must feel like it belongs to the same product as the rest of Theralign post-humanization. Surface color `#F8F8F6`, cards white `#FFFFFF` with `8px` border-radius, primary `#0B4F6C`, accent coral `#F4845F`, teal `#0A7E6E`. Inter typeface. No shadows heavier than `shadow-level-2`. The exercise grid is clinical precision made visually approachable — not a fitness app, not a game. A professional medical tool that happens to look good.

**Never break Phase 14:** The `SessionRecordForm.jsx` currently has a free-text exercise entry section. Phase 15 replaces that section entirely. The `exercisePrescription` array structure on `SessionRecord.model.js` must not change — only the UI for populating it changes. The backend receives exactly the same data shape it received before.

---

### Part 1 — Exercise Library Data Structure

**File to create:** `client/src/data/exerciseLibrary.js`

This is the single source of truth for every exercise in the platform. It is a hardcoded JavaScript module — not fetched from the backend, not stored in MongoDB. It is static data bundled with the frontend. This is a deliberate architectural decision: exercises do not change frequently, fetching them from a server adds latency to the prescription flow, and hardcoding them means the library works offline and never fails due to a network error.

The data structure has three levels: **Category → Subcategory → Exercise**.

**Top-level categories are body regions / treatment domains.** These map to how physiotherapists actually think about and categorize their work — not how a gym app thinks about muscle groups.

```javascript
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
```

**Important:** Every YouTube ID in this file must be a real, working physiotherapy demonstration video. Verify each one before shipping. The IDs above are representative placeholders — replace any that return 404 or show irrelevant content. Prefer videos from physiotherapy channels, hospital rehab departments, or licensed healthcare providers. Never use gym influencer or fitness entertainment channels for medical exercise demonstration.

---

### Part 2 — Backend Schema Update

**File to modify:** `server/src/models/SessionRecord.model.js`

The `exercisePrescriptionItemSchema` currently has `exerciseName` as a free-text field. Add one optional field: `exerciseLibraryId`. This is the bridge between the visual library and the stored prescription.

```javascript
// Add to exercisePrescriptionItemSchema — one new field only:
exerciseLibraryId: {
  type: String,
  default: null
  // The exercise.id from exerciseLibrary.js
  // null for manually typed exercises (backward compatibility)
  // Set when exercise is selected from the visual library
}
```

This change is purely additive. Existing session records with `exerciseLibraryId: null` continue to work. The patient-facing view uses `exerciseLibraryId` to look up the YouTube video — if null, no video link is shown (backward compatibility for Phase 14 records).

No other backend changes. No new endpoints. No new models. No migration needed — MongoDB is schemaless and existing documents are unaffected.

---

### Part 3 — Exercise Category Icons

**File to create:** `client/src/components/exercises/ExerciseCategoryIcons.jsx`

These are inline SVG stickman/body diagram icons — one per category. They are not downloaded from any library. They are purpose-drawn SVG paths that represent the body region treated by that category. The visual language: simple, clinical, minimal. Think the iconography style of a medical instruction leaflet — clear silhouettes that communicate the body area immediately.

Each icon is a React component that accepts `size` (default `48`) and `color` (default `currentColor`) props.

The icons to build:

**SpineIcon** — A side-profile spine silhouette. A vertical curved line (the spine) with small horizontal marks at vertebral intervals. Simple and immediately recognizable.

**KneeIcon** — A leg silhouette from mid-thigh to mid-shin, with the knee joint circle prominent at the center. The joint is slightly emphasized with a concentric ring.

**ShoulderIcon** — An upper torso silhouette showing the shoulder joint socket and the arm beginning to extend. The ball-and-socket joint is visible as a circle at the shoulder.

**HipIcon** — A pelvis silhouette, front view, showing the iliac crests and the hip joint sockets on each side as circles.

**AnkleIcon** — A foot and lower leg silhouette, side view, with the ankle mortise joint clearly visible where the tibia meets the talus.

**CoreIcon** — A torso silhouette, front view, with horizontal hatching lines across the abdominal region indicating the core muscle area.

**NeuroIcon** — A full body outline silhouette with radiating lines from the spine, representing nerve pathways. Simple enough to read at 48px.

**BreathingIcon** — A torso silhouette, front view, with the lung fields visible as two leaf shapes and a directional arrow indicating breath flow.

Build each as a named export. They are used in the category selection grid.

The style directive: these icons should look like they were drawn by a medical illustrator with a vector pen, not generated by an AI or downloaded from Flaticon. Clean lines, clinical precision, recognizable at 48px, beautiful at 96px.

---

### Part 4 — Exercise Library Modal (Doctor-Facing)

**File to create:** `client/src/components/exercises/ExerciseLibraryModal.jsx`

This is the primary new UI component of Phase 15. It replaces the free-text exercise input in `SessionRecordForm.jsx`. The doctor opens this modal, browses visually, selects exercises, adjusts parameters, and closes. The selected exercises populate the prescription list.

**Modal trigger:** A button in the exercise prescription section of `SessionRecordForm.jsx` reading `Browse Exercise Library →` in primary color with a `Library` Lucide icon. It replaces the current `Add Exercise` free-text approach.

**Modal dimensions:** Full-screen overlay on mobile. On desktop: a centered modal `880px` wide, `620px` tall, with internal scroll in the content area. This is larger than other modals in the product because it is a browsing interface, not a form.

**Modal layout — three-panel design:**

```
┌──────────────────────────────────────────────────────────────┐
│  Exercise Library                              [×]           │
│  Find and prescribe the right exercises for your patient     │
├────────────┬─────────────────────────────┬───────────────────┤
│            │                             │                   │
│  CATEGORY  │   EXERCISE GRID             │  PRESCRIPTION     │
│  PANEL     │   (browseable)              │  PANEL            │
│            │                             │                   │
│  [Spine]   │   [Card][Card][Card]        │  Exercise 1       │
│  [Knee]    │   [Card][Card][Card]        │  3 × 10 reps      │
│  [Shoulder]│   [Card][Card]              │                   │
│  [Hip]     │                             │  Exercise 2       │
│  [Ankle]   │                             │  2 × 30 sec       │
│  [Core]    │                             │                   │
│  [Neuro]   │                             │  [Done →]         │
│  [Breath]  │                             │                   │
└────────────┴─────────────────────────────┴───────────────────┘
```

**Panel 1 — Category Panel (left, `180px` wide, fixed)**

A vertical list of category items. Each item: the category icon component at `32px`, the category label in `ui-sm` Inter 600, and the item count in small gray. The active category has a `3px` left border in the category's color and a very light tint of that color as background (`opacity: 0.08`). Hover state: same tint, slightly stronger. The category color is used as an accent — the primary `#0B4F6C` does not override category-specific color here. This is one of the rare places in Theralign where non-primary accent colors are permitted, because the categories need to be visually distinct from each other.

A search input sits at the very top of the modal above the three panels, full-width, with a magnifier icon. Typing in it transitions the grid from category-browse mode to search-results mode — the category panel becomes dimmed but still interactive, and the grid shows all matching exercises across all categories with a small category label chip on each card.

**Panel 2 — Exercise Grid (center, fills remaining width minus Panel 3)**

When a category is selected: shows subcategory headers as small uppercase gray labels, then a grid of exercise cards below each subcategory. `3` cards per row on the modal's internal grid. Each card is `200px × 200px` approximately.

**Exercise Card Design:**

The exercise card is the visual centerpiece of this feature. It must be designed carefully.

Background: white `#FFFFFF`, `8px` border-radius, `2px` border `#DDE3EA`. On hover: border becomes `2px` primary `#0B4F6C`, background shifts to `#F0F7FA` (very light primary tint), shadow-level-2.

Top half of the card (`~110px`): the exercise illustration area. A light gray `#F8F8F6` background. Centered in it: the stickman figure SVG for this exercise's `position` value (lying, sitting, standing, prone, kneeling). The stickman SVGs are described in Part 5 below. The figure is `80px` tall, colored in the category's color at `70%` opacity — subtle, not garish.

Bottom half of the card (`~90px`): exercise information. The exercise name in `ui-sm` Inter 700 `#1A1A1A`, left-aligned. Below it: the target area in `ui-xs` Inter 400 `#6B7C93`, left-aligned, truncated to one line. Below that: a row of small pill-shaped metadata chips — the `difficulty` pill (beginner/intermediate/advanced in respective teal/amber/danger colors at low opacity) and the `equipment` pill if equipment is not `none`. Below that: the default prescription in `ui-xs` gray — `3 × 10 reps` or `2 × 30 sec`.

Bottom-right corner of the card: a `+` button in primary color inside a `24px × 24px` bordered circle. Clicking it adds the exercise with default parameters to the prescription panel (Panel 3) and animates the `+` to a `✓` for `800ms` before returning to `+`.

**Subcategory switching:** Clicking a subcategory label (shown above the cards for that subcategory within the grid) scrolls the grid to that subcategory's position. The subcategory labels are sticky at the top of the grid as the doctor scrolls.

**Panel 3 — Prescription Panel (right, `240px` wide, fixed)**

Shows the exercises the doctor has added so far. Each exercise in this panel: the exercise name in `ui-sm` bold, then an inline parameter editor:

```
Sets:  [−] [3] [+]
Reps:  [−] [10] [+]     or    Duration: [30 sec ▾]
```

The `[−]` and `[+]` are bordered square buttons (`28px × 28px`), the value in between is the number in bold. Pressing `−` decrements (minimum 1). Pressing `+` increments (maximum 20 for sets, 50 for reps). If the exercise has a `defaultDuration` rather than reps, show a duration dropdown instead of the rep counter — with common physiotherapy durations as options: `10 sec`, `15 sec`, `20 sec`, `30 sec`, `45 sec`, `1 min`, `2 min`, `5 min`, `10 min`.

Below the parameter editor: a `frequency` dropdown — `once daily`, `twice daily`, `three times daily`, `every other day`, `3× per week`, `as tolerated`. Default populated from the exercise's `defaultFrequency`.

A `×` remove button in the top-right corner of each prescription item. Clicking removes it from the panel with a height-collapse animation.

At the very bottom of Panel 3: the exercise count (`4 exercises`) in small gray, and the `Done — Add to Prescription →` primary button full-width. Clicking this closes the modal and populates the `exercisePrescription` array in the form state.

**State management:** The modal maintains its own internal state for the prescription being built. When the doctor opens the modal for editing an existing prescription (edit mode), the modal is pre-populated with existing exercises and their parameters. The `Done` button merges the modal state into the form state.

---

### Part 5 — Position Stickman SVGs

**File to create:** `client/src/components/exercises/PositionFigures.jsx`

Six position figure SVG components — one for each value of the `position` field in the exercise data. These are small human figure silhouettes (stickman style) showing the body in the relevant position for that exercise. They are used as the illustration in the exercise card top half.

Design language: clean medical illustration style. Proportional human figure, not cartoonish. No face features — just body shape. Limb positions clearly show the body position. Colors are passed as props and set by the category.

**LyingFigure** — A horizontal figure, supine (on back). Head on the left, feet on the right. Slight knee bend to indicate the most common lying exercise position.

**SittingFigure** — A figure seated upright on a surface. Feet flat on the ground, spine vertical, hands resting on thighs. The chair/surface is a simple horizontal rectangle beneath.

**StandingFigure** — An upright figure, feet slightly apart, arms at sides. The most recognizable position figure.

**ProneFigure** — A horizontal figure, prone (face down). Head on the left, feet on the right. Arms positioned under the torso or slightly forward.

**KneelingFigure** — A figure in a half-kneeling position — one knee on the ground, one foot flat. The standard kneeling exercise starting position.

Each component accepts `color` (default `#0B4F6C`) and `size` (default `80`) props. The SVG viewBox is `0 0 120 80` for lying/prone figures and `0 0 80 120` for standing/sitting/kneeling figures.

These are hand-built SVG paths — not imported from any library. They are the visual centerpiece of the exercise card and must look professional and clinically appropriate. Take care with the proportions. A poorly proportioned stickman undermines the professional credibility of the entire feature.

---

### Part 6 — SessionRecordForm Integration

**File to modify:** `client/src/pages/doctor/SessionRecordForm.jsx`

The current Section 2 of the form (Exercise Prescription) has a free-text `exerciseName` input. This section is replaced entirely.

**Remove:** The `Add Exercise` free-text input row and its associated state management.

**Add:** A prescription display area and the library trigger.

The new Section 2 layout:

```
Section 2 — Exercise Prescription               (3 exercises)
─────────────────────────────────────────────────────────────

[Browse Exercise Library →]    [Add manually +]

─────────────────────────────────────────────────────────────

Exercise 1 — Pelvic Tilt                           [×]
3 sets · 10 reps · twice daily
Target: Lower back stabilizers

Exercise 2 — Cat-Cow Stretch                       [×]
3 sets · 10 reps · once daily
Target: Lumbar spine mobility

Exercise 3 — Glute Bridge                          [×]
3 sets · 15 reps · once daily
Target: Gluteus maximus, lumbar stabilizers

─────────────────────────────────────────────────────────────
No exercises yet — click Browse Library to get started
(shown when empty)
```

**`Browse Exercise Library →` button:** Opens `ExerciseLibraryModal`. On modal close with `Done`, merges selected exercises into the form's `exercisePrescription` state. Existing exercises in the form are preserved — the modal adds to or replaces them.

**`Add manually +` link:** Opens the original free-text exercise entry row as an inline form below the button row. This preserves backward compatibility and allows doctors to prescribe non-library exercises (custom or rare exercises not in the library). The manual entry creates an exercise item with `exerciseLibraryId: null`.

**Prescribed exercise display card:** Each exercise in the prescription shows as a bordered row — `8px` border-radius, white background, `2px` border `#DDE3EA`. Inside: exercise name in bold, the prescription parameters inline (`3 sets · 10 reps · twice daily`), target area in small gray, and a `×` remove button on the far right. If `exerciseLibraryId` is not null: a small `▶ Video` link in primary color appears on the right, linking to the YouTube URL. This link opens in a new tab from the form context — it is for the doctor's own reference, not the patient-facing video experience.

**Form state shape for each exercise item:**

```javascript
{
  exerciseLibraryId: 'lumbar_pelvic_tilt',  // null if manually added
  exerciseName: 'Pelvic Tilt',
  sets: 3,
  reps: 10,
  duration: null,
  frequency: 'twice daily',
  notes: null
}
```

This shape matches the `exercisePrescriptionItemSchema` exactly including the new `exerciseLibraryId` field.

---

### Part 7 — Patient Exercise View

**File to modify:** `client/src/pages/patient/PatientCareTimeline.jsx`

In the expanded session record view (the inline expansion when a patient clicks `View Full Record →`), the exercise prescription section is redesigned.

**Current:** A plain table showing exercise name, sets, reps, frequency.

**New:** A visual exercise card grid matching the design language of the library but in a read-only patient-friendly format.

Each exercise in the patient's prescription view:

```
┌────────────────────────────────────────────────┐
│  [Position Figure]    Pelvic Tilt              │
│                       Lower back stabilizers   │
│                                                │
│                       3 sets · 10 reps         │
│                       Twice daily              │
│                                                │
│                       [▶ Watch Demonstration]  │
└────────────────────────────────────────────────┘
```

Card dimensions: full-width of the expanded row, `2` cards per row in a grid. Each card: white background, `8px` border-radius, `2px` border `#DDE3EA`. Left section (`100px`): the position figure SVG in the category's color. Right section: exercise name in `ui-md` Inter 700, target area in `ui-xs` gray, prescription parameters in `ui-sm` bold (`3 sets · 10 reps`), frequency in `ui-xs` gray.

At the bottom of the right section: the `▶ Watch Demonstration` button. This is the button that opens the YouTube video.

**Video behavior:** Clicking `▶ Watch Demonstration` opens a YouTube embed modal — not a new tab navigation. The modal is a simple overlay with the YouTube iframe embed at `16:9` aspect ratio, `800px` wide on desktop. The embed URL format: `https://www.youtube.com/embed/{youtubeId}?autoplay=1&rel=0&modestbranding=1`. The `autoplay=1` parameter starts the video immediately when the modal opens. The `rel=0` prevents related video recommendations from showing after the video ends. The `modestbranding=1` reduces YouTube branding.

The modal has a close button in the top-right corner. Closing it stops the video by setting the iframe `src` to empty string before unmounting — this is the standard pattern for stopping YouTube embeds without the autoplay continuing after modal close.

If `exerciseLibraryId` is null (manually prescribed exercise): the `▶ Watch Demonstration` button does not appear. Only exercises from the visual library have YouTube videos.

**For exercises with `exerciseLibraryId: null`** — use `getExerciseById(null)` returns null, so these cards show in a simplified text-only format without the position figure illustration. The card still looks clean — name, parameters, frequency — just without the visual elements.

---

### Part 8 — YouTube Embed Modal

**File to create:** `client/src/components/exercises/ExerciseVideoModal.jsx`

A focused modal for YouTube video playback. Used exclusively from the patient exercise view.

Props:
- `isOpen: boolean`
- `onClose: () => void`
- `exerciseId: string` — used to look up the exercise and its YouTube ID
- `exerciseName: string` — displayed in the modal header

**Modal layout:**

```
┌──────────────────────────────────────────────────────┐
│  ▶  Pelvic Tilt — Demonstration              [×]    │
│─────────────────────────────────────────────────────│
│                                                      │
│  [YouTube embed — 16:9 ratio, full modal width]      │
│                                                      │
│─────────────────────────────────────────────────────│
│  Prescribed by Dr. [name] · 3 sets · 10 reps         │
│  Twice daily                                         │
└──────────────────────────────────────────────────────┘
```

The footer below the video shows the prescription parameters — a reminder of what was prescribed, visible while watching the video. The patient does not need to close the video to check their sets and reps.

**Implementation notes:**

The YouTube `src` must be set via React state — initialized to empty string, set to the embed URL when `isOpen` becomes true, reset to empty string when `isOpen` becomes false. This prevents the video from continuing to play after the modal closes.

The iframe must have `allowFullScreen` set to true — patients watching exercise demonstrations benefit from full-screen viewing.

The modal overlay must not have a `backdropFilter: blur` — the design system does not use blur effects. A `rgba(0,0,0,0.7)` overlay is sufficient.

**Accessibility:** The iframe must have `title={exerciseName}` for screen readers. The close button must have `aria-label="Close video"`.

---

### Part 9 — Design Consistency Verification

The visual exercise library introduces new UI patterns. Verify each against the Theralign design DNA before shipping:

**Colors used:** Every color used in the exercise cards and modal must come from the Theralign token system or the category colors defined in the exercise library data. No new hex values are introduced.

**Border radius:** All cards, modal container, parameter buttons — `8px` for cards, `6px` for buttons, `4px` for chips. Modal container itself: `8px`. No values outside this range.

**Shadows:** Exercise cards at rest: `shadow-level-1`. Exercise cards on hover: `shadow-level-2`. Modal: `shadow-level-3`. These are the three defined shadow levels — no others.

**Typography:** Inter throughout. Exercise names in `ui-sm` Inter 700. Target area in `ui-xs` Inter 400 `#6B7C93`. Parameter values in `ui-sm` Inter 600. Category labels in `ui-xs` Inter 700 uppercase tracked. All consistent with existing type scale.

**Category colors:** Used only for the left border accent, the category icon tint, and the position figure fill. Never used for background fills above `opacity: 0.08`. The primary `#0B4F6C` handles buttons, active states, and interactive elements — category colors are purely categorical identifiers.

**Spacing:** All internal padding multiples of 8. Card internal padding `16px`. Grid gap `16px`. Modal panel internal padding `24px`. Consistent with existing spacing system.

---

### Part 10 — Verification Checklist

After full implementation, verify every item before marking Phase 15 complete.

**Data Layer:**
- [ ] `exerciseLibrary.js` exports `EXERCISE_CATEGORIES`, `getAllExercises`, `getExerciseById`, `searchExercises`, `getExercisesByCategory`
- [ ] Every exercise has a valid `youtubeId` — manually verify 5 random IDs return valid physiotherapy videos
- [ ] `exerciseLibraryId` field added to `exercisePrescriptionItemSchema` — existing session records unaffected
- [ ] `getExerciseById(null)` returns null without throwing

**Exercise Library Modal — Doctor:**
- [ ] Modal opens from `Browse Exercise Library →` button in SessionRecordForm
- [ ] Category panel shows all 8 categories with correct icons and colors
- [ ] Selecting a category populates the exercise grid with correct exercises
- [ ] Search input filters exercises across all categories in real time
- [ ] Each exercise card shows position figure, name, target area, difficulty, equipment, default prescription
- [ ] `+` button on card adds exercise to prescription panel and shows `✓` for 800ms
- [ ] Prescription panel shows added exercises with parameter controls
- [ ] `[−]` and `[+]` buttons adjust sets and reps correctly (min 1, max 20/50)
- [ ] Duration dropdown shows for exercises with `defaultDuration`
- [ ] Frequency dropdown populated from exercise default, editable
- [ ] `×` remove button removes exercise from prescription panel
- [ ] `Done` button closes modal and populates form with prescription
- [ ] Opening modal in edit mode pre-populates existing prescription
- [ ] `Add manually +` still works for non-library exercises
- [ ] Modal is `880px` wide centered on desktop

**Position Figures:**
- [ ] All 5 position figure components render without errors
- [ ] Figures are recognizable at `80px` height
- [ ] Color prop applies correctly
- [ ] Lying and prone figures are visually distinct from each other

**Patient Exercise View:**
- [ ] Expanded session record shows exercise cards in 2-column grid
- [ ] Cards with `exerciseLibraryId` show position figure illustration
- [ ] Cards with `exerciseLibraryId: null` show text-only format
- [ ] `▶ Watch Demonstration` appears only for library exercises
- [ ] Clicking `▶ Watch Demonstration` opens `ExerciseVideoModal`
- [ ] Video autoplays when modal opens
- [ ] Closing modal stops the video (iframe src reset to empty)
- [ ] Modal footer shows prescription parameters
- [ ] iframe has `title` and `allowFullScreen` attributes

**Design Consistency:**
- [ ] No new hex color values introduced outside the token system and category colors
- [ ] No border-radius values outside `4px`, `6px`, `8px`
- [ ] No shadows heavier than `shadow-level-3`
- [ ] Typography consistent with existing type scale
- [ ] Category colors never used as background fills above `opacity: 0.08`
- [ ] All grid gaps and internal padding are multiples of 8

---

Phase 15 is complete when all checklist items pass in production.

Once verified, say **"Phase 16"** and the exercise compliance tracking prompt will follow — where patients mark exercises as completed and doctors see adherence data in their session history.