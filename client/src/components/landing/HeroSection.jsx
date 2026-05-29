import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SymptomSearchBox from '../ai/SymptomSearchBox';
import Button from '../common/Button';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <section className="relative w-full bg-swiss-white min-h-[90vh] flex items-center pt-24 pb-24 overflow-hidden border-b-2 border-swiss-black">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 swiss-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start relative z-10">
        
        {/* Left Column - 7/12 width */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-8">
          <h1 className="text-[48px] sm:text-[64px] lg:text-[80px] leading-[1.05] font-black uppercase tracking-[-0.05em] text-swiss-black font-swiss">
            FIND THE RIGHT<br />
            <span className="text-swiss-red">PHYSIOTHERAPIST</span>,<br />
            NEAR YOU.
          </h1>

          <p className="text-[16px] lg:text-[18px] text-swiss-gray-600 max-w-[600px] font-medium leading-[1.6]">
            Connect with verified clinical specialists for orthopedic, neurological, and post-surgical care.
          </p>

          <div className="w-full mt-4 max-w-[600px]">
            <label className="block text-[12px] font-bold text-swiss-red uppercase tracking-[0.06em] mb-2 font-swiss">
              DESCRIBE YOUR SYMPTOMS →
            </label>
            {/* The SymptomSearchBox needs to integrate well visually. Assuming it has standard styles. */}
            <div className="w-full border-2 border-swiss-black p-1 bg-swiss-white flex focus-within:border-4 transition-all duration-fast">
              <SymptomSearchBox 
                onSpecializationFound={handleSpecializationFound} 
                className="w-full border-none outline-none ring-0 shadow-none focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto">
            <Link to="/doctors" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                BROWSE DOCTORS →
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full">
                JOIN AS A PHYSIOTHERAPIST →
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - 5/12 width, Geometric Proof Composition */}
        <div className="hidden lg:flex lg:col-span-5 flex-col h-full relative pl-8">
          
          <div className="relative w-full h-[450px] mb-8">
            {/* Geometric Element: Bordered Circle */}
            <div className="absolute top-0 right-10 w-32 h-32 rounded-full border-2 border-swiss-black bg-swiss-white z-0"></div>
            
            {/* Geometric Element: Architectural Weight Block */}
            <div className="absolute bottom-12 right-0 w-48 h-64 bg-swiss-black z-10"></div>
            
            {/* Geometric Element: Grid Pattern Block */}
            <div className="absolute top-24 left-0 w-56 h-56 border-2 border-swiss-black bg-swiss-white swiss-dot-matrix z-10"></div>

            {/* Geometric Element: Doctor Card Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-swiss-white border-2 border-swiss-black p-6 z-20 shadow-none hover:-translate-y-1 hover:border-4 transition-all duration-fast">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-swiss-black bg-swiss-gray-100 flex items-center justify-center font-bold text-swiss-black">
                  JD
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wide text-swiss-black text-[14px]">DR. JANE DOE</div>
                  <div className="font-bold uppercase tracking-[0.08em] text-[11px] text-swiss-red mt-1">SPORTS PHYSIOTHERAPY</div>
                </div>
              </div>
              <div className="border-t-2 border-swiss-black pt-4 flex justify-between items-center">
                <div className="font-bold text-[18px] font-swiss tracking-tight">4.9/5 ★</div>
                <div className="border-2 border-swiss-teal text-swiss-teal px-2 py-1 text-[11px] font-bold uppercase tracking-widest bg-swiss-white">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>

          {/* Trust Metrics Flush with CTAs */}
          <div className="mt-auto flex items-center justify-between border-t-2 border-swiss-black pt-6 w-full">
            <div className="flex flex-col">
              <span className="font-black text-[32px] tracking-[-0.03em] text-swiss-black font-swiss">500+</span>
              <span className="font-bold text-[11px] uppercase tracking-[0.08em] text-swiss-gray-400">VERIFIED DOCTORS</span>
            </div>
            <div className="w-px h-12 bg-swiss-black"></div>
            <div className="flex flex-col">
              <span className="font-black text-[32px] tracking-[-0.03em] text-swiss-black font-swiss">2,000+</span>
              <span className="font-bold text-[11px] uppercase tracking-[0.08em] text-swiss-gray-400">APPOINTMENTS</span>
            </div>
            <div className="w-px h-12 bg-swiss-black"></div>
            <div className="flex flex-col">
              <span className="font-black text-[32px] tracking-[-0.03em] text-swiss-black font-swiss">4.9/5</span>
              <span className="font-bold text-[11px] uppercase tracking-[0.08em] text-swiss-gray-400">AVERAGE RATING</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;
