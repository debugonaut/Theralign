import React from 'react';
import HeroSection from '../../components/landing/HeroSection';
import StatsBar from '../../components/landing/StatsBar';
import SpecializationsSection from '../../components/landing/SpecializationsSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FeaturedDoctorsSection from '../../components/landing/FeaturedDoctorsSection';
import CTABannerSection from '../../components/landing/CTABannerSection';

const LandingPage = () => {
  React.useEffect(() => {
    document.title = 'PhysioConnect — Find Your Physiotherapist';
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroSection />
      <StatsBar />
      <SpecializationsSection />
      <HowItWorksSection />
      <FeaturedDoctorsSection />
      <CTABannerSection />
    </div>
  );
};

export default LandingPage;
