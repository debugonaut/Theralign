import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SymptomSearchBox from '../ai/SymptomSearchBox';
import Button from '../common/Button';
import BookingConfirmationCard from './BookingConfirmationCard';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <section className="relative w-full bg-white min-h-[70vh] flex items-center pt-8 pb-10 overflow-hidden border-b-2 border-neutral-900">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column - 7/12 width */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-4">
          <h1 className="text-display-sm md:text-[64px] lg:text-[72px] leading-[1.05] font-medium uppercase tracking-[-0.05em] text-neutral-900 font-swiss">
            FIND THE RIGHT<br />
            <span className="text-accent">PHYSIOTHERAPIST</span>,<br />
            NEAR YOU.
          </h1>

          <p className="text-[15px] lg:text-[16px] text-neutral-700 max-w-[600px] font-medium leading-[1.5]">
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

        {/* Right Column - 5/12 width */}
        <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative pl-8">
          <BookingConfirmationCard />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;

