import React from 'react';
import { useNavigate } from 'react-router-dom';
import SymptomSearchBox from '../ai/SymptomSearchBox';
import { Zap, Target, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <>
      {/* Hero Section Asymmetric */}
      <section 
        className="w-full bg-white border-b-4 border-obsidian min-h-[85vh] flex items-center"
        id="ai-matching"
        aria-labelledby="ai-section-title"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 grid grid-cols-12 items-center py-12 md:py-20">
          {/* Left Asymmetric Whitespace Column */}
          <div className="hidden lg:flex col-span-2 h-full items-start border-r-2 border-obsidian/10 min-h-[300px]"></div>

          {/* Right Content Column */}
          <div className="col-span-12 lg:col-span-10 lg:pl-16">
            <div className="max-w-4xl">
              <p className="text-ui-sm text-accent-coral mb-4 uppercase tracking-widest font-bold font-swiss">
                01. AI DOCTOR MATCHING
              </p>
              <h1 id="ai-section-title" className="text-display-sm sm:text-display-md uppercase mb-6 leading-[0.95] font-black font-swiss text-obsidian">
                DESCRIBE YOUR PAIN.<br />
                <span className="text-primary-container">WE FIND YOUR SPECIALIST.</span>
              </h1>
              <p className="text-ui-md sm:text-ui-lg text-neutral-500 mb-8 max-w-2xl font-regular font-swiss">
                Our AI analyses your symptoms, condition history, and location to match you with the right verified physiotherapist — in seconds. No referral. No waiting list. Just clinical precision.
              </p>
              
              {/* Diagnostic Input Box */}
              <div className="w-full max-w-3xl">
                <SymptomSearchBox onSpecializationFound={handleSpecializationFound} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-surface-container-low border-b-2 border-obsidian">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3">
          {/* Instant Matching */}
          <div className="p-8 sm:p-12 md:border-r-2 border-obsidian group hover:bg-white transition-colors duration-fast">
            <Zap className="text-primary-container w-12 h-12 mb-6" />
            <h3 className="text-ui-xl uppercase mb-4 font-black font-swiss text-obsidian">INSTANT MATCHING</h3>
            <p className="text-ui-md text-neutral-500 font-swiss">
              Describe symptoms in plain language — get matched to a specialist in under 10 seconds.
            </p>
          </div>
          {/* Condition-Specific */}
          <div className="p-8 sm:p-12 md:border-r-2 border-obsidian group hover:bg-white transition-colors duration-fast">
            <Target className="text-primary-container w-12 h-12 mb-6" />
            <h3 className="text-ui-xl uppercase mb-4 font-black font-swiss text-obsidian">CONDITION-SPECIFIC</h3>
            <p className="text-ui-md text-neutral-500 font-swiss">
              Trained on 15+ physiotherapy specializations for accurate, relevant results every time.
            </p>
          </div>
          {/* Verified Results */}
          <div className="p-8 sm:p-12 group hover:bg-white transition-colors duration-fast">
            <ShieldCheck className="text-primary-container w-12 h-12 mb-6" />
            <h3 className="text-ui-xl uppercase mb-4 font-black font-swiss text-obsidian">VERIFIED RESULTS ONLY</h3>
            <p className="text-ui-md text-neutral-500 font-swiss">
              Every matched doctor is clinically verified. No unvetted listings. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Anchor / Clinical Background */}
      <section className="relative h-[500px] sm:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10"></div>
        <div 
          className="absolute inset-0 grayscale contrast-125 bg-cover bg-center" 
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBhnKBJPY5hX0h1dthATpnrPF475bYLyeIwraO5WX_I0-qOAt6MrLBjuUoPEuCEpBrBH4mODnIkwSF5k5RNUHYbJdqIjSxJnEl9Nm7rJYJDNVjiMkITiPgwG4ReFkb2yibMXCT64KyfaLdC87-zUfyK1t8kUHDUiqtcA-nTvbtlX7SANK-tF3ZMXlWEz5dYCBWXYuY2cgcqc5whg0V3lu1fZ8DEwF46ZUDNk6XyV-jsV0ZLvLp8pTabiQadwLiRAwmwJWiun00W0BJ4")' }}
        ></div>
        <div className="relative z-20 h-full flex items-center justify-center px-6">
          <div className="bg-white brutalist-border p-8 sm:p-12 max-w-xl text-center transform -rotate-1 hover:rotate-0 transition-transform duration-standard cursor-default shadow-[12px_12px_0px_0px_#0b4f6c]">
            <div className="text-ui-xs text-accent-coral mb-2 tracking-[0.2em] font-bold font-swiss">
              CERTIFIED CLINICAL ACCURACY
            </div>
            <h2 className="text-display-xs sm:text-display-sm uppercase leading-none mb-6 font-black font-swiss text-obsidian">
              CLINICAL PRECISION<br />GUARANTEED
            </h2>
            <div className="flex justify-center gap-6 sm:gap-8 border-t-2 border-obsidian/10 pt-8">
              <div>
                <div className="text-display-sm font-black text-primary-container font-swiss">98.4%</div>
                <div className="text-ui-xs uppercase text-neutral-500 font-bold font-swiss">Match Accuracy</div>
              </div>
              <div className="border-r-2 border-obsidian/10"></div>
              <div>
                <div className="text-display-sm font-black text-primary-container font-swiss">15k+</div>
                <div className="text-ui-xs uppercase text-neutral-500 font-bold font-swiss">Verified Specialists</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
