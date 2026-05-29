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
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 px-6 sm:px-8 overflow-hidden bg-gradient-to-br from-sky-50 via-sky-100/50 to-slate-50">
      {/* Background ambient design blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column - 55% width on desktop */}
        <div className="md:col-span-7 flex flex-col items-start text-left gap-6">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider select-none">
            🚀 India&apos;s Physiotherapy Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary leading-tight tracking-tight">
            Find the Right<br />
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Physiotherapist,</span><br />
            Near You.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
            Connect with verified physiotherapy specialists for orthopedic, sports, neurological, and post-surgical care. Book online. Pay securely.
          </p>

          {/* Embedded Symptom Search Box */}
          <div className="w-full mt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Or describe your symptoms to find matches:
            </p>
            <SymptomSearchBox onSpecializationFound={handleSpecializationFound} />
          </div>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Link to="/doctors" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full">
                Browse All Doctors →
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full bg-white">
                Register as a Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - 45% width, decorative CSS illustration, hidden on mobile */}
        <div className="hidden md:flex md:col-span-5 justify-center items-center h-full relative">
          <div className="relative w-80 h-80 lg:w-96 lg:h-96 flex items-center justify-center">
            {/* Pulsing animated outer ring */}
            <div className="absolute inset-0 border-2 border-primary/20 rounded-3xl rotate-6 animate-pulse" />
            <div className="absolute inset-4 border border-indigo-400/20 rounded-3xl -rotate-12" />
            
            {/* Vibrant colorful card shape */}
            <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-2xl p-8 flex flex-col justify-between text-white transform hover:rotate-2 transition-transform duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl mb-6 shadow-inner">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Active Recovery</h3>
                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                  Combining medical expertise with AI precision diagnostics to return you to peak functional capacity.
                </p>
              </div>

              <div className="flex items-center justify-between mt-8">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
                  Verified Specialists
                </span>
                <span className="text-xl font-bold">100% Care</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
