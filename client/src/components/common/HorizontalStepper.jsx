import React from 'react';

const HorizontalStepper = ({ 
  steps, 
  activeStep, 
  completedSteps = [], 
  animatingStepIdx = null, 
  onStepClick 
}) => {
  const N = steps.length;
  const segmentPercent = 50 / N;

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 select-none relative px-4">
      {/* Background Line Track */}
      <div 
        className="absolute top-[21px] h-[2px] bg-neutral-200 -z-10" 
        style={{ left: `${segmentPercent}%`, right: `${segmentPercent}%` }}
      />

      {/* Filled Line Segments */}
      <div 
        className="absolute top-[21px] h-[2px] -z-10 flex"
        style={{ left: `${segmentPercent}%`, right: `${segmentPercent}%` }}
      >
        {steps.map((_, idx) => {
          if (idx === N - 1) return null;
          // A connecting line is filled if the step on the left is completed
          const isLineFilled = completedSteps.includes(idx);
          return (
            <div key={idx} className="flex-1 h-full relative">
              <div 
                className="h-full bg-success transition-all duration-500 ease-in-out" 
                style={{ width: isLineFilled ? '100%' : '0%' }}
              />
            </div>
          );
        })}
      </div>

      {/* Steps Row */}
      <div className="flex justify-between items-start">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isActive = idx === activeStep;
          const isAnimating = animatingStepIdx === idx;

          return (
            <button
              key={step.value || step.key}
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick && onStepClick(idx)}
              className={`flex flex-col items-center focus:outline-none group ${
                onStepClick ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{ width: `${100 / N}%` }}
            >
              {/* Circle Container to keep size changes from shifting other elements */}
              <div className="h-11 flex items-center justify-center relative">
                <div 
                  className={`
                    rounded-full flex items-center justify-center border-2 transition-all duration-300 ease-in-out
                    ${isCompleted 
                      ? `bg-success border-success text-white ${
                          isAnimating ? 'animate-circle-pop shadow-level-2' : 'shadow-sm'
                        } w-9 h-9` 
                      : isActive 
                        ? 'bg-white border-primary text-primary shadow-level-2 scale-110 w-11 h-11' 
                        : 'bg-white border-neutral-200 text-neutral-300 w-9 h-9'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg 
                      className="w-5 h-5 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={3}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M5 13l4 4L19 7" 
                        className={isAnimating ? 'animate-checkmark' : ''} 
                      />
                    </svg>
                  ) : (
                    <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-neutral-400'}`}>
                      {idx + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Step Label */}
              <span 
                className={`
                  mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 text-center max-w-full truncate px-1
                  ${isActive 
                    ? 'text-primary' 
                    : isCompleted 
                      ? 'text-success' 
                      : 'text-neutral-400 group-hover:text-neutral-600'
                  }
                `}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalStepper;
