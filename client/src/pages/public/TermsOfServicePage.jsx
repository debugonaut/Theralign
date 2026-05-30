import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';

const TermsOfServicePage = () => {
  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-swiss-black bg-swiss-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="06."
        title="TERMS OF SERVICE"
        subtitle="PLATFORM TRANSACTION COMMITMENTS, BOOKING AGREEMENTS, AND SERVICE REGULATIONS."
      />

      {/* Prose Container */}
      <div className="max-w-prose text-ui-lg text-swiss-gray-650 font-medium leading-relaxed space-y-8">
        <p>
          Welcome to **THERALIGN**. These service regulations govern your access to and use of our administrative marketplace platform. By creating an account or booking consultations, you agree to follow these guidelines.
        </p>

        {/* Section 1 */}
        <div className="space-y-3">
          <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest block">
            01. SCHEDULING & BOOKINGS REGULATION
          </span>
          <p className="text-ui-md text-swiss-gray-650">
            Patients book consultation slots directly through active clinician schedules. A booking represents a binding commitment to attend the session at the specified hour. Clinicians are responsible for maintaining accurate hourly calendars.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest block">
            02. CANCELLATIONS & REFUND PARAMETERS
          </span>
          <p className="text-ui-md text-swiss-gray-650">
            Appointments may be cancelled or rescheduled up to 24 hours prior to the session start time without incurring penalties. Cancellations occurring inside the 24-hour window are subject to clinician verification and platform audit parameters.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest block">
            03. REVENUE SPLITS & COMMISSION RULES
          </span>
          <p className="text-ui-md text-swiss-gray-650">
            THERALIGN deducts a flat 10% commission fee only from successfully completed consultations. The remaining 90% is swept directly to the clinician's linked bank account upon session verification. Dispute processing is handled by platform support channels.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest block">
            04. PROFESSIONAL INTEGRITY CHARTER
          </span>
          <p className="text-ui-md text-swiss-gray-650">
            Practitioners must upload authentic, valid medical degrees and practice licenses. Any upload of fraudulent credentials, false clinic addresses, or deceptive qualifications will result in immediate profile suspension and legal registry notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
