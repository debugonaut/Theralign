import React from 'react';
import { Link } from 'react-router-dom';

const SpecializationsSection = () => {
  const specializations = [
    { name: 'Orthopedic', icon: '🦴', query: 'Orthopedic Physiotherapy' },
    { name: 'Sports', icon: '⚡', query: 'Sports Physiotherapy' },
    { name: 'Neurological', icon: '🧠', query: 'Neurological Physiotherapy' },
    { name: 'Post-Surgical', icon: '🏥', query: 'Post-Surgical Rehabilitation' },
    { name: 'Pediatric', icon: '👶', query: 'Pediatric Physiotherapy' },
    { name: 'Geriatric', icon: '🧓', query: 'Geriatric Physiotherapy' },
    { name: 'Spinal', icon: '🔗', query: 'Postural & Spinal Rehabilitation' },
    { name: "Women's Health", icon: '🌸', query: "Women's Health Physiotherapy" },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
          Browse by Specialization
        </h2>
        <p className="text-slate-500 font-medium mt-2">
          Find the exact target treatment for your recovery.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {specializations.map((spec, index) => (
          <Link
            key={index}
            to={`/doctors?specialization=${encodeURIComponent(spec.query)}`}
            className="group bg-white hover:bg-slate-50 border border-slate-100 rounded-card p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shadow-sm"
          >
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {spec.icon}
            </span>
            <h3 className="font-bold text-secondary text-base group-hover:text-primary transition-colors">
              {spec.name}
            </h3>
            <span className="text-xs font-semibold text-slate-400 mt-2 block group-hover:text-primary transition-colors">
              View Specialists →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpecializationsSection;
