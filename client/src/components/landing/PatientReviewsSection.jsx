import React from 'react';
import { Quote } from 'lucide-react';

const PatientReviewsSection = () => {
  const reviews = [
    {
      name: 'MICHAEL T.',
      condition: 'POST-ACL RECONSTRUCTION',
      outcome: 'Returned to competitive running after 6 weeks of targeted therapy.',
      rating: '5.0',
    },
    {
      name: 'SARAH L.',
      condition: 'CHRONIC LOWER BACK PAIN',
      outcome: 'Achieved full mobility and zero pain symptoms after years of chronic issues.',
      rating: '5.0',
    },
    {
      name: 'DAVID K.',
      condition: 'ROTATOR CUFF INJURY',
      outcome: 'Restored full range of overhead motion without requiring surgical intervention.',
      rating: '5.0',
    },
  ];

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto w-full">
      <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-swiss-black pb-4 mb-16">
        <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-swiss-red font-swiss">
          05.
        </span>
        <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-swiss-black font-swiss">
          PATIENT OUTCOMES
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-swiss-white border-2 border-swiss-black p-8 relative flex flex-col hover:-translate-y-1 transition-transform duration-fast shadow-none"
          >
            {/* Left edge 4px red highlight */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-swiss-red"></div>

            <div className="pl-6 flex flex-col h-full">
              <Quote className="w-8 h-8 text-swiss-gray-200 mb-6" />
              
              <p className="text-[16px] text-swiss-black font-medium leading-[1.6] mb-8 flex-grow">
                "{review.outcome}"
              </p>
              
              <div className="flex items-end justify-between border-t-2 border-swiss-gray-200 pt-6">
                <div>
                  <h4 className="font-bold text-[14px] text-swiss-black uppercase tracking-widest">
                    {review.name}
                  </h4>
                  <span className="text-[11px] font-bold text-swiss-gray-400 uppercase tracking-[0.08em] mt-1 block">
                    {review.condition}
                  </span>
                </div>
                <div className="font-black text-[16px] text-swiss-black tracking-tight flex items-center gap-1">
                  {review.rating} <span className="text-swiss-red">★</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PatientReviewsSection;
