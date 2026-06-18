import React from 'react';

// Inline SVG icons matching the Lucide icon spec (no external icon dependency needed)
const ShieldCheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ClipboardListIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="12" y1="11" x2="16" y2="11"/>
    <line x1="12" y1="16" x2="16" y2="16"/>
    <line x1="8" y1="11" x2="8.01" y2="11"/>
    <line x1="8" y1="16" x2="8.01" y2="16"/>
  </svg>
);

const StarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const BENEFITS = [
  {
    Icon: ShieldCheckIcon,
    title: 'VERIFIED PRACTITIONERS ONLY',
    description:
      'Every physiotherapist on the platform passes a multi-stage clinical verification. Patients never encounter unverified or unlicensed practitioners.',
    bg: 'benefit-box--white',
  },
  {
    Icon: ZapIcon,
    title: 'BOOK IN UNDER 5 MINUTES',
    description:
      'From symptom search to confirmed appointment, the entire booking flow is designed for speed. Real-time slots, instant confirmation, zero phone calls.',
    bg: 'benefit-box--gray',
  },
  {
    Icon: ClipboardListIcon,
    title: 'COMPLETE CARE RECORDS',
    description:
      'Session notes, exercise prescriptions, and clinical observations are permanently stored and accessible to both patient and doctor from any device.',
    bg: 'benefit-box--gray-grid',
  },
  {
    Icon: StarIcon,
    title: 'OUTCOME-DRIVEN MATCHING',
    description:
      'Our AI symptom triage and specialisation matching increases the probability of correct first-visit treatment. The right doctor from the first session.',
    bg: 'benefit-box--white',
  },
];

const BenefitsGridSection = () => {
  return (
    <section className="benefits-section" id="benefits" aria-labelledby="benefits-title">
      {/* Header Title with horizontal line behind */}
      <div className="relative w-full mb-16 flex flex-col items-center">
        {/* Horizontal Line behind */}
        <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
        
        {/* Text Overlay */}
        <div className="relative z-10 bg-white px-8 text-center">
          <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
            — WHY IT WORKS
          </span>
          <h2 id="benefits-title" className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
            THE THERALIGN ADVANTAGE
          </h2>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="benefits-grid">
        {BENEFITS.map((benefit, idx) => (
          <div key={idx} className={`benefit-box ${benefit.bg}`}>
            {/* Icon container */}
            <div className="benefit-icon-wrap">
              <benefit.Icon />
            </div>

            <h3 className="benefit-box-title">{benefit.title}</h3>
            <p className="benefit-box-desc">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsGridSection;
