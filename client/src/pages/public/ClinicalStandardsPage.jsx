import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const ClinicalStandardsPage = () => {
  const standards = [
    {
      prefix: '01.',
      title: 'MANUAL CREDENTIALS AUDITING',
      desc: 'Platform registration is not immediate or automated. Platforms operators manually inspect practice degrees, clinical qualifications, and state physical therapy registration records with official medical registries before onboarding clinicians.',
      items: [
        'Mandatory submission of medical degrees.',
        'Direct practice license validity verifications.',
        'Manual clinic address mapping checks.'
      ]
    },
    {
      prefix: '02.',
      title: 'CONTINUOUS CLINICAL MONITORING',
      desc: 'Onboarded practitioners are continuously monitored to maintain platform medical integrity. Session cancellation frequencies, average patient review values, and prompt clinical feedback queues are evaluated dynamically.',
      items: [
        'Average rating threshold audits (4.0 minimum).',
        'cancellation frequency check parameters.',
        'Review text pattern scanning verification.'
      ]
    },
    {
      prefix: '03.',
      title: 'SAFETY & COMPLIANCE MANDATES',
      desc: 'All clinicians must maintain clean practice spaces and follow professional physical therapy rules. Emergency notices and explicit clinical safety warnings are integrated directly into public profiles.',
      items: [
        'Pristine sanitary facility checklists.',
        'Patient data compliance (HIPAA guidelines).',
        'Strict diagnostic disclaimer protocols.'
      ]
    }
  ];

  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-neutral-900 bg-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="02."
        title="CLINICAL STANDARDS"
        subtitle="VERIFIED PROFESSIONAL QUALIFICATIONS. HIGH-INTEGRITY QUALITY ASSURANCE INDEX."
      />

      {/* Description */}
      <div className="max-w-prose text-ui-lg text-swiss-gray-650 font-medium leading-relaxed space-y-4">
        <p>
          At **THERALIGN**, clinical safety is our highest operational priority. We believe that discovering physical therapy online should be as safe and auditable as scheduling an appointment with an institutional hospital.
        </p>
        <p>
          Our strict standards define how clinicians are vetted, monitored, and maintained, ensuring that every booking connects patients with verified, high-performing physiotherapists.
        </p>
      </div>

      {/* Grid listing requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {standards.map((s) => (
          <Card 
            key={s.title} 
            className="border-2 border-neutral-900 p-8 bg-white flex flex-col gap-6"
          >
            <div>
              <span className="text-sm font-semibold text-accent uppercase tracking-widest block mb-2">
                {s.prefix} STANDARD PILLAR
              </span>
              <h3 className="text-ui-md font-medium text-neutral-900 uppercase tracking-tight leading-snug">
                {s.title}
              </h3>
              <div className="h-[1px] bg-neutral-200 w-full mt-4" />
            </div>

            <p className="text-sm text-swiss-gray-650 font-medium leading-relaxed flex-1">
              {s.desc}
            </p>

            <div className="border border-neutral-900 p-4 bg-neutral-50 space-y-2">
              <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest block pb-1 border-b">
                AUDIT PARAMETERS
              </span>
              <ul className="text-sm font-medium uppercase text-neutral-900 tracking-wider space-y-1.5 list-disc list-inside">
                {s.items.map((item, idx) => (
                  <li key={idx} className="leading-tight">{item}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClinicalStandardsPage;
