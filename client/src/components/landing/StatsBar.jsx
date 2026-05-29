import React from 'react';

const StatsBar = () => {
  const stats = [
    { value: '500+', label: 'VERIFIED DOCTORS' },
    { value: '15+', label: 'SPECIALIZATIONS' },
    { value: '4.8★', label: 'AVERAGE RATING' },
    { value: '100%', label: 'SECURE PAYMENTS' },
  ];

  return (
    <section className="w-full bg-swiss-gray-100 py-24 border-y-2 border-swiss-black">
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-swiss-black pb-4 mb-16">
          <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-swiss-red font-swiss">
            04.
          </span>
          <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-swiss-black font-swiss">
            PLATFORM SCALE
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-start"
            >
              <span className="text-[48px] sm:text-[64px] leading-none font-black text-swiss-black tracking-tight font-swiss">
                {stat.value}
              </span>
              <span className="text-[12px] font-bold text-swiss-gray-400 mt-2 uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
