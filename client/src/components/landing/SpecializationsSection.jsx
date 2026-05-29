import React from 'react';
import { Link } from 'react-router-dom';
import { Bone, Zap, Brain, Activity, Baby, UserPlus, Link as LinkIcon, Heart } from 'lucide-react';

const SpecializationsSection = () => {
  const specializations = [
    { name: 'ORTHOPEDIC', icon: Bone, query: 'Orthopedic Physiotherapy' },
    { name: 'SPORTS', icon: Zap, query: 'Sports Physiotherapy' },
    { name: 'NEUROLOGICAL', icon: Brain, query: 'Neurological Physiotherapy' },
    { name: 'POST-SURGICAL', icon: Activity, query: 'Post-Surgical Rehabilitation' },
    { name: 'PEDIATRIC', icon: Baby, query: 'Pediatric Physiotherapy' },
    { name: 'GERIATRIC', icon: UserPlus, query: 'Geriatric Physiotherapy' },
    { name: 'SPINAL', icon: LinkIcon, query: 'Postural & Spinal Rehabilitation' },
    { name: "WOMEN'S HEALTH", icon: Heart, query: "Women's Health Physiotherapy" },
  ];

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto w-full">
      <div className="swiss-section-header flex items-baseline gap-4 border-b-4 border-swiss-black pb-4 mb-12">
        <span className="font-bold text-[12px] tracking-[0.06em] uppercase text-swiss-red font-swiss">
          01.
        </span>
        <h2 className="text-[32px] sm:text-[48px] leading-[1.05] font-black uppercase tracking-[-0.04em] text-swiss-black font-swiss">
          AREAS OF CARE
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {specializations.map((spec, index) => {
          const Icon = spec.icon;
          return (
            <Link
              key={index}
              to={`/doctors?specialization=${encodeURIComponent(spec.query)}`}
              className="group relative h-48 bg-swiss-gray-100 border-2 border-swiss-black p-6 flex flex-col justify-between cursor-pointer hover:bg-swiss-black transition-colors duration-fast overflow-hidden"
            >
              {/* Dot Matrix Pattern */}
              <div className="absolute inset-0 swiss-dot-matrix pointer-events-none group-hover:opacity-0 transition-opacity duration-fast"></div>

              {/* Icon in bordered square */}
              <div className="w-10 h-10 border-2 border-swiss-black bg-swiss-white flex items-center justify-center relative z-10 group-hover:border-swiss-white group-hover:bg-swiss-black transition-colors duration-fast">
                <Icon className="w-5 h-5 text-swiss-black group-hover:text-swiss-white transition-colors duration-fast" />
              </div>

              {/* Specialization Name */}
              <h3 className="font-bold text-[16px] text-swiss-black uppercase tracking-widest relative z-10 group-hover:text-swiss-white transition-colors duration-fast w-[80%]">
                {spec.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SpecializationsSection;
