import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: '🔍',
      title: 'Describe Symptoms',
      description: 'Use our AI symptom search or browse directory categories directly.',
    },
    {
      number: '02',
      icon: '👨‍⚕️',
      title: 'Browse Doctors',
      description: 'Review top-rated, fully verified specialists matching your criteria.',
    },
    {
      number: '03',
      icon: '📅',
      title: 'Book a Slot',
      description: 'Choose an convenient time slot that works best for your schedule.',
    },
    {
      number: '04',
      icon: '✅',
      title: 'Get Better Faster',
      description: 'Attend your secure online/clinic session and begin active recovery.',
    },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Book your professional physiotherapy consultation in just a few minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative group">
              {/* Connector line (desktop only) */}
              {index < 3 && (
                <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-0.5 bg-slate-200" />
              )}

              {/* Icon Circle */}
              <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-4xl shadow-md group-hover:border-primary group-hover:shadow-lg transition-all duration-300 relative">
                {step.icon}
                <span className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-secondary text-lg mt-6 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium px-4 leading-relaxed">
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
