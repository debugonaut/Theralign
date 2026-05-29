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
    <section className="relative w-full bg-swiss-gray-100 py-24 border-y-2 border-swiss-black overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 swiss-grid-pattern pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 w-full relative z-10">
        <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-swiss-black pb-4 mb-16">
          <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-swiss-red font-swiss">
            02.
          </span>
          <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-swiss-black font-swiss">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] w-[33.33%] h-px bg-swiss-black z-0" />
          <div className="hidden md:block absolute top-12 left-[50%] w-[33.33%] h-px bg-swiss-black z-0" />

          {steps.map((step, index) => (
            <div key={index} className="bg-swiss-white border-2 border-swiss-black p-8 relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[48px] font-black tracking-[-0.04em] text-swiss-black font-swiss leading-none">
                  {step.number}
                </span>
                <h3 className="font-bold text-[16px] text-swiss-black uppercase tracking-widest leading-snug">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-[14px] text-swiss-gray-600 font-medium leading-[1.6]">
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
