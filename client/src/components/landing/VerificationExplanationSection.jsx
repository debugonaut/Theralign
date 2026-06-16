import React from 'react';
import { ShieldCheck, FileText, Building } from 'lucide-react';

const VerificationExplanationSection = () => {
  const steps = [
    {
      icon: ShieldCheck,
      title: 'MEDICAL LICENSE',
      description: 'Validation against state medical council registries.',
    },
    {
      icon: FileText,
      title: 'SPECIALIZATION PROOF',
      description: 'Review of advanced degrees and fellowship certificates.',
    },
    {
      icon: Building,
      title: 'CLINIC REGISTRATION',
      description: 'Physical inspection and facility standards verification.',
    },
  ];

  return (
    <section className="py-24 w-full bg-neutral-900 text-white">
      <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-white pb-4 mb-16 mx-0">
        <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-accent font-swiss">
          06.
        </span>
        <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-white font-swiss">
          CLINICAL VERIFICATION
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 px-0">
        
        {/* Left Column (5/12) - Verification Steps */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] uppercase tracking-widest text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-neutral-500 font-medium leading-[1.6]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (7/12) - Copy */}
        <div className="lg:col-span-7 flex flex-col justify-center border-t-2 border-neutral-700 lg:border-t-0 lg:border-l-2 lg:pl-16 pt-8 lg:pt-0">
          <p className="text-[24px] sm:text-[32px] font-medium leading-[1.4] text-neutral-100 tracking-tight">
            Every specialist on Theralign must pass a rigorous three-step clinical verification process before they can accept bookings. We do not compromise on medical credentials.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-accent w-12"></div>
            <span className="text-[11px] font-bold text-accent uppercase tracking-[0.08em]">
              INFRASTRUCTURE STANDARD
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VerificationExplanationSection;
