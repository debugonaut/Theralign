import React from 'react';

const FEATURES = [
  {
    number: '01',
    title: 'AI-POWERED SYMPTOM TRIAGE',
    description:
      'Describe your pain in plain language and our clinical AI maps your symptoms to the right physiotherapy specialisation. No medical knowledge required — just tell us what hurts and we guide you to verified experts who specialise in exactly your condition.',
    imageId: '1571019613454-1cb2f99b2d8b',
    textLeft: true,
  },
  {
    number: '02',
    title: 'REAL-TIME AVAILABILITY & SLOT LOCKING',
    description:
      'View live availability across hundreds of verified practitioners. Our atomic slot-locking system prevents double bookings at the database level — the slot you select is yours the moment you select it. No confirmation delays. No scheduling conflicts.',
    imageId: '1559757148-5c350d0d3c56',
    textLeft: false,
  },
  {
    number: '03',
    title: 'STRUCTURED SESSION RECORDS',
    description:
      'Every completed session generates a permanent clinical record — exercise prescriptions, medication notes, clinical observations, and follow-up timelines. Patients access their full care history. Doctors maintain continuity across every visit. The paper file, digitised and shared.',
    imageId: '1576091160399-112ba8d25d1d',
    textLeft: true,
  },
  {
    number: '04',
    title: 'VISUAL EXERCISE PRESCRIPTION LIBRARY',
    description:
      'Doctors prescribe from a curated library of categorised physiotherapy exercises — each with illustrated stickman positions, set and rep controls, and YouTube demonstration videos. Patients receive a visual prescription card, not a text list. Recovery rates improve when patients understand exactly what to do.',
    imageId: '1571019614242-c5c5dee9f50b',
    textLeft: false,
  },
];

const FeaturesZigzagSection = () => {
  return (
    <section className="features-section" id="features" aria-labelledby="features-title">
      {/* Header Title with horizontal line behind */}
      <div className="relative w-full mb-16 flex flex-col items-center">
        {/* Horizontal Line behind */}
        <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
        
        {/* Text Overlay */}
        <div className="relative z-10 bg-white px-8 text-center">
          <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
            — PLATFORM CAPABILITIES
          </span>
          <h2 id="features-title" className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
            WHAT THERALIGN DOES DIFFERENTLY
          </h2>
        </div>
      </div>

      {/* Feature blocks */}
      {FEATURES.map((feature) => (
        <div
          key={feature.number}
          className={`feature-block ${feature.textLeft ? 'feature-block--text-left' : 'feature-block--image-left'}`}
        >
          {/* Text column */}
          <div className="feature-text-col">
            {/* Watermark number */}
            <span className="feature-number-watermark" aria-hidden="true">
              {feature.number}
            </span>

            {/* Swiss Red rule */}
            <div className="feature-red-rule" />

            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>

            <a href="#" className="feature-learn-more">
              LEARN MORE →
            </a>
          </div>

          {/* Image column */}
          <div className="feature-image-col">
            <img
              src={`https://images.unsplash.com/photo-${feature.imageId}?w=900&q=85&fit=crop`}
              alt={feature.title}
              className="feature-image"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </section>
  );
};

export default FeaturesZigzagSection;
