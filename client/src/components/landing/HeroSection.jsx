import AIProductDemo from './AIProductDemo';
import { Zap, Target, ShieldCheck } from 'lucide-react';

const HeroSection = () => {
  return (
    <>
      {/* Hero Section Centered */}
      <section 
        className="w-full bg-white border-b-4 border-obsidian min-h-[85vh] flex items-center justify-center"
        id="ai-matching"
        aria-labelledby="ai-section-title"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 py-12 md:py-20 flex flex-col items-center">
          {/* Header Title with horizontal line behind */}
          <div className="relative w-full mb-16 flex flex-col items-center">
            {/* Horizontal Line behind */}
            <div className="absolute left-0 right-0 top-[60%] h-px bg-obsidian/20 z-0" />
            
            {/* Text Overlay */}
            <div className="relative z-10 bg-white px-8 text-center">
              <span className="inline-flex items-center gap-2 text-ui-xs tracking-[0.2em] font-bold text-primary font-swiss uppercase mb-2">
                — AI DOCTOR MATCHING
              </span>
              <h2 id="ai-section-title" className="text-display-sm sm:text-display-md font-serif text-obsidian tracking-wide leading-none uppercase font-normal">
                DESCRIBE YOUR PAIN, WE FIND YOUR SPECIALIST
              </h2>
            </div>
          </div>

          <div className="w-full max-w-3xl flex flex-col text-center">
            <p className="text-ui-md sm:text-ui-lg text-neutral-500 mb-8 max-w-2xl mx-auto font-regular font-swiss">
              Our AI analyses your symptoms, condition history, and location to match you with the right verified physiotherapist — in seconds. No referral. No waiting list. Just clinical precision.
            </p>
            
            {/* Diagnostic Input Box */}
            <div className="w-full text-left">
              <AIProductDemo />
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
