import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CTABannerSection = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-card shadow-xl text-white overflow-hidden relative">
        {/* Glow detail */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
          {/* Patient CTA */}
          <div className="p-8 md:p-12 flex flex-col items-start gap-4">
            <span className="text-2xl font-bold tracking-tight">Ready to Feel Better?</span>
            <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-md">
              Connect with verified experts, describe symptoms for custom matches, and book slots instantly with secure payments.
            </p>
            <Link to="/doctors" className="mt-2">
              <Button variant="secondary" size="md" className="bg-white text-primary border-none hover:bg-slate-50">
                Find a Doctor →
              </Button>
            </Link>
          </div>

          {/* Doctor CTA */}
          <div className="p-8 md:p-12 flex flex-col items-start gap-4">
            <span className="text-2xl font-bold tracking-tight">Are You a Physiotherapist?</span>
            <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-md">
              Join India&apos;s premier physiotherapy platform to expand your clinical practice, manage availability, and securely handle earnings.
            </p>
            <Link to="/register" className="mt-2">
              <Button variant="secondary" size="md" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Register as a Doctor →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;
