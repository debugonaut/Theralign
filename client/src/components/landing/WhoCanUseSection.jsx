import React from 'react';

const PATIENT_TYPES = [
  {
    imageId: '1571019613454-1cb2f99b2d8b',
    label: 'POST-SURGICAL PATIENT',
    condition: 'KNEE REPLACEMENT RECOVERY',
  },
  {
    imageId: '1576091160399-112ba8d25d1d',
    label: 'SPORTS ATHLETE',
    condition: 'ACL & LIGAMENT INJURIES',
  },
  {
    imageId: '1559757148-5c350d0d3c56',
    label: 'OFFICE PROFESSIONAL',
    condition: 'CHRONIC BACK & NECK PAIN',
  },
  {
    imageId: '1506126613408-eca07ce68773',
    label: 'SENIOR PATIENT',
    condition: 'ARTHRITIS & MOBILITY',
  },
  {
    imageId: '1571019614242-c5c5dee9f50b',
    label: 'PEDIATRIC PATIENT',
    condition: 'DEVELOPMENTAL DISORDERS',
  },
  {
    imageId: '1571019613454-1cb2f99b2d8b',
    label: 'NEUROLOGICAL PATIENT',
    condition: 'STROKE REHABILITATION',
  },
  {
    imageId: '1576091160399-112ba8d25d1d',
    label: 'MATERNAL HEALTH',
    condition: 'PRENATAL & POSTNATAL CARE',
  },
  {
    imageId: '1559757148-5c350d0d3c56',
    label: 'TRAUMA PATIENT',
    condition: 'ACCIDENT & INJURY RECOVERY',
  },
];

const WhoCanUseSection = () => {
  return (
    <section className="who-section" id="patients" aria-labelledby="who-title">
      {/* Header Title with horizontal line behind */}
      <div className="relative w-full mb-16 flex flex-col items-center">
        {/* Horizontal Line behind */}
        <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
        
        {/* Text Overlay */}
        <div className="relative z-10 bg-white px-8 text-center">
          <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
            — OUR PATIENTS
          </span>
          <h2 id="who-title" className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
            BUILT FOR EVERY BODY. EVERY CONDITION.
          </h2>
        </div>
      </div>

      {/* 4×2 grid */}
      <div className="who-grid">
        {PATIENT_TYPES.map((patient, idx) => (
          <div key={idx} className="who-item">
            {/* Image container with double ring */}
            <div className="who-image-outer">
              {/* Solid black inner ring */}
              <div className="who-ring-solid" aria-hidden="true" />
              {/* Rotating dashed red outer ring */}
              <div className="who-ring-dashed" aria-hidden="true" />
              {/* Image */}
              <div className="who-image-wrap">
                <img
                  src={`https://images.unsplash.com/photo-${patient.imageId}?w=400&q=85&fit=crop&crop=faces`}
                  alt={patient.label}
                  className="who-image"
                  loading="lazy"
                />
              </div>
            </div>

            <p className="who-label">{patient.label}</p>
            <p className="who-condition">{patient.condition}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhoCanUseSection;
