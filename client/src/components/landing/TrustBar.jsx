import React from 'react';

const TrustBar = () => {
  const signals = [
    'VERIFIED SPECIALISTS',
    'ONLINE BOOKING',
    'SECURE PAYMENTS',
    'REAL PATIENT REVIEWS',
  ];

  return (
    <section className="w-full bg-neutral-900 text-white h-20 flex items-center justify-center border-t-2 border-b-2 border-neutral-900">
      <div className="max-w-[1440px] mx-auto px-6 w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center justify-center min-w-max mx-auto gap-4 sm:gap-6 md:gap-12">
          {signals.map((signal, index) => (
            <React.Fragment key={index}>
              <span className="font-bold text-[11px] sm:text-xs uppercase tracking-[0.08em] font-swiss">
                {signal}
              </span>
              {index < signals.length - 1 && (
                <span className="text-accent font-bold text-xs sm:text-sm mx-1 sm:mx-2">•</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
