import React from 'react';
import Button from '../common/Button';

const AIRecommendationCard = ({ result, onViewDoctors }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-6 bg-swiss-white border-2 border-swiss-amber text-swiss-black rounded-none shadow-none text-left flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-swiss-gray-200">
        <span className="text-ui-xs font-black text-swiss-amber uppercase tracking-widest">
          ⚠️ AI RECOMMENDATION
        </span>
        <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
          {result.confidence ? `${result.confidence} confidence` : 'moderate confidence'}
        </span>
      </div>

      <p className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-wider">
        Suggested Specialization:
      </p>

      <div className="bg-swiss-gray-100 border-2 border-swiss-black px-4 py-3 flex items-center gap-3 rounded-none">
        <span className="text-ui-lg font-black text-swiss-black uppercase tracking-wide">
          {result.suggestedSpecialization}
        </span>
      </div>

      {result.briefExplanation && (
        <p className="text-ui-md text-swiss-gray-600 leading-relaxed font-medium">
          {result.briefExplanation}
        </p>
      )}

      <Button
        variant="primary"
        onClick={onViewDoctors}
        className="w-full flex items-center justify-center gap-2"
      >
        View {result.suggestedSpecialization} Doctors →
      </Button>

      {result.disclaimer && (
        <p className="text-[10px] text-swiss-gray-400 leading-relaxed flex gap-1.5 items-start mt-2">
          <span className="shrink-0 text-swiss-amber">⚠️</span>
          <span>{result.disclaimer}</span>
        </p>
      )}
    </div>
  );
};

export default AIRecommendationCard;
