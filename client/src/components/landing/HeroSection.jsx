import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SymptomSearchBox from '../ai/SymptomSearchBox';
import Button from '../common/Button';
import DoctorCardDeck from './DoctorCardDeck';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <section className="relative w-full bg-swiss-white min-h-[70vh] flex items-center pt-8 pb-10 overflow-hidden border-b-2 border-swiss-black">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 swiss-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column - 7/12 width */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-4">
          <h1 className="text-[48px] sm:text-[64px] lg:text-[72px] leading-[1.05] font-black uppercase tracking-[-0.05em] text-swiss-black font-swiss">
            FIND THE RIGHT<br />
            <span className="text-swiss-red">PHYSIOTHERAPIST</span>,<br />
            NEAR YOU.
          </h1>

          <p className="text-[15px] lg:text-[16px] text-swiss-gray-600 max-w-[600px] font-medium leading-[1.5]">
            Connect with verified clinical specialists for orthopedic, neurological, and post-surgical care.
          </p>

          <div className="w-full mt-2 max-w-[600px]">
            <SymptomSearchBox onSpecializationFound={handleSpecializationFound} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
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
            {/* Geometric Element: Architectural Weight Block */}
            <div className="absolute bottom-12 right-0 w-48 h-64 bg-swiss-black z-10"></div>
            
            {/* Geometric Element: Grid Pattern Block */}
            <div className="absolute top-24 left-0 w-56 h-56 border-2 border-swiss-black bg-swiss-white swiss-dot-matrix z-10"></div>

            {/* Geometric Element: Doctor Card Mockup replaced by DoctorCardDeck */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] z-20">
              <DoctorCardDeck />
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
