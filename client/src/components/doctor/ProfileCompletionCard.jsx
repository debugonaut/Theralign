import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const ProfileCompletionCard = ({ doctorProfile, slotCount }) => {
  if (!doctorProfile) return null;

  // Let's calculate profile completion according to the specified weights in F8
  // Key elements: bio (20%), profile photo (20%), fee (15%), specialization (15%), experience (10%), clinic details (10%), availability (10%)
  const hasPhoto = !!(doctorProfile.profileImage || doctorProfile.user?.profileImage);
  const hasBio = !!(doctorProfile.bio && doctorProfile.bio.trim().length >= 50);
  const hasFee = !!(doctorProfile.consultationFee && doctorProfile.consultationFee > 0);
  const hasSpecialization = !!(doctorProfile.specialization && doctorProfile.specialization.length > 0);
  const hasExperience = !!(doctorProfile.experience && doctorProfile.experience > 0);
  const hasClinic = !!(doctorProfile.clinicName && doctorProfile.clinicAddress);
  const hasSlots = slotCount > 0;

  const items = [
    { key: 'photo', label: 'ADD PROFILE PHOTO', met: hasPhoto, weight: 20, link: '/doctor/profile' },
    { key: 'bio', label: 'WRITE PROFESSIONAL BIO', met: hasBio, weight: 20, link: '/doctor/profile' },
    { key: 'fee', label: 'SET CONSULTATION FEE', met: hasFee, weight: 15, link: '/doctor/profile' },
    { key: 'spec', label: 'SET SPECIALIZATION', met: hasSpecialization, weight: 15, link: '/doctor/profile' },
    { key: 'exp', label: 'ADD ACTIVE EXPERIENCE', met: hasExperience, weight: 10, link: '/doctor/profile' },
    { key: 'clinic', label: 'ADD CLINIC DETAILS', met: hasClinic, weight: 10, link: '/doctor/profile' },
    { key: 'slots', label: 'ADD AVAILABILITY SLOTS', met: hasSlots, weight: 10, link: '/doctor/availability' },
  ];

  const percentage = items.reduce((sum, item) => sum + (item.met ? item.weight : 0), 0);

  if (percentage === 100) {
    return null; // Disappears entirely when profile is 100% complete
  }

  return (
    <div className="w-full p-8 bg-neutral-100 border-2 border-neutral-900 rounded-none shadow-none text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: 6 columns */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-display-md font-black text-neutral-900 select-none leading-none block">
              {percentage}%
            </span>
            <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block mt-2">
              PROFILE COMPLETE
            </span>
          </div>

          {/* Pure horizontal progress bar (solid black on gray-200 track) */}
          <div className="w-full h-4 bg-neutral-200 border-2 border-neutral-900 rounded-none overflow-hidden relative mt-2">
            <div
              className="h-full bg-neutral-900 transition-all duration-standard rounded-none"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Right Side: 6 columns (Missing checklist) */}
        <div className="flex flex-col gap-3">
          <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block">
            REMAINING ACTIONS
          </span>
          
          <div className="flex flex-col border border-neutral-200 bg-white divide-y divide-neutral-200 rounded-none">
            {items.map((item) => (
              <Link
                key={item.key}
                to={item.link}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Square indicator */}
                  <div
                    className={`w-5 h-5 border border-neutral-900 rounded-none flex items-center justify-center shrink-0 ${
                      item.met ? 'bg-neutral-900' : 'bg-white'
                    }`}
                  >
                    {item.met && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  
                  <span
                    className={`text-ui-sm font-bold truncate uppercase tracking-wider ${
                      item.met ? 'text-neutral-500 line-through' : 'text-neutral-900'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {!item.met && (
                  <span className="text-[11px] font-black text-accent tracking-wider shrink-0 select-none">
                    +{item.weight}%
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
