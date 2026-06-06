import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../common/VerifiedBadge';
import Button from '../common/Button';

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const doctorName = toTitleCase(doctor.user?.name || 'Physiotherapist');
  const formattedDrName = doctorName.toLowerCase().startsWith('dr.')
    ? doctorName
    : `Dr. ${doctorName}`;
  const initial = formattedDrName.replace(/^Dr\.\s+/i, '').charAt(0).toUpperCase();

  // Specialization categorical signal in Title Case
  const specText = Array.isArray(doctor.specialization)
    ? doctor.specialization.join(', ')
    : doctor.specialization || 'General Physiotherapy';

  const formattedSpecText = toTitleCase(specText);

  // Get clinic city
  const city = doctor.clinicAddress
    ? doctor.clinicAddress.split(',').pop().trim()
    : 'Pune';

  const formattedCity = toTitleCase(city);

  const handleCardClick = () => {
    navigate(`/doctors/${doctor._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-lg shadow-level-1 hover:shadow-level-2 border border-neutral-200/40 p-6 cursor-pointer flex flex-col gap-4 overflow-hidden transition-warm text-left"
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
        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg select-none shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 text-ui-xl truncate leading-none mb-1.5 normal-case">
            {formattedDrName}
          </h3>
          <p className="text-[10px] text-accent font-bold uppercase tracking-wider truncate">
            {formattedSpecText}
          </p>
        </div>
      </div>

      {/* Separator rule */}
      <div className="h-[1px] bg-neutral-200/60 w-full" />

      {/* Data Row: Location, Experience, Consultation Fee */}
      <div className="grid grid-cols-3 gap-2 text-ui-xs font-bold text-neutral-700 uppercase tracking-wider">
        <div className="text-left truncate">
          <span className="text-neutral-500 block mb-0.5">LOCATION</span>
          <span className="text-neutral-900 truncate block normal-case font-semibold">{formattedCity}</span>
        </div>
        <div className="text-center">
          <span className="text-neutral-500 block mb-0.5">EXPERIENCE</span>
          <span className="text-neutral-900 block font-semibold">{doctor.experience} Yrs</span>
        </div>
        <div className="text-right">
          <span className="text-neutral-500 block mb-0.5">FEE</span>
          <span className="text-neutral-900 font-black block">₹{doctor.consultationFee}</span>
        </div>
      </div>

      {/* Rating Row */}
      <div className="flex items-center gap-1.5 text-ui-xs uppercase tracking-wider font-bold mt-1">
        <span className="text-neutral-900 font-black">
          {(doctor.averageRating || 0).toFixed(1)} / 5
        </span>
        <span className="text-neutral-500 font-medium normal-case">
          ({doctor.totalReviews || 0} reviews)
        </span>
      </div>

      {/* Progressive Disclosure: BOOK NOW button slides in from bottom on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-standard ease-swiss border-t border-neutral-200">
        <Button
          variant="ghost"
          fullWidth
          size="sm"
          className="font-bold"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Book Now →
        </Button>
      </div>
    </div>
  );
};

export default React.memo(DoctorCard);
