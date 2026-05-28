import React, { useState } from 'react';
import { interpretSymptomsAPI } from '../../api/ai.api';
import AIRecommendationCard from './AIRecommendationCard';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const SymptomSearchBox = ({ onSpecializationFound }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const charLimit = 500;
  const remainingChars = charLimit - symptoms.length;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= charLimit) {
      setSymptoms(val);
      if (error) setError(null);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const trimmed = symptoms.trim();
    if (trimmed.length < 5) {
      setError('Please describe your symptoms in more detail (minimum 5 characters)');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await interpretSymptomsAPI(trimmed);
      
      if (!response.success) {
        setError(response.message || 'Unable to analyze symptoms. Please try again.');
        return;
      }

      const data = response.data;

      if (!data.aiAvailable) {
        // Graceful fallback
        setError(data.fallbackMessage || 'AI recommendations are temporarily unavailable. Please use standard filters.');
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('Symptom search failed:', err);
      setError('Unable to analyze symptoms right now. Please use the search filters below.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctors = () => {
    if (result && result.suggestedSpecialization) {
      onSpecializationFound?.(result.suggestedSpecialization);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/15 rounded-xl border border-primary/25">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-extrabold text-white tracking-tight">AI-Powered Clinician Triage</h3>
            <p className="text-xs text-slate-400 font-medium">Describe how you feel to discover the ideal physiotherapy focus area.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={symptoms}
              onChange={handleInputChange}
              placeholder="e.g. Sharp pain in the outer knee when running or going down stairs, stiffness in joint..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-5 pr-5 py-4 text-sm font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
              disabled={loading}
            />
            {/* Length counter */}
            <span className={`absolute bottom-3 right-4 text-[10px] font-bold ${remainingChars < 50 ? 'text-amber-500' : 'text-slate-500'}`}>
              {remainingChars} / {charLimit}
            </span>
          </div>

          {/* Quick tips list */}
          <div className="flex flex-wrap gap-2 py-1 justify-start">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center">Try typing:</span>
            {['Lower back pain while sitting', 'Knee stiffness post-workout', 'Neck ache from screen work'].map((tip) => (
              <button
                key={tip}
                type="button"
                onClick={() => {
                  if (!loading) {
                    setSymptoms(tip);
                    setError(null);
                  }
                }}
                className="text-xs bg-slate-800/40 hover:bg-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all select-none cursor-pointer"
              >
                {tip}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || symptoms.trim().length < 5}
              className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-extrabold text-sm shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all inline-flex items-center justify-center gap-2 select-none cursor-pointer border border-transparent"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Find My Specialization
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Triage Query Warning</h5>
              <p className="text-xs text-rose-300 font-medium mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Small Legal Disclaimer */}
        <p className="text-[10px] text-slate-500 mt-4 text-center leading-relaxed">
          AI triage analysis is provided for educational advice only and is not a formal medical diagnosis.
        </p>
      </div>

      {/* Renders card dynamically when results are ready */}
      {result && (
        <AIRecommendationCard
          result={result}
          onViewDoctors={handleViewDoctors}
        />
      )}
    </div>
  );
};

export default SymptomSearchBox;
