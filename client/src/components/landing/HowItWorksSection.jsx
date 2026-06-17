import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      title: 'DESCRIBE SYMPTOMS',
      description: 'Use our AI symptom search or browse directory categories directly.',
    },
    {
      number: '2',
      title: 'BROWSE DOCTORS',
      description: 'Review top-rated, fully verified specialists matching your criteria.',
    },
    {
      number: '3',
      title: 'BOOK A SLOT',
      description: 'Choose a convenient time slot and begin active recovery.',
    },
  ];

  return (
    <section className="relative w-full bg-surface-container-low py-20 sm:py-24 border-y-2 border-obsidian overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 relative z-10">
        <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-obsidian pb-4 mb-16">
          <span className="font-bold text-ui-sm tracking-widest uppercase text-accent-coral font-swiss">
            06.
          </span>
          <h2 className="text-display-xs sm:text-display-md leading-[1.05] font-black uppercase tracking-tight text-obsidian font-swiss">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] w-[33.33%] h-px bg-obsidian z-0" />
          <div className="hidden md:block absolute top-12 left-[50%] w-[33.33%] h-px bg-obsidian z-0" />

          {steps.map((step, index) => (
            <div key={index} className="bg-white brutalist-border p-8 relative z-10 flex flex-col h-full hover:shadow-[6px_6px_0px_0px_#cfe5fe] transition-shadow duration-fast">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[48px] font-black tracking-tighter text-obsidian font-swiss leading-none">
                  {step.number}
                </span>
                <h3 className="font-bold text-ui-md text-obsidian uppercase tracking-wider leading-snug font-swiss">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-ui-sm text-on-surface-variant font-medium leading-[1.6] font-swiss">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
