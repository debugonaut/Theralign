import React from 'react';
import HeroSliderSection from '../../components/landing/HeroSliderSection';
import HeroSection from '../../components/landing/HeroSection';
import TrustBar from '../../components/landing/TrustBar';
import SpecializationsSection from '../../components/landing/SpecializationsSection';
import FeaturesZigzagSection from '../../components/landing/FeaturesZigzagSection';
import BenefitsGridSection from '../../components/landing/BenefitsGridSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FeaturedDoctorsSection from '../../components/landing/FeaturedDoctorsSection';
import StatsBar from '../../components/landing/StatsBar';
import PricingTiersSection from '../../components/landing/PricingTiersSection';
import WhoCanUseSection from '../../components/landing/WhoCanUseSection';
import PatientReviewsSection from '../../components/landing/PatientReviewsSection';
import VerificationExplanationSection from '../../components/landing/VerificationExplanationSection';
import CTABannerSection from '../../components/landing/CTABannerSection';

const LandingPage = () => {
  return (
    <main className="flex-1 bg-white">
      {/* A. Hero Slider — precedes the existing hero section */}
      <HeroSliderSection />

      {/* 01. Hero — unchanged */}
      <HeroSection />

      {/* 02. Trust Ticker — unchanged */}
      <TrustBar />

      {/* 03. Specializations Grid — unchanged */}
      <SpecializationsSection />

      {/* B. Features Zigzag — new, after specializations */}
      <FeaturesZigzagSection />

      {/* C. Benefits Grid — new, after features */}
      <BenefitsGridSection />

      {/* 04. How It Works — unchanged */}
      <HowItWorksSection />

      {/* 05. Featured Doctors — unchanged */}
      <FeaturedDoctorsSection />

      {/* 06. Platform Scale Metrics — unchanged */}
      <StatsBar />

      {/* D. Pricing Tiers — new, after stats */}
      <PricingTiersSection />

      {/* E. Who Can Use Theralign — new, after pricing */}
      <WhoCanUseSection />

      {/* F. Patient Reviews — redesigned circle cards (replaces section 07) */}
      <PatientReviewsSection />

      {/* 08. Verification Standards — unchanged */}
      <VerificationExplanationSection />

      {/* 09. CTA Banner — unchanged */}
      <CTABannerSection />
    </main>
  );
};

export default LandingPage;
