import React from 'react';
import { Search, ChevronRight } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <section className="relative w-full bg-[#F8F8F6] py-20 sm:py-24 border-b-4 border-obsidian overflow-hidden" id="how-it-works">
      
      {/* Background gridlines to fit the Swiss Brutalist aesthetic */}
      <div className="absolute inset-0 bg-grid opacity-[0.15] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 relative z-10">
        
        {/* Left vertical border framing the content grid */}
        <div className="absolute left-6 sm:left-16 top-0 bottom-0 w-px bg-obsidian/30 z-0 hidden md:block" />

        {/* Content wrap shifted right for the left vertical margin layout */}
        <div className="md:pl-16 relative z-10">
          
          {/* Header Title with horizontal line behind */}
          <div className="relative w-full mb-16 flex flex-col items-center">
            {/* Horizontal Line behind */}
            <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
            
            {/* Text Overlay */}
            <div className="relative z-10 bg-[#F8F8F6] px-8 text-center">
              <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
                — SYSTEM ARCHITECTURE
              </span>
              <h2 className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
                HOW IT WORKS
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Describe Symptoms */}
            <div className="bg-white border-2 border-obsidian p-8 flex flex-col justify-between h-full hover:shadow-[8px_8px_0px_0px_#cfe5fe] transition-all duration-warm group">
              <div>
                <h3 className="font-black text-ui-lg text-primary uppercase tracking-wider mb-4 font-swiss">
                  01. DESCRIBE SYMPTOMS
                </h3>
                <p className="text-ui-sm text-on-surface-variant font-medium leading-[1.6] font-swiss mb-8">
                  Use our AI symptom search or browse directory categories directly. Our proprietary algorithm maps your physical feedback to clinical specializations.
                </p>
              </div>

              {/* Symptom Input Terminal Widget */}
              <div className="border border-obsidian/15 bg-surface-container-low/40 p-4 mt-auto">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-3 font-swiss">
                  <span>SYMPTOM INPUT TERMINAL</span>
                  <span className="text-neutral-400">REF_ID: SYMP-291</span>
                </div>
                
                {/* Mock Search Input */}
                <div className="relative flex items-center bg-white border border-obsidian/20 px-3 py-2 mb-3">
                  <span className="text-ui-xs font-semibold text-neutral-400 select-none uppercase font-swiss">
                    E.G. ACUTE LOWER BACK TENSION
                  </span>
                  <Search className="w-4 h-4 text-neutral-400 ml-auto" />
                </div>

                {/* Analyze Button */}
                <button className="w-full py-2 bg-primary-container hover:bg-primary text-white text-[11px] font-bold tracking-widest uppercase transition-colors duration-fast font-swiss">
                  ANALYZE
                </button>
              </div>
            </div>

            {/* Card 2: Browse Doctors */}
            <div className="bg-white border-2 border-obsidian p-8 flex flex-col justify-between h-full hover:shadow-[8px_8px_0px_0px_#cfe5fe] transition-all duration-warm group">
              <div>
                <h3 className="font-black text-ui-lg text-primary uppercase tracking-wider mb-4 font-swiss">
                  02. BROWSE DOCTORS
                </h3>
                <p className="text-ui-sm text-on-surface-variant font-medium leading-[1.6] font-swiss mb-8">
                  Review top-rated, fully verified specialists matching your criteria. Filter by surgical experience and availability.
                </p>
              </div>

              {/* Doctor Badge Widget */}
              <div className="border border-obsidian/15 bg-[#E8F4F8] p-4 flex items-center gap-3 mt-auto">
                <img 
                  src="/images/doc1.jpg" 
                  alt="Dr. Aris Vandenberg" 
                  className="w-12 h-12 rounded-full object-cover grayscale contrast-125 border border-obsidian/10"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-accent-coral uppercase font-swiss">
                    ORTHOPEDIC SURGEON
                  </span>
                  <span className="text-ui-sm font-bold text-obsidian uppercase font-swiss leading-tight mt-0.5">
                    DR. ARIS VANDENBERG
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase font-swiss mt-0.5">
                    98% SUCCESS • 14 YRS EXP
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-obsidian ml-auto flex-shrink-0" />
              </div>
            </div>

            {/* Card 3: Book A Slot */}
            <div className="bg-white border-2 border-obsidian p-8 flex flex-col justify-between h-full hover:shadow-[8px_8px_0px_0px_#cfe5fe] transition-all duration-warm group">
              <div>
                <h3 className="font-black text-ui-lg text-primary uppercase tracking-wider mb-4 font-swiss">
                  03. BOOK A SLOT
                </h3>
                <p className="text-ui-sm text-on-surface-variant font-medium leading-[1.6] font-swiss mb-8">
                  Choose a convenient time slot and begin active recovery. Instant confirmation and seamless integration.
                </p>
              </div>

              {/* Calendar Selector Widget */}
              <div className="mt-auto">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {/* Mon 09 (Active) */}
                  <div className="bg-primary-container border border-primary-container text-white py-2 flex flex-col items-center justify-center select-none">
                    <span className="text-[9px] font-bold tracking-wider uppercase font-swiss opacity-85">MON</span>
                    <span className="text-ui-md font-bold font-swiss mt-0.5 leading-none">09</span>
                  </div>
                  
                  {/* Tue 10 (Inactive) */}
                  <div className="bg-white border border-obsidian/20 hover:border-obsidian text-obsidian py-2 flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-fast">
                    <span className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 font-swiss">TUE</span>
                    <span className="text-ui-md font-bold font-swiss mt-0.5 leading-none">10</span>
                  </div>

                  {/* Wed 11 (Inactive) */}
                  <div className="bg-white border border-obsidian/20 hover:border-obsidian text-obsidian py-2 flex flex-col items-center justify-center cursor-pointer select-none transition-colors duration-fast">
                    <span className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 font-swiss">WED</span>
                    <span className="text-ui-md font-bold font-swiss mt-0.5 leading-none">11</span>
                  </div>

                  {/* Thu 12 (Disabled) */}
                  <div className="bg-neutral-50 border border-neutral-100 text-neutral-300 py-2 flex flex-col items-center justify-center select-none cursor-not-allowed">
                    <span className="text-[9px] font-bold tracking-wider uppercase font-swiss">THU</span>
                    <span className="text-ui-md font-bold font-swiss mt-0.5 leading-none">12</span>
                  </div>
                </div>

                {/* Secure Slot Button */}
                <button className="w-full py-3 bg-primary-container hover:bg-primary text-white text-[11px] font-bold tracking-widest uppercase transition-colors duration-fast font-swiss">
                  SECURE SLOT
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
