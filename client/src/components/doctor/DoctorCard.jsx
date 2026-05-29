import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../common/VerifiedBadge';
import Button from '../common/Button';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const doctorName = doctor.user?.name || 'Physiotherapist';
  const initial = doctorName.charAt(0).toUpperCase();

  // Specialization categorical signal in red uppercase tracked
  const specText = Array.isArray(doctor.specialization)
    ? doctor.specialization.join(', ')
    : doctor.specialization || 'GENERAL PHYSIOTHERAPY';

  // Get clinic city
  const city = doctor.clinicAddress
    ? doctor.clinicAddress.split(',').pop().trim()
    : 'PUNE';

  const handleCardClick = () => {
    navigate(`/doctors/${doctor._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-swiss-white border-2 border-swiss-gray-200 hover:border-4 hover:border-swiss-black p-6 transition-all duration-standard ease-swiss cursor-pointer flex flex-col gap-4 overflow-hidden rounded-none shadow-none text-left"
      style={{ minHeight: '260px' }}
    >
      {/* Verified Badge in top-right corner */}
      {doctor.verificationStatus === 'verified' && (
        <div className="absolute top-4 right-4 z-10">
          <VerifiedBadge size="xs" />
        </div>
      )}

      {/* Card Header: Initial Circle & Name */}
      <div className="flex items-start gap-4 pr-16">
        {/* Doctor Initial Circle */}
        <div className="w-12 h-12 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-black text-lg select-none shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-black text-swiss-black text-ui-xl uppercase tracking-tighter truncate leading-none mb-1.5">
            DR. {doctorName}
          </h3>
          <p className="text-[10px] text-swiss-red font-black uppercase tracking-widest truncate">
            {specText}
          </p>
        </div>
      </div>

      {/* Separator rule */}
      <div className="h-[1px] bg-swiss-gray-200 w-full" />

      {/* Data Row: Location, Experience, Consultation Fee */}
      <div className="grid grid-cols-3 gap-2 text-ui-xs font-bold text-swiss-gray-600 uppercase tracking-wider">
        <div className="text-left truncate">
          <span className="text-swiss-gray-400 block mb-0.5">LOCATION</span>
          <span className="text-swiss-black truncate block">{city}</span>
        </div>
        <div className="text-center">
          <span className="text-swiss-gray-400 block mb-0.5">EXPERIENCE</span>
          <span className="text-swiss-black block">{doctor.experience} YRS</span>
        </div>
        <div className="text-right">
          <span className="text-swiss-gray-400 block mb-0.5">FEE</span>
          <span className="text-swiss-black font-black block">₹{doctor.consultationFee}</span>
        </div>
      </div>

      {/* Rating Row (No Stars) */}
      <div className="flex items-center gap-1.5 text-ui-xs uppercase tracking-wider font-bold mt-1">
        <span className="text-swiss-black font-black">
          {(doctor.averageRating || 0).toFixed(1)} / 5
        </span>
        <span className="text-swiss-gray-400">
          ({doctor.totalReviews || 0} reviews)
        </span>
      </div>

      {/* Progressive Disclosure: BOOK NOW ghost button slides in from bottom on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-swiss-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-standard ease-swiss border-t border-swiss-gray-200">
        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="font-black"
          onClick={(e) => {
            e.stopPropagation(); // Avoid card click triggering twice
            handleCardClick();
          }}
        >
          BOOK NOW →
        </Button>
      </div>
    </div>
  );
};

export default React.memo(DoctorCard);
