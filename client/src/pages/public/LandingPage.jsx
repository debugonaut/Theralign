import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSliderSection from '../../components/landing/HeroSliderSection';
import HeroSection from '../../components/landing/HeroSection';
import SpecializationsSection from '../../components/landing/SpecializationsSection';
import FeaturesZigzagSection from '../../components/landing/FeaturesZigzagSection';
import BenefitsGridSection from '../../components/landing/BenefitsGridSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import StatsBar from '../../components/landing/StatsBar';
import FeaturedDoctorsSection from '../../components/landing/FeaturedDoctorsSection';
import PatientReviewsSection from '../../components/landing/PatientReviewsSection';
import PricingTiersSection from '../../components/landing/PricingTiersSection';
import VerificationExplanationSection from '../../components/landing/VerificationExplanationSection';
import CTABannerSection from '../../components/landing/CTABannerSection';

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash]);

  return (
    <main className="flex-1 bg-white">
      {/* Hero Slider — full viewport, with CTA buttons */}
      <HeroSliderSection />

      {/* 01. AI Feature Box — AI doctor matching section (Item 2) */}
      <HeroSection />

      {/* 02. Areas of Care — Specializations grid */}
      <SpecializationsSection />

      {/* 03. Features / What Makes It Different */}
      <FeaturesZigzagSection />

      {/* 04. Why Theralign */}
      <BenefitsGridSection />

      {/* 05. How It Works */}
      <HowItWorksSection />

      {/* 06. Statistics / Platform Scale */}
      <StatsBar />

      {/* 07. Our Patients / Featured Doctors */}
      <FeaturedDoctorsSection />

      {/* 08. Patient Outcomes / Reviews */}
      <PatientReviewsSection />

      {/* 09. Pricing */}
      <PricingTiersSection />

      {/* 10. Clinical Verification */}
      <VerificationExplanationSection />

      {/* CTA Banner */}
      <CTABannerSection />
    </main>
  );
};

export default LandingPage;
