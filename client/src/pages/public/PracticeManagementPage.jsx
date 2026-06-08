import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const PracticeManagementPage = () => {
  const tools = [
    {
      prefix: '01.',
      title: 'DYNAMIC SESSION SCHEDULER',
      desc: 'Take complete control over your schedule. Configure specific available hours, recurring slots, and vacation blocks. Bookings occur automatically in real-time, locking slots instantly to prevent double-booking issues.'
    },
    {
      prefix: '02.',
      title: 'AUTOMATED REVENUE LEDGERS',
      desc: 'Verify session invoices and payouts dynamically. Direct bank payout sweeps process automatically upon successfully completed consultations. Direct tabular visibility makes auditing simple.'
    },
    {
      prefix: '03.',
      title: 'INTELLIGENT PROFILE COMPILING',
      desc: 'Build clinical trust easily. Display your medical specializations, clinic facility location map keys, consultation fees, and biographical records in a clean premium Swiss design.'
    },
    {
      prefix: '04.',
      title: 'DIAGNOSTIC SUMMARY CACHES',
      desc: 'Leverage our automatic AI summarization utilities. The platform lazily generates professional clinical profile summaries from your bio details, helping prospective patients understand your specializations.'
    }
  ];

  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-neutral-900 bg-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="03."
        title="PRACTICE MANAGEMENT"
        subtitle="COMPLETE SCHEDULING, INVOICING, AND CLINICAL PROFILE TOOLING FOR PHYSIOTHERAPISTS."
      />

      {/* Description */}
      <div className="max-w-prose text-ui-lg text-swiss-gray-650 font-medium leading-relaxed space-y-4">
        <p>
          **THERALIGN** is more than just a discovery platform — it is a complete practitioner workspace. We eliminate administrative friction so you can focus entirely on clinical excellence and patient recovery.
        </p>
        <p>
          Our secure practice management system runs entirely in the browser, providing a modern suite of scheduling, invoicing, and profiling utilities.
        </p>
      </div>

      {/* Grid listing features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((t) => (
          <Card 
            key={t.title} 
            className="border-2 border-neutral-900 p-8 bg-white flex flex-col gap-4 hover:border-neutral-900"
          >
            <div>
              <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                {t.prefix} OPERATIONAL FEATURE
              </span>
              <h3 className="text-ui-md font-black text-neutral-900 uppercase tracking-tight">
                {t.title}
              </h3>
              <div className="h-[1px] bg-neutral-200 w-full mt-3" />
            </div>

            <p className="text-xs text-swiss-gray-650 font-medium leading-relaxed">
              {t.desc}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PracticeManagementPage;
