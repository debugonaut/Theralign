import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CTABannerSection = () => {
  return (
    <section className="w-full bg-swiss-black py-24 border-y-2 border-swiss-black">
      <div className="max-w-[1440px] mx-auto px-6 w-full text-center flex flex-col items-center">
        
        <h2 className="text-[48px] sm:text-[64px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-swiss-white font-swiss mb-6 max-w-[800px]">
          READY TO FEEL BETTER?
        </h2>
        
        <p className="text-[16px] lg:text-[18px] text-swiss-gray-400 font-medium leading-[1.6] max-w-[600px] mb-12">
          Connect with verified experts, describe symptoms for custom matches, and book slots instantly with secure payments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="accent" size="lg" className="w-full border-swiss-red">
              GET STARTED
            </Button>
          </Link>
          <Link to="/doctors" className="w-full sm:w-auto">
            {/* White border ghost button */}
            <Button variant="ghost" size="lg" className="w-full !text-swiss-white !border-swiss-white hover:!bg-swiss-white hover:!text-swiss-black">
              FIND A DOCTOR
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CTABannerSection;
