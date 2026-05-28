import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Activity, Award, ChevronRight, Star, HeartHandshake } from 'lucide-react';
import SymptomSearchBox from '../../components/ai/SymptomSearchBox';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleSpecializationFound = (specialization) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`);
  };

  const specialities = [
    { name: 'Sports Injury Rehab', desc: 'Accelerate recovery for athletes and physical fitness enthusiasts.', icon: '⚽' },
    { name: 'Orthopedic Physiotherapy', desc: 'Advanced care for joint arthrosis, fractures, back, and neck spine issues.', icon: '🦴' },
    { name: 'Neurological Rehabilitation', desc: 'Expert neuroplasticity recovery for stroke, Parkinson’s, and sclerosis.', icon: '🧠' },
    { name: 'Geriatric Care', desc: 'Dedicated mobility, arthritis, and stable balance treatments for senior patients.', icon: '👵' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white">
      
      {/* ─── Hero Presentation & Grid ────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-primary tracking-wide uppercase select-none animate-pulse">
            <Sparkles className="w-3.5 h-3.5 fill-primary" /> Advanced Clinical Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1] text-center">
            Physiotherapy Reimagined with <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Precision</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
            Skip the guesswork. Describe your physical symptoms to discover the ideal specialization, and book transaction-safe consultations with highly-rated certified doctors instantly.
          </p>

          {/* Symptom Search Box Integration */}
          <div className="w-full mt-6">
            <SymptomSearchBox onSpecializationFound={handleSpecializationFound} />
          </div>

          {/* Standard search redirect CTA */}
          <button
            onClick={() => navigate('/doctors')}
            className="mt-6 text-xs text-slate-500 hover:text-slate-300 font-bold tracking-wider uppercase inline-flex items-center gap-1 hover:gap-2 transition-all select-none cursor-pointer"
          >
            Or browse all certified physiotherapists manual filters <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ─── Metric Indicators Row ────────────────────────────────────────────── */}
      <section className="bg-slate-900/60 border-y border-slate-900 py-10 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '15+', label: 'Verified Specialties', icon: Activity },
            { value: '12+', label: 'Clinic Partners', icon: ShieldCheck },
            { value: '4.8★', label: 'Average Ratings', icon: Star },
            { value: '10k+', label: 'Successful Sessions', icon: HeartHandshake },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</span>
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Specialty Cards Presentation ────────────────────────────────────── */}
      <section className="py-24 px-6 relative z-10 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Clinical Specialty Focus Areas
        </h2>
        <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto mb-12">
          From sports performance rehabilitation to neuroplasticity gait training, find qualified doctors tailored for your physical recovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialities.map((spec, index) => (
            <div
              key={index}
              onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(spec.name)}`)}
              className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 text-left hover:bg-slate-900 transition-all duration-300 shadow-sm cursor-pointer select-none group flex flex-col justify-between h-48"
            >
              <div>
                <span className="text-3xl mb-3 block">{spec.icon}</span>
                <h3 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
                  {spec.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed truncate-2-lines">
                  {spec.desc}
                </p>
              </div>
              <span className="text-[10px] text-primary group-hover:text-white font-extrabold uppercase tracking-wide inline-flex items-center gap-1 transition-all mt-4 self-start">
                Explore focus <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
