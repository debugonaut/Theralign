import React from 'react';

const StatsBar = () => {
  const stats = [
    { value: '500+', label: 'Verified Doctors' },
    { value: '15+', label: 'Specializations' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '100%', label: 'Secure Payments' },
  ];

  return (
    <section className="relative z-20 -mt-8 px-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-card shadow-xl shadow-slate-100/80 border border-slate-100 p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 md:divide-x md:divide-slate-100">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center text-center p-2"
            >
              <span className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
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
