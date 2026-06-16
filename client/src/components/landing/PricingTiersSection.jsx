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

const FeatureList = ({ features, dark }) => (
  <ul className={`pt-feature-list${dark ? ' pt-feature-list--dark' : ''}`}>
    {features.map((feature, idx) => (
      <li key={idx} className="pt-feature-item">
        <span className="pt-feature-arrow" aria-hidden="true">→</span>
        {feature}
      </li>
    ))}
  </ul>
);

const PricingTiersSection = () => {
  return (
    <section className="pt-section" id="pricing" aria-labelledby="pt-title">
      {/* Header */}
      <div className="pt-header">
        <span className="swiss-section-label">09. TRANSPARENT PRICING</span>
        <h2 id="pt-title" className="pt-title">
          CHOOSE YOUR PLAN
        </h2>
        <p className="pt-subtitle">
          Simple, transparent pricing for patients and practitioners alike.
          Empower your healthcare journey with professional tools.
        </p>
      </div>

      {/* Cards grid */}
      <div className="pt-grid">

        {/* Plan 1 — Patient Free */}
        <div className="pt-card pt-card--light">
          <p className="pt-plan-label">PATIENT</p>
          <div className="pt-price-row">
            <span className="pt-price">₹0</span>
            <span className="pt-period">/ MONTH</span>
          </div>
          <div className="pt-divider" />
          <FeatureList features={PATIENT_FREE_FEATURES} dark={false} />
          <Link to="/register" className="pt-cta pt-cta--outline">
            GET STARTED FREE →
          </Link>
        </div>

        {/* Plan 2 — Pro (elevated dark center) */}
        <div className="pt-card pt-card--dark">
          <div className="pt-popular-badge">MOST POPULAR</div>
          <p className="pt-plan-label pt-plan-label--muted">PRO PATIENT</p>
          <div className="pt-price-row">
            <span className="pt-price pt-price--white">₹299</span>
            <span className="pt-period pt-period--muted">/ MONTH</span>
          </div>
          <div className="pt-divider pt-divider--light" />
          <FeatureList features={PRO_FEATURES} dark={true} />
          <Link to="/register" className="pt-cta pt-cta--accent">
            START PRO →
          </Link>
        </div>

        {/* Plan 3 — Practitioner */}
        <div className="pt-card pt-card--light">
          <p className="pt-plan-label">PRACTITIONER</p>
          <div className="pt-price-row">
            <span className="pt-price">₹999</span>
            <span className="pt-period">/ MONTH</span>
          </div>
          <div className="pt-divider" />
          <FeatureList features={PRACTITIONER_FEATURES} dark={false} />
          <Link to="/register" className="pt-cta pt-cta--outline">
            JOIN AS PRACTITIONER →
          </Link>
        </div>

      </div>

      {/* Footer note */}
      <p className="pt-footer-note">
        All plans include Razorpay-secured payments and ISO-compliant clinical data storage.
        No lock-in. Cancel anytime.
      </p>
    </section>
  );
};

export default PricingTiersSection;
