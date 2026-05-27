import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-lg font-bold mb-3">Theralign</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Modern physiotherapist discovery and appointment booking platform. 
              Connecting patients with verified physiotherapy professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/doctors" className="text-sm text-slate-300 hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/register" className="text-sm text-slate-300 hover:text-white transition-colors">For Patients</Link></li>
              <li><Link to="/register" className="text-sm text-slate-300 hover:text-white transition-colors">For Physiotherapists</Link></li>
            </ul>
          </div>

          {/* Auth Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Account</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Log In</Link></li>
              <li><Link to="/register" className="text-sm text-slate-300 hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 flex items-center justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Theralign. All rights reserved.</p>
          <p className="text-xs text-slate-500">Built with care for physiotherapy professionals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
