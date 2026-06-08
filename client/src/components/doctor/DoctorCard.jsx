import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Star, Briefcase, IndianRupee, MapPin, Building2 } from 'lucide-react';

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getInitials = (name) => {
  if (!name) return 'PT';
  const cleanName = name.replace(/^Dr\.\s+/i, '').trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return cleanName.charAt(0).toUpperCase();
};

const getCityFromAddress = (address) => {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return parts[0] || '';
};

const DoctorCard = ({ doctor, index = 0 }) => {
  const navigate = useNavigate();

  const doctorName = toTitleCase(doctor.user?.name || 'Physiotherapist');
  const formattedDrName = doctorName.toLowerCase().startsWith('dr.')
    ? doctorName
    : `Dr. ${doctorName}`;
  const initials = getInitials(formattedDrName);

  // Specialization categorical signal: primary specialization only (first item if multiple)
  const allSpecs = Array.isArray(doctor.specialization)
    ? doctor.specialization
    : [doctor.specialization || 'General Physiotherapy'];
  const primarySpec = toTitleCase(allSpecs[0] || 'General Physiotherapy');
  const remainingSpecs = allSpecs.slice(1);

  const city = getCityFromAddress(doctor.clinicAddress);

  const handleCardClick = (e) => {
    e.stopPropagation();
    navigate(`/doctors/${doctor._id}`);
  };

  // Stagger animation delay logic
  const delay = Math.min(index, 7) * 60;
  const cardStyle = {
    animationDelay: `${delay}ms`,
  };

  return (
    <div
      onClick={handleCardClick}
      style={cardStyle}
      className="doctor-card-custom doctor-card-enter flex items-stretch overflow-hidden select-none w-full"
    >
      {/* ─── ZONE A: Identity (220px) ─── */}
      <div className="w-[220px] bg-[#0B4F6C] shrink-0 rounded-l-xl flex flex-col justify-center px-6 py-5 relative">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-white/12 border-2 border-white/25 flex items-center justify-center font-extrabold text-[18px] text-white tracking-[-0.02em] mb-2.5">
          {initials}
        </div>
        
        {/* Doctor Name */}
        <h3 className="font-bold text-[15px] text-white leading-[1.3] max-w-[170px] overflow-hidden line-clamp-2">
          {formattedDrName}
        </h3>

        {/* Specialization */}
        <p className="font-medium text-[11px] text-white/70 mt-1 truncate max-w-[170px] block whitespace-nowrap">
          {primarySpec}
        </p>

        {/* Verified Badge */}
        {doctor.verificationStatus === 'verified' && (
          <div className="absolute bottom-4 left-6 flex items-center gap-1 bg-white/15 border border-white/25 rounded px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
            <BadgeCheck size={10} className="text-white fill-white/10" />
            <span>VERIFIED</span>
          </div>
        )}
      </div>

      {/* ─── ZONE B: Stats (200px) ─── */}
      <div className="w-[200px] shrink-0 border-r border-[#EEF2F6] bg-white flex flex-col justify-center px-6 py-5">
        <div className="flex flex-col gap-3.5">
          {/* Stat 1: Rating */}
          <div className="flex items-center justify-between">
            <Star size={13} fill="#F4845F" stroke="#F4845F" className="shrink-0" />
            <div className="flex items-center gap-0.5">
              <span className="font-bold text-[14px] text-[#1C2B3A]">{(doctor.averageRating || 0).toFixed(1)}</span>
              <span className="text-[#DDE3EA] text-[12px]">/</span>
              <span className="font-normal text-[12px] text-[#A8B8C8]">5</span>
              <span className="font-normal text-[11px] text-[#6B7C93] ml-1">({doctor.totalReviews || 0})</span>
            </div>
          </div>

          <div className="h-[1px] bg-[#EEF2F6] w-full" />

          {/* Stat 2: Experience */}
          <div className="flex items-center justify-between">
            <Briefcase size={13} className="text-[#6B7C93] shrink-0" />
            <span className="font-bold text-[14px] text-[#1C2B3A]">{doctor.experience} yrs</span>
          </div>

          <div className="h-[1px] bg-[#EEF2F6] w-full" />

          {/* Stat 3: Fee */}
          <div className="flex items-center justify-between">
            <IndianRupee size={13} className="text-[#0B4F6C] shrink-0" />
            <span className="font-bold text-[14px] text-[#0B4F6C]">₹{doctor.consultationFee}</span>
          </div>
        </div>
      </div>

      {/* ─── ZONE C: Details (flex-1) ─── */}
      <div className="flex-1 bg-white flex flex-col justify-center px-6 py-5 gap-2.5 min-w-0">
        {/* Location Row */}
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-[#6B7C93] shrink-0" />
          {city ? (
            <span className="font-medium text-[13px] text-[#3D5166] truncate">{city}</span>
          ) : (
            <span className="text-[#A8B8C8] text-[13px]">Location not specified</span>
          )}
          {doctor.distanceKm !== undefined && doctor.distanceKm !== null && (
            <span className="bg-[#E8F4F8] rounded-[4px] px-2 py-8px ml-2 font-semibold text-[11px] text-[#0B4F6C] whitespace-nowrap" style={{ padding: '2px 8px' }}>
              {doctor.distanceKm} km away
            </span>
          )}
        </div>

        {/* Clinic Name Row */}
        <div className="flex items-center gap-1.5">
          <Building2 size={13} className="text-[#6B7C93] shrink-0" />
          <span className="font-normal text-[13px] text-[#6B7C93] truncate">
            {doctor.clinicName || 'Clinic name not specified'}
          </span>
        </div>

        {/* Tags Row */}
        {remainingSpecs.length > 0 && (
          <div className="flex gap-1.5 flex-nowrap overflow-hidden pt-1">
            {remainingSpecs.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className="bg-[#F0F4F7] rounded-[4px] px-[10px] py-[3px] font-medium text-[11px] text-[#6B7C93] whitespace-nowrap"
              >
                {toTitleCase(spec)}
              </span>
            ))}
            {remainingSpecs.length > 3 && (
              <span
                className="bg-[#F0F4F7] rounded-[4px] px-[10px] py-[3px] font-medium text-[11px] text-[#A8B8C8] whitespace-nowrap"
              >
                +{remainingSpecs.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── ZONE D: Action (180px) ─── */}
      <div className="w-[180px] bg-[#FAFBFC] shrink-0 border-l border-[#EEF2F6] rounded-r-xl flex flex-col justify-center items-center px-5 py-5 gap-3">


        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleCardClick}
          className="w-full h-10 bg-[#0B4F6C] hover:bg-[#083A52] text-white rounded-lg font-semibold text-[13px] transition-colors cursor-pointer focus:outline-none"
        >
          View Profile
        </button>

        {/* Secondary CTA */}
        <button
          type="button"
          onClick={handleCardClick}
          className="font-semibold text-[12px] text-[#F4845F] hover:underline bg-transparent border-0 cursor-pointer p-0"
        >
          Book Now →
        </button>
      </div>
    </div>
  );
};

export default React.memo(DoctorCard);
