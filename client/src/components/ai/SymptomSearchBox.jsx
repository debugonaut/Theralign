import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { interpretSymptomsAPI } from '../../api/ai.api';
import AIRecommendationCard from './AIRecommendationCard';
import useAuthStore from '../../store/authStore';
import { Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const SymptomSearchBox = ({ onSpecializationFound }) => {
  const { isAuthenticated, user } = useAuthStore();
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

    if (!isAuthenticated || user?.role !== 'patient') {
      setError('Please log in as a patient to use AI symptom analysis.');
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
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError('Please log in as a patient to use AI symptom analysis.');
      } else if (err?.response?.status === 429) {
        setError('Too many AI requests. Please wait a moment and try again.');
      } else {
        setError('Unable to analyze symptoms right now. Please use the search filters below.');
      }
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
    <div className="w-full max-w-3xl">
      <div className="brutalist-border p-6 sm:p-8 bg-white max-w-3xl relative shadow-[8px_8px_0px_0px_#cfe5fe] text-left">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-ui-xs font-bold uppercase tracking-wider text-primary-container font-swiss">
            Describe Your Symptoms
          </span>
          <ArrowRight className="w-4 h-4 text-primary-container" />
        </div>

        <form onSubmit={handleSearch}>
          <div className="relative">
            <textarea
              rows={4}
              value={symptoms}
              onChange={handleInputChange}
              placeholder="e.g. sharp lower back pain when bending, started 3 weeks ago..."
              className="w-full h-40 brutalist-border bg-cloud p-4 font-swiss text-ui-md focus:border-primary-container focus:ring-0 resize-none mb-6 text-obsidian border-obsidian outline-none placeholder-neutral-500/60"
              disabled={loading}
              onFocus={e => {
                e.target.closest('.brutalist-border')?.classList.add('active-red');
              }}
              onBlur={e => {
                e.target.closest('.brutalist-border')?.classList.remove('active-red');
              }}
            />
            {/* Length counter */}
            <span className={`absolute bottom-9 right-4 text-[10px] font-bold ${remainingChars < 50 ? 'text-accent' : 'text-neutral-500'}`}>
              {remainingChars}
            </span>
          </div>

          {/* Quick tips list / Suggestion chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['Back Pain', 'Knee Injury', 'Shoulder Tension', 'Post-Surgery Rehab'].map((tip) => (
              <button
                key={tip}
                type="button"
                onClick={() => {
                  if (!loading) {
                    setSymptoms(tip);
                    setError(null);
                  }
                }}
                className="px-4 py-2 brutalist-border text-ui-xs uppercase font-bold hover:bg-obsidian hover:text-white transition-colors duration-fast bg-white text-obsidian select-none cursor-pointer"
              >
                {tip}
              </button>
            ))}
          </div>

          <div className="flex">
            <button
              type="submit"
              disabled={loading || symptoms.trim().length < 5}
              className="w-full py-5 bg-primary-container text-white font-swiss text-ui-lg font-black uppercase flex items-center justify-center gap-4 hover:bg-primary transition-colors duration-fast group brutalist-border disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-standard" />
                  FIND MY SPECIALIZATION
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-accent/5 border-2 border-danger flex gap-3 text-left brutalist-border shadow-[4px_4px_0px_0px_#C0392B]">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <h5 className="text-ui-xs font-black text-danger uppercase tracking-wider">Triage Query Warning</h5>
              <p className="text-ui-sm text-neutral-900 font-medium mt-0.5">{error}</p>
              {(!isAuthenticated || user?.role !== 'patient') && (
                <Link
                  to="/login"
                  state={{ from: window.location.pathname }}
                  className="inline-block mt-2 text-ui-xs font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Sign in as a patient →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Small Legal Disclaimer */}
        <p className="mt-4 text-[10px] text-neutral-500 text-center leading-relaxed font-swiss font-semibold tracking-wider uppercase opacity-60">
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
