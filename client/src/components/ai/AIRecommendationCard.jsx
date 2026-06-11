import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const AIRecommendationCard = ({ result, onViewDoctors }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-6 bg-white border-2 border-warning text-neutral-900 rounded-none shadow-none text-left flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <span className="text-ui-sm font-semibold text-warning uppercase tracking-widest flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" /> AI RECOMMENDATION
        </span>
        <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
          {result.confidence ? `${result.confidence} confidence` : 'moderate confidence'}
        </span>
      </div>

      <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
        Suggested Specialization:
      </p>

      <div className="bg-neutral-100 border-2 border-neutral-900 px-4 py-3 flex items-center gap-3 rounded-none">
        <span className="text-ui-lg font-semibold text-neutral-900 uppercase tracking-wide">
          {result.suggestedSpecialization}
        </span>
      </div>

      {result.briefExplanation && (
        <p className="text-ui-md text-neutral-700 leading-relaxed font-medium">
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
        <p className="text-sm text-neutral-500 leading-relaxed flex gap-1.5 items-start mt-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <span>{result.disclaimer}</span>
        </p>
      )}
    </div>
  );
};

export default AIRecommendationCard;
