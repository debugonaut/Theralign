import React from 'react';
import { Link } from 'react-router-dom';

const PATIENT_FREE_FEATURES = [
  'Search and browse verified doctors',
  'View doctor profiles and ratings',
  'AI symptom search (3 queries/month)',
  'Book appointments online',
  'View session records and prescriptions',
  'Basic appointment history',
];

const PRO_FEATURES = [
  'Everything in Patient Free',
  'Unlimited AI symptom queries',
  'Priority appointment booking',
  'Full care timeline and history',
  'Exercise plan video demonstrations',
  'Email appointment reminders',
  'Downloadable session records PDF',
];

const PRACTITIONER_FEATURES = [
  'Complete practitioner dashboard',
  'Unlimited appointment management',
  'Visual exercise prescription library',
  'Session record creation and sharing',
  'Patient care timeline management',
  'Earnings dashboard and analytics',
  'Verified badge and profile listing',
  'Priority support',
];

const FeatureList = ({ features, variant }) => (
  <ul className={`pricing-feature-list pricing-feature-list--${variant}`}>
    {features.map((feature, idx) => (
      <li key={idx} className="pricing-feature-item">
        <span className="pricing-arrow" aria-hidden="true">→</span>
        {feature}
      </li>
    ))}
  </ul>
);

const PricingTiersSection = () => {
  return (
    <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
      {/* Section header */}
      <div className="pricing-header">
        <span className="swiss-section-label">05. TRANSPARENT PRICING</span>
        <h2 id="pricing-title" className="pricing-title">
          STRAIGHTFORWARD PLANS. NO SURPRISES.
        </h2>
      </div>

      {/* Pricing boxes */}
      <div className="pricing-grid">

        {/* Plan 1 — Patient Free */}
        <div className="pricing-box pricing-box--light">
          <p className="pricing-plan-label">PATIENT</p>
          <div className="pricing-price-row">
            <span className="pricing-price">₹0</span>
            <span className="pricing-period">/ MONTH</span>
          </div>
          <div className="pricing-divider pricing-divider--dark" />
          <FeatureList features={PATIENT_FREE_FEATURES} variant="light" />
          <Link to="/register" className="pricing-cta pricing-cta--light">
            GET STARTED FREE →
          </Link>
        </div>

        {/* Plan 2 — Pro (center, inverted) */}
        <div className="pricing-box pricing-box--dark">
          <div className="pricing-popular-badge">MOST POPULAR</div>
          <p className="pricing-plan-label">PRO PATIENT</p>
          <div className="pricing-price-row">
            <span className="pricing-price">₹299</span>
            <span className="pricing-period pricing-period--muted">/ MONTH</span>
          </div>
          <div className="pricing-divider pricing-divider--light" />
          <FeatureList features={PRO_FEATURES} variant="dark" />
          <Link to="/register" className="pricing-cta pricing-cta--accent">
            START PRO →
          </Link>
        </div>

        {/* Plan 3 — Practitioner */}
        <div className="pricing-box pricing-box--light">
          <p className="pricing-plan-label">PRACTITIONER</p>
          <div className="pricing-price-row">
            <span className="pricing-price">₹999</span>
            <span className="pricing-period">/ MONTH</span>
          </div>
          <div className="pricing-divider pricing-divider--dark" />
          <FeatureList features={PRACTITIONER_FEATURES} variant="light" />
          <Link to="/register" className="pricing-cta pricing-cta--light">
            JOIN AS PRACTITIONER →
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="pricing-footer-note">
        All plans include Razorpay-secured payments and ISO-compliant clinical data storage.
        No lock-in. Cancel anytime.
      </p>
    </section>
  );
};

export default PricingTiersSection;
