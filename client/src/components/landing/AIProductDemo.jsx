import { useState, useEffect, useRef, useCallback } from 'react';
import { Stethoscope, Sparkles, ArrowRight } from 'lucide-react';

const AIProductDemo = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const [time, setTime] = useState(() => prefersReducedMotion ? 10000 : 0);
  const [cursorCoords, setCursorCoords] = useState({ x: 30, y: 40 });

  const leftPanelRef = useRef(null);
  const kneeInjuryChipRef = useRef(null);
  const textareaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const orthoChipRef = useRef(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Update target cursor coordinates
  const updateCoords = useCallback(() => {
    if (!leftPanelRef.current) return;
    const containerRect = leftPanelRef.current.getBoundingClientRect();
    
    // Determine active target based on current time
    let targetRef = null;
    
    if (time >= 400 && time < 1350) {
      targetRef = kneeInjuryChipRef;
    } else if (time >= 1350 && time < 3800) {
      targetRef = textareaRef;
    } else if (time >= 3800 && time < 6000) {
      targetRef = submitButtonRef;
    } else if (time >= 6000) {
      targetRef = orthoChipRef;
    }

    if (targetRef && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      setCursorCoords({ x, y });
    } else {
      // Fallbacks
      if (time < 400) {
        setCursorCoords({ x: 40, y: 50 });
      } else if (time >= 400 && time < 1350) {
        setCursorCoords({ x: 180, y: 228 });
      } else if (time >= 1350 && time < 3800) {
        setCursorCoords({ x: 120, y: 90 });
      } else if (time >= 3800 && time < 6000) {
        setCursorCoords({ x: 250, y: 260 });
      } else {
        setCursorCoords({ x: 160, y: 460 });
      }
    }
  }, [time]);

  // Main animation timer loop
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setTime((prev) => {
        const next = prev + 50;
        if (next >= 14000) {
          return 0; // Restart loop
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Recalculate coordinates on time changes or resize
  useEffect(() => {
    updateCoords();
  }, [updateCoords]);

  useEffect(() => {
    const handleResize = () => {
      updateCoords();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCoords]);

  // Handle replay button click
  const handleReplay = () => {
    if (!prefersReducedMotion) {
      setTime(0);
    }
  };

  const isCursorPressed =
    (time >= 1200 && time < 1350) ||
    (time >= 4000 && time < 4150) ||
    (time >= 6500 && time < 6650);

  const showRipple =
    (time >= 1200 && time < 1600) ||
    (time >= 4000 && time < 4400) ||
    (time >= 6500 && time < 6900);

  const rippleKey =
    time >= 6500 ? 6500 :
    time >= 4000 ? 4000 : 1200;

  const selectedChip = time >= 1200;
  const textareaFocused = time >= 1200;

  const fullText = "sharp knee pain when climbing stairs, started 2 weeks ago after a running session";
  let typedText = "";
  if (time >= 1200 && time < 3800) {
    const charsCount = Math.floor((time - 1200) / 32);
    typedText = fullText.slice(0, charsCount);
  } else if (time >= 3800) {
    typedText = fullText;
  }

  const buttonHovered = time >= 3800 && time < 4000;
  const buttonPressed = time >= 4000 && time < 4150;
  const isProcessing = time >= 4000 && time < 5200;
  const loadingProgress = isProcessing ? Math.min(100, ((time - 4000) / 1200) * 100) : 0;
  const showResult = time >= 5200;
  const resultChipSelected = time >= 6500;
  const showRightPanel = time >= 6500;

  // Render components
  return (
    <div className="w-full flex flex-col items-center">
      {/* Demo Block Container */}
      <div 
        className="w-full border-[3px] border-obsidian rounded-none overflow-hidden bg-white relative flex flex-col justify-between"
        style={{ minHeight: '520px' }}
      >
        {/* Step Progress Strip */}
        <div className="w-full h-[3px] bg-[#F2F2F2] absolute top-0 left-0 z-30">
          <div 
            className="h-full bg-[#FF3000] transition-all duration-75"
            style={{ width: `${(time / 14000) * 100}%` }}
          />
        </div>

        {/* CSS Animation Keyframes */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes ripple-anim {
            0% {
              width: 0px;
              height: 0px;
              opacity: 1;
            }
            100% {
              width: 28px;
              height: 28px;
              opacity: 0;
            }
          }
          .animate-ripple {
            animation: ripple-anim 400ms ease-out forwards;
          }
          @keyframes text-cursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-text-cursor {
            animation: text-cursor-blink 800ms steps(2) infinite;
          }
        `}} />

        {/* Two-Panel Layout Grid */}
        <div 
          className="w-full grid flex-1"
          style={{
            gridTemplateColumns: showRightPanel ? '1fr 1fr' : '1fr 0fr',
            transition: 'grid-template-columns 600ms cubic-bezier(0.25, 0, 0, 1)'
          }}
        >
          {/* LEFT PANEL: AI Interface */}
          <div 
            ref={leftPanelRef}
            className="p-6 md:p-8 flex flex-col gap-6 relative select-none w-full h-full justify-between"
            style={{ minWidth: '320px' }}
          >
            {/* Symptom Input Title */}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-obsidian font-swiss">
                Describe Your Symptoms
              </span>
              <ArrowRight className="w-4 h-4 text-obsidian" />
            </div>

            {/* Input Form Box */}
            <div className="w-full flex-1 flex flex-col justify-start">
              {/* Textarea */}
              <div className="relative w-full mb-4">
                <div 
                  ref={textareaRef}
                  className={`w-full h-32 border-[3px] border-obsidian p-4 font-swiss text-[14px] text-obsidian bg-[#E8F4F8] transition-shadow duration-150 flex items-start justify-start select-none`}
                  style={{
                    boxShadow: textareaFocused ? '0 0 0 3px #FF3000' : 'none'
                  }}
                >
                  <p className="text-obsidian leading-relaxed">
                    {typedText}
                    {textareaFocused && time < 3800 && (
                      <span className="text-obsidian font-bold ml-0.5 animate-text-cursor">|</span>
                    )}
                    {typedText.length === 0 && (
                      <span className="text-neutral-500/60">e.g. sharp knee pain when climbing stairs...</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Symptom Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'back', label: 'BACK PAIN' },
                  { id: 'knee', label: 'KNEE INJURY', ref: kneeInjuryChipRef },
                  { id: 'shoulder', label: 'SHOULDER TENSION' },
                  { id: 'rehab', label: 'POST-SURGERY REHAB' }
                ].map((chip) => {
                  const isSelected = chip.id === 'knee' && selectedChip;
                  return (
                    <div
                      key={chip.id}
                      ref={chip.ref}
                      className={`px-3 py-1.5 border-[3px] border-obsidian text-[11px] font-bold uppercase transition-colors duration-100 select-none ${
                        isSelected ? 'bg-obsidian text-white' : 'bg-white text-obsidian'
                      }`}
                    >
                      {chip.label}
                    </div>
                  );
                })}
              </div>

              {/* Search Button */}
              <button
                ref={submitButtonRef}
                className={`w-full h-14 uppercase font-bold text-[13px] tracking-wider flex items-center justify-center gap-2 border-[3px] border-obsidian transition-colors duration-100 cursor-default select-none ${
                  buttonHovered ? 'bg-[#FF3000] text-white' : 'bg-obsidian text-white'
                }`}
                style={{
                  transform: buttonPressed ? 'scale(0.97)' : 'scale(1)',
                  transition: 'transform 100ms linear'
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
                FIND MY SPECIALIZATION
              </button>
            </div>

            {/* AI Recommendation Box */}
            <div className="w-full min-h-[140px] flex flex-col justify-end">
              {isProcessing && (
                <div className="w-full flex flex-col gap-2 mt-4">
                  <div className="w-full h-[3px] bg-[#F2F2F2]">
                    <div 
                      className="h-full bg-[#0B4F6C]"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <span className="font-semibold text-[11px] text-[#6B7C93] uppercase tracking-[0.08em]">
                    ANALYSING SYMPTOMS...
                  </span>
                </div>
              )}

              {showResult && (
                <div 
                  className="w-full border-[3px] border-obsidian bg-[#F2F2F2] p-4 md:p-5 mt-2 transition-opacity duration-300 flex flex-col text-left"
                  style={{ opacity: showResult ? 1 : 0 }}
                >
                  <span className="font-bold text-[10px] text-[#FF3000] uppercase tracking-[0.12em]">
                    AI RECOMMENDATION
                  </span>
                  <h3 className="font-black text-[18px] md:text-[22px] text-obsidian uppercase tracking-[-0.01em] mt-1 leading-none">
                    ORTHOPEDIC PHYSIOTHERAPY
                  </h3>
                  <span className="font-bold text-[11px] text-[#0A7E6E] uppercase tracking-[0.08em] mt-1">
                    94% CONFIDENCE MATCH
                  </span>
                  <p className="text-[13px] text-[#555555] font-normal leading-relaxed mt-2.5">
                    Knee pain with activity onset suggests orthopedic or sports physiotherapy specialisation.
                  </p>
                  
                  {/* Action Chips */}
                  <div className="flex flex-wrap gap-2 mt-3.5">
                    <div
                      ref={orthoChipRef}
                      className={`px-3 py-1.5 border-[3px] border-obsidian text-[11px] font-bold uppercase transition-colors duration-100 select-none ${
                        resultChipSelected ? 'bg-obsidian text-white' : 'bg-white text-obsidian'
                      }`}
                    >
                      ORTHOPEDIC PHYSIOTHERAPY →
                    </div>
                    <div className="px-3 py-1.5 border-[3px] border-obsidian text-[11px] font-bold uppercase bg-white text-obsidian select-none">
                      SPORTS PHYSIOTHERAPY →
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom SVG pointer cursor */}
            {!prefersReducedMotion && (
              <div
                className="absolute z-50 pointer-events-none transition-transform"
                style={{
                  transform: `translate(${cursorCoords.x}px, ${cursorCoords.y}px) scale(${isCursorPressed ? 0.85 : 1})`,
                  transition: isCursorPressed ? 'transform 100ms linear' : 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  left: -10,
                  top: -12,
                }}
              >
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1V21.5L7.2 15.3L12.5 22.8L15.6 20.6L10.3 13.1L17.5 13.1L1 1Z" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5"/>
                </svg>
                {/* Ripple element */}
                {showRipple && (
                  <div
                    key={rippleKey}
                    className="absolute border-[2px] border-obsidian rounded-full animate-ripple"
                    style={{
                      left: '8px',
                      top: '8px',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Map with Doctor Pins */}
          <div 
            className="h-full relative overflow-hidden bg-[#EEF2F6] flex flex-col justify-start border-l-[3px] border-obsidian"
            style={{
              opacity: showRightPanel ? 1 : 0,
              transition: 'opacity 600ms cubic-bezier(0.25, 0, 0, 1)'
            }}
          >
            {/* Header bar */}
            <div className="bg-obsidian py-3 px-5 flex items-center justify-between z-10 w-full shrink-0">
              <span className="font-bold text-[12px] text-white uppercase tracking-[0.08em]">
                3 SPECIALISTS FOUND NEARBY
              </span>
              <span className="font-semibold text-[10px] text-[#FF3000] uppercase tracking-[0.1em]">
                ORTHOPEDIC PHYSIOTHERAPY
              </span>
            </div>

            {/* Map Area */}
            <div className="flex-1 w-full relative overflow-hidden">
              {/* Grid / Street System Map Background */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Fine grid patterns */}
                <defs>
                  <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#city-grid)" />
                
                {/* Clean white street paths */}
                <line x1="15%" y1="0" x2="15%" y2="100%" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="78%" y1="0" x2="78%" y2="100%" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="0" y1="28%" x2="100%" y2="28%" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="0" y1="62%" x2="100%" y2="62%" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              {/* Pin 1: top-left quadrant (30%, 35%) */}
              <div 
                className={`absolute pointer-events-auto transition-transform duration-300 ${
                  time >= 6500 ? 'scale-100' : 'scale-0'
                }`}
                style={{
                  left: '30%',
                  top: '35%',
                  transform: `translate(-50%, -100%) scale(${time >= 6500 ? 1 : 0})`,
                  transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Tooltip */}
                {time >= 6500 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white border-2 border-obsidian p-2.5 min-w-[180px] rounded-none text-left z-20">
                    <div className="font-bold text-[13px] text-obsidian uppercase">Dr. Anirudh Sharma</div>
                    <div className="font-normal text-[11px] text-[#0B4F6C] uppercase">Orthopedic Physio</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-semibold text-[11px] text-[#FF3000]">★ 4.9</span>
                      <span className="font-normal text-[11px] text-[#888888] uppercase">1.2 KM</span>
                    </div>
                  </div>
                )}
                {/* Pin Circle */}
                <div className="w-12 h-12 bg-white border-[3px] border-obsidian rounded-full flex items-center justify-center relative hover:border-[#FF3000] transition-colors duration-150">
                  <Stethoscope className="w-5 h-5 text-[#0B4F6C]" />
                </div>
                {/* Pin Triangle */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-obsidian mx-auto -mt-[2px] hover:border-t-[#FF3000] transition-colors duration-150" />
              </div>

              {/* Pin 2: center map (55%, 55%) - highlighted */}
              <div 
                className={`absolute pointer-events-auto transition-transform duration-300 ${
                  time >= 6750 ? 'scale-100' : 'scale-0'
                }`}
                style={{
                  left: '55%',
                  top: '55%',
                  transform: `translate(-50%, -100%) scale(${time >= 6750 ? 1.05 : 0})`,
                  transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Tooltip (pre-expanded and slightly larger) */}
                {time >= 6750 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white border-[3px] border-[#FF3000] p-3 min-w-[195px] rounded-none text-left z-20">
                    <div className="font-bold text-[14px] text-obsidian uppercase">Dr. Priya Mehta</div>
                    <div className="font-normal text-[11px] text-[#0B4F6C] uppercase">Sports Physio</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-semibold text-[11px] text-[#FF3000]">★ 4.9</span>
                      <span className="font-normal text-[11px] text-[#888888] uppercase">0.8 KM</span>
                    </div>
                  </div>
                )}
                {/* Pin Circle */}
                <div className="w-12 h-12 bg-[#FF3000] border-[3px] border-[#FF3000] rounded-full flex items-center justify-center relative">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                {/* Pin Triangle */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#FF3000] mx-auto -mt-[2px]" />
              </div>

              {/* Pin 3: right side map (75%, 40%) */}
              <div 
                className={`absolute pointer-events-auto transition-transform duration-300 ${
                  time >= 7000 ? 'scale-100' : 'scale-0'
                }`}
                style={{
                  left: '75%',
                  top: '40%',
                  transform: `translate(-50%, -100%) scale(${time >= 7000 ? 1 : 0})`,
                  transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {/* Tooltip */}
                {time >= 7000 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white border-2 border-obsidian p-2.5 min-w-[180px] rounded-none text-left z-20">
                    <div className="font-bold text-[13px] text-obsidian uppercase">Dr. Aman Verma</div>
                    <div className="font-normal text-[11px] text-[#0B4F6C] uppercase">Orthopedic Physio</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-semibold text-[11px] text-[#FF3000]">★ 4.8</span>
                      <span className="font-normal text-[11px] text-[#888888] uppercase">2.1 KM</span>
                    </div>
                  </div>
                )}
                {/* Pin Circle */}
                <div className="w-12 h-12 bg-white border-[3px] border-obsidian rounded-full flex items-center justify-center relative hover:border-[#FF3000] transition-colors duration-150">
                  <Stethoscope className="w-5 h-5 text-[#0B4F6C]" />
                </div>
                {/* Pin Triangle */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-obsidian mx-auto -mt-[2px] hover:border-t-[#FF3000] transition-colors duration-150" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Replay button control */}
      <button 
        onClick={handleReplay} 
        className="mt-4 font-semibold text-[11px] uppercase tracking-wider text-obsidian hover:text-[#FF3000] transition-colors cursor-pointer select-none"
      >
        ↺ REPLAY DEMO
      </button>
    </div>
  );
};

export default AIProductDemo;
