import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, ArrowRight, Home } from 'lucide-react';
import StarRating from '../common/StarRating';
import VerifiedBadge from '../common/VerifiedBadge';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle avatar path safely
  const avatarUrl = doctor.user?.profileImage || '/default-avatar.png';
  const doctorName = doctor.user?.name || 'Physiotherapist';

  // Render qualifications tags nicely (max 3, then +N more)
  const renderedQualifications = doctor.qualifications || [];
  const displayQualifications = renderedQualifications.slice(0, 3);
  const remainingCount = renderedQualifications.length - 3;

  return (
    <div
      onClick={() => navigate(`/doctors/${doctor._id}`)}
      className="group bg-white rounded-card p-5 border border-slate-100 shadow-card hover:shadow-elevated hover:border-slate-200/50 transition-all duration-300 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Decorative Brand Accent Corner Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={doctorName}
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 group-hover:border-primary/20 transition-colors duration-300"
            onError={(e) => {
              e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
            }}
          />
          {/* Availability Ring Dot */}
          {doctor.isAvailable && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-primary transition-colors duration-200">
              Dr. {doctorName}
            </h3>
            {doctor.verificationStatus === 'verified' && <VerifiedBadge size="xs" />}
          </div>
          
          <div className="mt-1">
            <StarRating rating={doctor.averageRating || 0} count={doctor.totalReviews || 0} />
          </div>

          <p className="text-xs text-primary font-bold mt-1.5 uppercase tracking-wide">
            {Array.isArray(doctor.specialization) ? doctor.specialization.join(', ') : doctor.specialization}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 w-full" />

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5 truncate" title={doctor.clinicName}>
          <Home size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{doctor.clinicName}</span>
        </span>

        <span className="flex items-center gap-1.5 text-slate-700 font-semibold justify-end">
          <IndianRupee size={14} className="text-slate-400 shrink-0" />
          <span>₹{doctor.consultationFee}/session</span>
        </span>

        <span className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-slate-400 shrink-0" />
          <span>{doctor.experience} Yrs Experience</span>
        </span>

        {doctor.distanceKm !== undefined && (
          <span className="flex items-center gap-1.5 text-accent font-bold justify-end">
            <MapPin size={14} className="text-accent shrink-0 animate-bounce" />
            <span>{doctor.distanceKm} km away</span>
          </span>
        )}
      </div>

      {/* Qualifications Pills */}
      {renderedQualifications.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {displayQualifications.map((q) => (
            <span
              key={q}
              className="text-[10px] font-bold bg-blue-50/70 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded-full"
            >
              {q}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="text-[10px] font-bold text-slate-400 self-center px-1">
              +{remainingCount} more
            </span>
          )}
        </div>
      )}

      {/* Footer / Booking CTA Action */}
      <div className="flex items-center justify-between mt-auto pt-2 text-xs font-bold text-slate-400 group-hover:text-primary transition-colors duration-200">
        <span />
        <span className="inline-flex items-center gap-1">
          View Profile
          <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};

export default DoctorCard;
