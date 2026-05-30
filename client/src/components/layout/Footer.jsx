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
    <Link to={to} className="swiss-nav-link swiss-label !text-[12px] !font-medium">
      <span className="nav-text-default text-swiss-gray-600">{label}</span>
      <span className="nav-text-hover">{label}</span>
    </Link>
  );

  return (
    <footer className="w-full bg-swiss-gray-100 border-t-2 border-swiss-black pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 flex flex-col items-start gap-4">
            <span className="font-black text-2xl tracking-tighter uppercase font-swiss text-swiss-black">
              THERALIGN
            </span>
            <p className="text-[12px] text-swiss-gray-600 font-medium">
              India's premier verified physiotherapy marketplace. Connect with clinical specialists.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section, index) => (
            <div key={index} className="col-span-1 flex flex-col gap-4">
              <h4 className="font-bold text-[12px] text-swiss-black uppercase tracking-[0.08em] mb-2 font-swiss">
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
        <div className="border-t-2 border-swiss-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-swiss-gray-400 font-medium">
            &copy; {currentYear} Theralign Inc. All rights reserved.
          </p>
          <p className="text-[12px] text-swiss-gray-400 font-medium uppercase tracking-[0.08em]">
            SYSTEM D1.2
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
