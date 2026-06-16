import React from 'react';
import { useNavigate } from 'react-router-dom';
import SymptomSearchBox from '../ai/SymptomSearchBox';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  return (
    <section
      className="ai-section"
      id="ai-matching"
      aria-labelledby="ai-section-title"
    >
      <div className="ai-section-inner">
        {/* Left — Text & AI box */}
        <div className="ai-section-left">
          <span className="swiss-section-label">01. AI DOCTOR MATCHING</span>
          <h2 id="ai-section-title" className="ai-section-heading">
            DESCRIBE YOUR PAIN.<br />
            <span className="ai-section-heading-accent">WE FIND YOUR SPECIALIST.</span>
          </h2>
          <p className="ai-section-subtext">
            Our AI analyses your symptoms, condition history, and location to
            match you with the right verified physiotherapist — in seconds.
            No referral. No waiting list. Just clinical precision.
          </p>
          <div className="ai-section-search-wrap">
            <SymptomSearchBox onSpecializationFound={handleSpecializationFound} />
          </div>
        </div>

        {/* Right — Feature callouts */}
        <div className="ai-section-right">
          <div className="ai-feature-card">
            <div className="ai-feature-icon">⚡</div>
            <div>
              <p className="ai-feature-title">INSTANT MATCHING</p>
              <p className="ai-feature-desc">Describe symptoms in plain language — get matched to a specialist in under 10 seconds.</p>
            </div>
          </div>
          <div className="ai-feature-card">
            <div className="ai-feature-icon">🎯</div>
            <div>
              <p className="ai-feature-title">CONDITION-SPECIFIC</p>
              <p className="ai-feature-desc">Trained on 15+ physiotherapy specializations for accurate, relevant results every time.</p>
            </div>
          </div>
          <div className="ai-feature-card">
            <div className="ai-feature-icon">✅</div>
            <div>
              <p className="ai-feature-title">VERIFIED RESULTS ONLY</p>
              <p className="ai-feature-desc">Every matched doctor is clinically verified. No unvetted listings. Ever.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
