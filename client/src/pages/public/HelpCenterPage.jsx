import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card 
      onClick={() => setIsOpen(!isOpen)}
      className="border-2 border-swiss-black rounded-none shadow-none p-5 text-left bg-swiss-white hover:bg-swiss-gray-50 transition-all select-none cursor-pointer flex flex-col gap-3"
    >
      <div className="flex justify-between items-center w-full">
        <h4 className="text-xs font-black uppercase text-swiss-black tracking-wide pr-6">
          {question}
        </h4>
        <span className="text-swiss-black shrink-0">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {isOpen && (
        <div className="border-t border-swiss-gray-250 pt-4 text-xs text-swiss-gray-650 font-medium leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </Card>
  );
};

const HelpCenterPage = () => {
  const patientFaqs = [
    {
      q: 'HOW DO I SCHEDULE AN APPOINTMENT?',
      a: 'Navigate to "Find Doctors" to search clinicians by name, specialization, or clinic location. Click on a doctor’s profile to view their available hours and consultations fee, select a valid time slot, and submit booking details. Payment is securely executed online via Razorpay.'
    },
    {
      q: 'WHAT IS YOUR SESSION CANCELLATION POLICY?',
      a: 'Appointments can be fully cancelled up to 24 hours prior to the scheduled start time. Cancellations executed within the 24-hour window are subject to clinician verification. Go to your Patient Portal dashboard to manage or cancel booked slots.'
    },
    {
      q: 'HOW DO I FILE A CLINICAL REFUND REQUEST?',
      a: 'If a session does not occur or is cancelled by a practitioner, refunds process automatically within 5 to 7 business days to your original payment source. For disputes, contact platform operations via support@theralign.in.'
    }
  ];

  const clinicianFaqs = [
    {
      q: 'HOW LONG DOES PENDING APPLICATION VERIFICATION TAKE?',
      a: 'Platform operators manually verify credential documents with state physical therapy registries. Vetting audits are typically signed off within 24 to 48 hours. You will receive an email notice when verified.'
    },
    {
      q: 'HOW ARE Platform COMMISSION FEES CALCULATED?',
      a: 'THERALIGN charges a flat 10% commission fee only from successfully completed appointments. There are no startup setup costs or software fees. Net earnings (90%) are directly sweep-payout reconciled.'
    },
    {
      q: 'HOW DO I RESET MY CLINICAL AVAILABILITY?',
      a: 'Log into your Practitioner Portal dashboard and navigate to "Availability". You can customize, overwrite, and save your daily hours and hourly scheduling block configurations dynamically.'
    }
  ];

  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-swiss-black bg-swiss-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="04."
        title="HELP CENTER & FAQ"
        subtitle="ANSWERS TO GENERAL QUESTIONS CONCERNING BOOKINGS, PAYOUT RECONCILIATIONS, AND VETTING."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Patient FAQ Accordion */}
        <div className="space-y-6">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
            PATIENT INQUIRY FAQS
          </span>
          <div className="space-y-4">
            {patientFaqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* Right Column: Clinician FAQ Accordion */}
        <div className="space-y-6">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
            CLINICIAN WORKSPACE FAQS
          </span>
          <div className="space-y-4">
            {clinicianFaqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenterPage;
