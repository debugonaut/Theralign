import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AIRecommendationCard = ({ result, onViewDoctors }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-6 bg-white brutalist-border text-neutral-900 shadow-[6px_6px_0px_0px_#fe8c66] text-left flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <span className="text-ui-xs font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-secondary shrink-0" /> AI RECOMMENDATION
        </span>
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
          {result.confidence ? `${result.confidence} confidence` : 'moderate confidence'}
        </span>
      </div>

      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
        Suggested Specialization:
      </p>

      <div className="bg-surface-container-low border-2 border-primary-container px-4 py-3 flex items-center gap-3">
        <span className="text-ui-lg font-black text-primary-container uppercase tracking-wide font-swiss">
          {result.suggestedSpecialization}
        </span>
      </div>

      {result.briefExplanation && (
        <p className="text-ui-md text-neutral-700 leading-relaxed font-semibold">
          {result.briefExplanation}
        </p>
      )}

      <button
        onClick={onViewDoctors}
        className="w-full py-4 bg-primary-container text-white font-swiss text-ui-md font-black uppercase flex items-center justify-center gap-2 hover:bg-primary transition-colors duration-fast brutalist-border select-none cursor-pointer"
      >
        View {result.suggestedSpecialization} Doctors →
      </button>

      {result.disclaimer && (
        <p className="text-[10px] text-neutral-500 leading-relaxed flex gap-1.5 items-start mt-2">
          <AlertTriangle className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
          <span>{result.disclaimer}</span>
        </p>
      )}
    </div>
  );
};

export default AIRecommendationCard;
