import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const footerLinks = [
    {
      title: 'NAVIGATE',
      links: [
        { label: 'Home', to: '/' },
        { label: 'Features', to: '/#features' },
        { label: 'Benefits', to: '/#benefits' },
        { label: 'Why Theralign', to: '/#how-it-works' },
        { label: 'Testimonials', to: '/#testimonials' },
        { label: 'Pricing', to: '/#pricing' },
        { label: 'Contact', to: '/help' },
      ],
    },
    {
      title: 'PLATFORM',
      links: [
        { label: 'FIND DOCTORS', to: '/doctors' },
        { label: 'SPECIALIZATIONS', to: '/#specializations' },
        { label: 'JOIN AS PHYSIO', to: '/register' },
        { label: 'CLINICAL STANDARDS', to: '/standards' },
        { label: 'PRACTICE MANAGEMENT', to: '/management' },
        { label: 'HELP CENTER', to: '/help' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Refund Policy', to: '/refund' },
        { label: 'Medical Disclaimer', to: '/disclaimer' },
      ],
    },
  ];

  return (
    <footer className="swiss-footer">
      <div className={isLandingPage ? "swiss-footer-inner swiss-footer-inner--landing" : "swiss-footer-inner"}>
        <div className="swiss-footer-top">
          {/* Brand Column */}
          <div className="swiss-footer-brand">
            <span className="swiss-footer-logo">THERALIGN</span>
            <p className="swiss-footer-tagline">
              India&apos;s premier verified physiotherapy marketplace. Connect with clinical specialists.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section, index) => (
            <div key={index} className="swiss-footer-col">
              <h4 className="swiss-footer-col-title">{section.title}</h4>
              <ul className="swiss-footer-link-list">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.to} className="swiss-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="swiss-footer-bottom">
          <p className="swiss-footer-copy">
            &copy; {currentYear} Theralign Inc. All rights reserved.
          </p>
          <p className="swiss-footer-version">SYSTEM D1.2</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
