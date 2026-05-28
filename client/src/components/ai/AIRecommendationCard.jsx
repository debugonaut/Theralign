import React from 'react';

const AIRecommendationCard = ({ result, onViewDoctors }) => {
  if (!result) return null;

  const confidenceConfig = {
    high:   { label: 'High Confidence',     className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    medium: { label: 'Moderate Confidence', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    low:    { label: 'Low Confidence',      className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'  },
  };

  const conf = confidenceConfig[result.confidence] || confidenceConfig.medium;

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-2xl mx-auto text-left animate-fadeIn">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <span className="text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
          ✨ AI Triage Recommendation
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${conf.className}`}>
          {conf.label}
        </span>
      </div>

      <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">Suggested Specialization:</p>

      <div className="bg-slate-950/60 rounded-xl px-5 py-4 mb-4 border border-slate-800 flex items-center gap-3">
        <span className="text-xl">🏥</span>
        <span className="font-extrabold text-base text-white tracking-tight">
          {result.suggestedSpecialization}
        </span>
      </div>

      {result.briefExplanation && (
        <p className="text-sm text-slate-300 mb-5 leading-relaxed font-medium">
          {result.briefExplanation}
        </p>
      )}

      <button
        onClick={onViewDoctors}
        className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl
                   font-extrabold text-sm shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all select-none cursor-pointer text-center"
      >
        View {result.suggestedSpecialization} Doctors →
      </button>

      <p className="text-[11px] text-slate-500 mt-4 leading-relaxed flex gap-1.5 items-start">
        <span className="shrink-0 text-amber-500/80">⚠️</span>
        <span>{result.disclaimer}</span>
      </p>
    </div>
  );
};

export default AIRecommendationCard;
