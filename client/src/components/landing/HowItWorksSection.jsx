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
    <section className="relative w-full bg-neutral-100 py-24 border-y-2 border-neutral-900 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0  pointer-events-none" />

      <div className="w-full relative z-10">
        <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-neutral-900 pb-4 mb-16">
          <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-accent font-swiss">
            02.
          </span>
          <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-neutral-900 font-swiss">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] w-[33.33%] h-px bg-neutral-900 z-0" />
          <div className="hidden md:block absolute top-12 left-[50%] w-[33.33%] h-px bg-neutral-900 z-0" />

          {steps.map((step, index) => (
            <div key={index} className="bg-white border-2 border-neutral-900 p-8 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[48px] font-black tracking-[-0.04em] text-neutral-900 font-swiss leading-none">
                  {step.number}
                </span>
                <h3 className="font-bold text-[16px] text-neutral-900 uppercase tracking-widest leading-snug">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-[14px] text-neutral-700 font-medium leading-[1.6]">
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
