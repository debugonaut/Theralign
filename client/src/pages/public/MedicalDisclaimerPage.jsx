import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const MedicalDisclaimerPage = () => {
  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-swiss-black bg-swiss-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="07."
        title="MEDICAL DISCLAIMER"
        subtitle="SAFETY GUIDELINES, EMERGENCIES PROTOCOLS, AND PLATFORM VISIBILITIES."
      />

      {/* High-urgency warning card (heavy 4px border) */}
      <Card 
        variant="highlight" 
        className="p-8 bg-swiss-white flex flex-col gap-4 border-swiss-black hover:border-swiss-red"
      >
        <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block">
          CRITICAL SAFETY WARNING
        </span>
        <h2 className="text-display-xs font-black uppercase text-swiss-black tracking-tight leading-none">
          NOT A CLINICAL EMERGENCY GATEWAY
        </h2>
        <div className="h-[2px] bg-swiss-black w-full my-2" />
        <p className="text-ui-lg text-swiss-black font-semibold leading-relaxed uppercase">
          THERALIGN IS AN ADMINISTRATIVE SEARCH MARKETPLACE DIRECTORY. WE DO NOT PROVIDE EMERGENCY HEALTH RESPONSE SERVICES. IF YOU EXPENSE AN EMERGENCY OR SUDDEN SEVERE PAIN, IMMEDIATELY CALL 108 OR PROCEED TO THE NEAREST TRAUMA FACILITY.
        </p>
      </Card>

      {/* Organized sub-clauses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-2 border-l-4 border-swiss-black pl-4">
            <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block">
              01. PRACTICE RESPONSIBILITIES
            </span>
            <p className="text-xs text-swiss-gray-650 font-medium leading-relaxed">
              All clinical diagnostic decisions, prescription exercises, and treatment actions are delivered solely by the registered physiotherapist, not the platform software. THERALIGN assumes no liability for clinical advice given during consultations.
            </p>
          </div>

          <div className="space-y-2 border-l-4 border-swiss-black pl-4">
            <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block">
              02. SEARCH DIRECTORY LIMITATIONS
            </span>
            <p className="text-xs text-swiss-gray-650 font-medium leading-relaxed">
              Practitioner profile bios, qualifications, and specialties listings represent individual credentials submitted during onboarding audits. Patients must verify therapist suitability during initial consultation schedules.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="space-y-2 border-l-4 border-swiss-black pl-4">
            <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block">
              03. CREDENTIAL VETTING SCOPE
            </span>
            <p className="text-xs text-swiss-gray-650 font-medium leading-relaxed">
              Manual checks verify professional diplomas and state practice license certificates validity with official boards. While our vetting is extremely high-integrity, patients are encouraged to doublecheck clinician status for custom cases.
            </p>
          </div>

          <div className="space-y-2 border-l-4 border-swiss-black pl-4">
            <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block">
              04. NO PATIENT-DOCTOR Platform RELATION
            </span>
            <p className="text-xs text-swiss-gray-650 font-medium leading-relaxed">
              Booking appointments or navigating the website does not create a patient-doctor relationship between you and THERALIGN. The relationship exists solely between you and the therapist you book.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MedicalDisclaimerPage;
