import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
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
    <div className="min-h-screen flex flex-col bg-swiss-white">
      <Navbar />
      
      <main className="flex-1">
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

      <Footer />
    </div>
  );
};

export default LandingPage;
