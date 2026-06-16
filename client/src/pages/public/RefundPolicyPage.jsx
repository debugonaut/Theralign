import React from 'react';

const POLICY_SECTIONS = [
  {
    number: '01',
    title: 'BOOKING CANCELLATION',
    content: [
      'Cancellations made more than 24 hours before the appointment time are eligible for a full refund.',
      'Cancellations made between 12–24 hours before the appointment will receive a 50% refund.',
      'Cancellations made within 12 hours of the appointment time are non-refundable.',
      'No-shows (failure to attend without any prior cancellation) are strictly non-refundable.',
    ],
  },
  {
    number: '02',
    title: 'REFUND ELIGIBILITY',
    content: [
      'Refunds are only available for appointments booked through the Theralign platform.',
      'If a doctor cancels your appointment, you are entitled to a full refund or free rescheduling — whichever you prefer.',
      'Technical issues preventing access to a booked session are reviewed case-by-case and may be fully refunded upon investigation.',
      'Platform subscription fees (if applicable) are non-refundable after the 7-day trial window expires.',
    ],
  },
  {
    number: '03',
    title: 'REFUND PROCESS',
    content: [
      'Approved refunds are processed within 5–7 business days to the original payment method.',
      'To request a refund, contact our support team at support@theralign.in with your booking reference number.',
      'Our team will acknowledge your refund request within 24 business hours.',
      'Refunds are credited back to your original payment source — UPI, credit card, debit card, or net banking.',
    ],
  },
  {
    number: '04',
    title: 'NON-REFUNDABLE SITUATIONS',
    content: [
      'Completed sessions where you were satisfied with the consultation — no retroactive refunds.',
      'Sessions missed due to patient-side technical failure (device, internet, power outage).',
      'Services consumed through the platform such as exercise prescription library access.',
      'Refund requests submitted more than 7 days after the appointment date are not accepted.',
    ],
  },
  {
    number: '05',
    title: 'DISPUTE RESOLUTION',
    content: [
      'If you are dissatisfied with a refund decision, you may escalate the matter to disputes@theralign.in.',
      'Disputes are reviewed by a dedicated clinical and operations committee within 5 business days.',
      'Theralign reserves the right to make final decisions on all refund disputes.',
      'For regulatory escalations, matters may be referred to the relevant consumer protection authority.',
    ],
  },
];

const RefundPolicyPage = () => {
  return (
    <main className="refund-page">
      {/* ── Hero Header ──────────────────────────────── */}
      <section className="refund-hero">
        <div className="refund-hero-inner">
          <span className="swiss-section-label">LEGAL / REFUND POLICY</span>
          <h1 className="refund-hero-title">
            REFUND<br />
            <span className="refund-hero-accent">POLICY.</span>
          </h1>
          <p className="refund-hero-meta">
            Last updated: June 2026 &nbsp;·&nbsp; Version 1.2
          </p>
        </div>
        <div className="refund-hero-rule" />
      </section>

      {/* ── Intro ────────────────────────────────────── */}
      <section className="refund-intro-section">
        <div className="refund-intro-inner">
          <p className="refund-intro-text">
            Theralign is committed to fair, transparent, and prompt resolution of all refund
            requests. This policy applies to all appointments and transactions made through the
            Theralign platform. By completing a booking, you agree to the terms outlined below.
          </p>
          <div className="refund-intro-highlight">
            <span className="refund-intro-highlight-label">QUICK REFERENCE</span>
            <p className="refund-intro-highlight-text">
              24h+ before appointment = <strong>100% refund</strong> &nbsp;·&nbsp;
              12–24h before = <strong>50% refund</strong> &nbsp;·&nbsp;
              Under 12h = <strong>No refund</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Policy Sections ──────────────────────────── */}
      <section className="refund-content-section">
        <div className="refund-content-inner">
          {POLICY_SECTIONS.map((section) => (
            <div key={section.number} className="refund-policy-block">
              <div className="refund-policy-number">{section.number}</div>
              <div className="refund-policy-body">
                <h2 className="refund-policy-title">{section.title}</h2>
                <div className="refund-policy-rule" />
                <ul className="refund-policy-list">
                  {section.content.map((item, i) => (
                    <li key={i} className="refund-policy-item">
                      <span className="refund-policy-arrow">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact Strip ─────────────────────────────── */}
      <section className="refund-contact-section">
        <div className="refund-contact-inner">
          <div className="refund-contact-left">
            <span className="swiss-section-label">NEED HELP?</span>
            <h2 className="refund-contact-title">CONTACT OUR SUPPORT TEAM</h2>
          </div>
          <div className="refund-contact-right">
            <a href="mailto:support@theralign.in" className="refund-contact-email">
              support@theralign.in
            </a>
            <p className="refund-contact-hours">Mon–Sat, 9:00 AM – 6:00 PM IST</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicyPage;
