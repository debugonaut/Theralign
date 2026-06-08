import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'PLATFORM',
      links: [
        { label: 'FIND DOCTORS', to: '/doctors' },
        { label: 'HOW IT WORKS', to: '/#how-it-works' },
        { label: 'SPECIALIZATIONS', to: '/#specializations' },
        { label: 'PRICING', to: '/pricing' },
      ],
    },
    {
      title: 'FOR CLINICIANS',
      links: [
        { label: 'JOIN NETWORK', to: '/register' },
        { label: 'CLINICAL STANDARDS', to: '/standards' },
        { label: 'PRACTICE MANAGEMENT', to: '/management' },
        { label: 'HELP CENTER', to: '/help' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'PRIVACY POLICY', to: '/privacy' },
        { label: 'TERMS OF SERVICE', to: '/terms' },
        { label: 'MEDICAL DISCLAIMER', to: '/disclaimer' },
      ],
    },
  ];

  const SwissNavLink = ({ to, label }) => (
    <Link to={to} className="swiss-nav-link text-[12px] font-semibold text-neutral-700 normal-case !text-[12px] !font-medium hover:text-primary transition-colors">
      {label}
    </Link>
  );

  return (
    <footer className="w-full bg-neutral-100 border-t-2 border-neutral-900 pt-6 pb-6">
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 flex flex-col items-start gap-4">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-neutral-900">
              THERALIGN
            </span>
            <p className="text-[12px] text-neutral-700 font-medium">
              India's premier verified physiotherapy marketplace. Connect with clinical specialists.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1 flex flex-col gap-4">
              <h4 className="font-bold text-[12px] text-neutral-900 uppercase tracking-[0.08em] mb-2 font-swiss">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <SwissNavLink to={link.to} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t-2 border-neutral-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-neutral-500 font-medium">
            &copy; {currentYear} Theralign Inc. All rights reserved.
          </p>
          <p className="text-[12px] text-neutral-500 font-medium uppercase tracking-[0.08em]">
            SYSTEM D1.2
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
