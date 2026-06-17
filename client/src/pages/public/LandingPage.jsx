
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
  return (
    <main className="flex-1 bg-white">
      {/* 01. AI Feature Box — AI doctor matching section (Item 2) */}
      <HeroSection />

      {/* Note: All other landing page sections are deactivated for this phase */}
    </main>
  );
};

export default LandingPage;
