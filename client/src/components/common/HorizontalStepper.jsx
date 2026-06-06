import React from 'react';
import { Check } from 'lucide-react';

const HorizontalStepper = ({ 
  steps, 
  activeStep, 
  completedSteps = [], 
  animatingStepIdx = null, 
  onStepClick 
}) => {
  const N = steps.length;
  const progressPercent = (activeStep / (N - 1)) * 100;
  const segmentWidth = 100 / N;
  const leftOffset = segmentWidth / 2;
  const trackWidth = 100 - segmentWidth;

  return (
    <div className="w-full select-none pb-8 mb-8 border-b border-[#EEF2F6] relative">
      {/* Background Line Track */}
      <div 
        className="absolute top-[18px] h-[1px] bg-[#DDE3EA] -z-10" 
        style={{ left: `${leftOffset}%`, right: `${leftOffset}%` }}
      />

      {/* Progress line overlay */}
      <div 
        className="absolute top-[18px] h-[2px] bg-[#0B4F6C] -z-10 transition-all duration-300 ease-out" 
        style={{ 
          left: `${leftOffset}%`, 
          width: `${progressPercent * (trackWidth / 100)}%` 
        }}
      />

      {/* Steps Row */}
      <div className="flex justify-between items-start">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isActive = idx === activeStep;
          const isUpcoming = idx > activeStep;

          const labels = [
            'Basic Info',
            'Medical History',
            'Lifestyle',
            'Emergency Contacts',
            'Insurance'
          ];
          const labelText = labels[idx] || step.label;

          // Determine circle classes and content
          let circleClass = 'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ';
          let childContent = null;
          let labelClass = 'text-[11px] tracking-[0.06em] mt-2 block transition-colors duration-200 ';

          if (isCompleted && !isActive) {
            // Completed step: teal background, no border, white checkmark
            circleClass += 'bg-[#0B4F6C] text-white';
            childContent = <Check size={14} strokeWidth={3} />;
            labelClass += 'font-semibold text-[#0B4F6C]';
          } else if (isActive) {
            // Current step: white background, 2.5px teal border, teal text number
            circleClass += 'bg-white border-[2.5px] border-[#0B4F6C] text-[#0B4F6C]';
            childContent = <span className="font-bold text-[13px]">{idx + 1}</span>;
            labelClass += 'font-bold text-[#0B4F6C]';
          } else {
            // Upcoming step: white background, 1.5px gray border, gray text number
            circleClass += 'bg-white border-[1.5px] border-[#DDE3EA] text-[#A8B8C8]';
            childContent = <span className="font-medium text-[13px]">{idx + 1}</span>;
            labelClass += 'font-normal text-[#A8B8C8]';
          }

          // Enforce: only step 1 (idx 0) or steps where the previous step is completed can be clicked
          const isClickable = idx === 0 || completedSteps.includes(idx - 1);

          return (
            <button
              key={step.value || step.key}
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick && onStepClick(idx)}
              className={`flex flex-col items-center focus:outline-none ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'
              }`}
              style={{ width: `${segmentWidth}%` }}
            >
              {/* Circle */}
              <div className={circleClass}>
                {childContent}
              </div>

              {/* Step Label */}
              <span className={labelClass}>
                {labelText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalStepper;
