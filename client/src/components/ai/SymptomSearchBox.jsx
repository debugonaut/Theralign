import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { interpretSymptomsAPI } from '../../api/ai.api';
import AIRecommendationCard from './AIRecommendationCard';
import useAuthStore from '../../store/authStore';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative"
        style={{
          background: '#FFF8F5',
          border: '2px solid #000000',
          boxShadow: '4px 4px 0px 0px #000000',
          padding: '20px 24px',
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C0392B',
            marginBottom: '10px',
            textAlign: 'left',
          }}
        >
          Describe Your Symptoms →
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={symptoms}
              onChange={handleInputChange}
              placeholder="e.g. sharp lower back pain when bending, started 3 weeks ago..."
              style={{
                width: '100%',
                height: '80px',
                resize: 'none',
                border: '2px solid #000000',
                borderRadius: 0,
                padding: '10px 12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#FFFFFF',
                lineHeight: 1.5,
                color: '#000000',
              }}
              disabled={loading}
              onFocus={e => {
                e.target.style.borderWidth = '3px';
                e.target.style.padding = '9px 11px';
              }}
              onBlur={e => {
                e.target.style.borderWidth = '2px';
                e.target.style.padding = '10px 12px';
              }}
            />
            {/* Length counter */}
            <span className={`absolute bottom-3 right-4 text-[10px] font-bold ${remainingChars < 50 ? 'text-accent' : 'text-neutral-500'}`}>
              {remainingChars}
            </span>
          </div>

          {/* Quick tips list / Suggestion chips */}
          <div className="flex flex-wrap gap-2 py-1 justify-start">
            {['Back pain', 'Knee injury', 'Shoulder tension', 'Post-surgery rehab'].map((tip) => (
              <button
                key={tip}
                type="button"
                onClick={() => {
                  if (!loading) {
                    setSymptoms(tip);
                    setError(null);
                  }
                }}
                className="text-xs transition-all duration-fast select-none cursor-pointer"
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  border: '1.5px solid #000000',
                  borderRadius: 0,
                  background: '#FFFFFF',
                  color: '#000000',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  e.target.style.background = '#000000';
                  e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={e => {
                  e.target.style.background = '#FFFFFF';
                  e.target.style.color = '#000000';
                }}
              >
                {tip}
              </button>
            ))}
          </div>

          <div className="flex pt-2">
            <button
              type="submit"
              disabled={loading || symptoms.trim().length < 5}
              className="flex-1 bg-neutral-900 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 px-6 rounded-none font-bold uppercase tracking-widest text-[12px] transition-all duration-fast inline-flex items-center justify-center gap-2 select-none cursor-pointer border border-transparent"
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
          <div className="mt-4 p-4 bg-accent/5 border border-accent flex gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h5 className="text-[11px] font-black text-accent uppercase tracking-wider">Triage Query Warning</h5>
              <p className="text-[12px] text-accent font-medium mt-0.5">{error}</p>
              {(!isAuthenticated || user?.role !== 'patient') && (
                <Link
                  to="/login"
                  state={{ from: window.location.pathname }}
                  className="inline-block mt-2 text-[11px] font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Sign in as a patient →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Small Legal Disclaimer */}
        <p className="text-[10px] text-neutral-500 mt-4 text-center leading-relaxed font-swiss">
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
