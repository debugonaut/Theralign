import React, { useEffect, useRef, useState } from 'react';
import { Star, ShieldCheck } from 'lucide-react';

/* ── Animated Counter Hook ────────────────── */
const useCounter = (target, duration = 1600, start = false) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const isDecimal = target % 1 !== 0;
    const raf = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
      const val = eased * target;
      setCurrent(isDecimal ? parseFloat(val.toFixed(2)) : Math.round(val));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [start, target, duration]);
  return current;
};

/* ── Main Section ─────────────────────────── */
const StatsBar = () => {
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated counters
  const providerCount = useCounter(1420, 1600, animate);
  const ratingCount = useCounter(4.92, 1600, animate);
  const specialtyCount = useCounter(32, 1600, animate);

  // Provider growth bar values (%)
  const growthBars = [30, 24, 45, 36, 58, 48, 72, 60, 92];

  return (
    <section
      className="relative w-full bg-[#F8F8F6] py-20 sm:py-24 border-b-4 border-obsidian overflow-hidden"
      id="platform-scale"
      ref={sectionRef}
      aria-labelledby="stats-title"
    >
      {/* Background gridlines for Swiss layout structure */}
      <div className="absolute inset-0 bg-grid opacity-[0.12] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-16 relative z-10">
        
        {/* Left vertical border framing the content grid */}
        <div className="absolute left-6 sm:left-16 top-0 bottom-0 w-px bg-obsidian/10 z-0 hidden md:block" />

        {/* Content shifted right to align with the grid layout */}
        <div className="md:pl-16 relative z-10">
          
          {/* Header Section */}
          <div className="mb-14 text-left">
            <span className="inline-block bg-accent-light text-accent-dark px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 font-swiss">
              PLATFORM ECOSYSTEM
            </span>
            <h2 id="stats-title" className="text-display-xs sm:text-display-md font-black text-obsidian tracking-wide leading-[1.05] uppercase font-swiss mb-4">
              THE NUMBERS SPEAK FOR THEMSELVES
            </h2>
            <p className="text-ui-md text-on-surface-variant font-medium leading-relaxed max-w-2xl font-swiss">
              Quantitative proof of clinical excellence and patient-first scalability across the Theralign network.
            </p>
          </div>

          {/* Grid Layout (5-columns on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            
            {/* Left Card: Credentialed Network (Teal Card, spans 3 columns) */}
            <div className="lg:col-span-3 bg-primary-container text-white p-8 sm:p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-standard shadow-level-1 hover:shadow-level-2 hover:-translate-y-1">
              
              {/* Medical Cross Watermark Logo */}
              <svg 
                viewBox="0 0 100 100" 
                className="absolute right-0 top-0 w-48 h-48 text-white/5 pointer-events-none select-none transform translate-x-8 -translate-y-8" 
                fill="currentColor"
              >
                <path d="M 42,12 H 58 V 42 H 88 V 58 H 58 V 88 H 42 V 58 H 12 V 42 H 42 Z" />
              </svg>

              <div className="relative z-10 mb-8">
                <span className="text-[11px] font-black tracking-widest text-primary-light uppercase font-swiss opacity-90 block mb-4">
                  CREDENTIALED NETWORK
                </span>
                
                <div className="flex items-baseline mb-2">
                  <span className="text-[56px] sm:text-[72px] font-black tracking-tighter leading-none font-swiss select-none">
                    {animate ? providerCount.toLocaleString() : '0'}
                  </span>
                  <span className="text-[40px] sm:text-[48px] font-black text-[#8ac0e1] ml-1 select-none">+</span>
                </div>

                <h3 className="text-ui-xl font-bold tracking-wide uppercase font-swiss mb-3">
                  Verified Medical Professionals
                </h3>
                
                <p className="text-ui-sm text-white/80 leading-relaxed font-swiss max-w-xl">
                  Rigorous 12-point clinical vetting ensures that every patient receives care from the top 5% of specialized practitioners.
                </p>
              </div>

              {/* Monthly Provider Growth Spark Bars Widget */}
              <div className="relative z-10 border border-white/10 bg-white/5 p-4 rounded-xl mt-auto">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-4 font-swiss">
                  <span className="text-white/60">Monthly Provider Growth</span>
                  <span className="text-white bg-white/10 px-2 py-0.5 rounded-sm">+12.4% VS PREV MONTH</span>
                </div>
                
                {/* Bar chart container */}
                <div className="flex items-end gap-3 h-14 pt-1">
                  {growthBars.map((val, i) => {
                    const isLast = i === growthBars.length - 1;
                    return (
                      <div key={i} className="flex-1 h-full flex items-end group relative">
                        <div
                          className={`w-full rounded-sm transition-all duration-1000 ${
                            isLast ? 'bg-[#c5e7ff]' : 'bg-white/20 hover:bg-white/45'
                          }`}
                          style={{
                            height: animate ? `${val}%` : '0%',
                            transitionDelay: animate ? `${i * 60}ms` : '0ms',
                          }}
                        />
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-obsidian text-white text-[9px] font-bold py-1 px-1.5 rounded-sm whitespace-nowrap transition-opacity duration-fast pointer-events-none z-20">
                          {isLast ? '+12.4%' : `+${(val / 7.5).toFixed(1)}%`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Cards Stack (Spans 2 columns) */}
            <div className="lg:col-span-2 flex flex-col gap-6 items-stretch justify-between">
              
              {/* Card 1: Specialities */}
              <div className="bg-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between border-l-4 border-secondary transition-all duration-standard shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 relative">
                
                {/* Specialties Badge */}
                <span className="absolute top-6 right-6 bg-[#FDF0EB] text-secondary font-black text-[9px] tracking-widest px-2.5 py-1 rounded-sm uppercase font-swiss">
                  SPECIALTIES
                </span>

                <div className="mb-4">
                  <div className="flex items-baseline mb-1">
                    <span className="text-[38px] sm:text-[44px] font-black text-obsidian tracking-tighter leading-none font-swiss select-none">
                      {specialtyCount}
                    </span>
                    <span className="text-[28px] font-black text-secondary ml-0.5 select-none">+</span>
                  </div>
                  <h4 className="text-ui-md font-bold text-obsidian uppercase tracking-wider font-swiss">
                    Clinical Specialisations
                  </h4>
                </div>

                {/* Capsule tags chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {['ORTHOPEDICS', 'CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY'].map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-neutral-100 text-[#1C2B3A] text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-sm uppercase font-swiss border border-neutral-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 2: Average Patient Satisfaction */}
              <div className="bg-surface-container-low p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-standard shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5">
                
                <div className="flex justify-between items-center mb-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <div className="flex gap-0.5 text-primary">
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <Star className="w-3.5 h-3.5 fill-primary" />
                    <Star className="w-3.5 h-3.5 fill-primary" />
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[38px] sm:text-[44px] font-black text-obsidian tracking-tighter leading-none font-swiss select-none">
                    {animate ? ratingCount.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-ui-md font-black text-primary ml-1 select-none">/5</span>
                  
                  <h4 className="text-ui-md font-bold text-obsidian uppercase tracking-wider font-swiss mt-1">
                    Average Patient Satisfaction
                  </h4>
                </div>

                {/* Animated SVG Sparkline Chart */}
                <div className="w-full h-12 mt-2 flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 40 L40 45 L70 32 L100 38 L130 26 L160 32 L190 18 L220 24 L250 8 L275 14"
                      stroke="#00374e"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 400,
                        strokeDashoffset: animate ? 0 : 400,
                        transition: 'stroke-dashoffset 2000ms cubic-bezier(0.25, 1, 0.5, 1)',
                        transitionDelay: '300ms',
                      }}
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: Secure Payments */}
              <div className="bg-white p-5 rounded-2xl flex items-center justify-between border border-neutral-200/60 transition-all duration-standard shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="bg-[#E6F4F1] text-success p-2.5 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-ui-sm font-bold text-obsidian uppercase tracking-wider font-swiss leading-tight">
                      Secure Payments
                    </h4>
                    <p className="text-[10px] font-black tracking-widest text-neutral-500 uppercase font-swiss mt-0.5">
                      HIPAA COMPLIANT PROCESSING
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end">
                  <span className="text-[10px] font-black tracking-widest text-success uppercase font-swiss border-b-2 border-success pb-0.5">
                    ENCRYPTED
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default StatsBar;
