import React from 'react';
import HeroSection from '../../components/landing/HeroSection';
import TrustBar from '../../components/landing/TrustBar';
import SpecializationsSection from '../../components/landing/SpecializationsSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FeaturedDoctorsSection from '../../components/landing/FeaturedDoctorsSection';
import StatsBar from '../../components/landing/StatsBar';
import PatientReviewsSection from '../../components/landing/PatientReviewsSection';
import VerificationExplanationSection from '../../components/landing/VerificationExplanationSection';
import CTABannerSection from '../../components/landing/CTABannerSection';

const LandingPage = () => {
  return (
    <main className="flex-1 bg-swiss-white">
      <HeroSection />
      <TrustBar />
      <SpecializationsSection />
      <HowItWorksSection />
      <FeaturedDoctorsSection />
      <StatsBar />
      <PatientReviewsSection />
      <VerificationExplanationSection />
      <CTABannerSection />
    </main>
  );
};

export default LandingPage;
