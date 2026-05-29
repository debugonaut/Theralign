import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info (5/12 width on desktop) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-extrabold text-xl tracking-tight">Theralign</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Connecting patients with verified physiotherapy specialists across India. Book online, pay securely, and accelerate your recovery.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links (2/12 width on desktop) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/doctors" className="hover:text-primary transition-colors">Find Doctors</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-primary transition-colors">All Specialities</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Doctors (2/12 width on desktop) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">For Doctors</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">Doctor Login</Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Pricing</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (3/12 width on desktop) */}
          <div className="lg:col-span-3 text-left space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <a href="#" className="hover:text-primary transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Frequently Asked Questions</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500">
            © {new Date().getFullYear()} Theralign. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-bold text-slate-500">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
