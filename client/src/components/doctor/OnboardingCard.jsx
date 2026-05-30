import React from 'react';
import { Link } from 'react-router-dom';

const OnboardingCard = ({ profile, slotCount }) => {
  if (!profile) return null;

  // Step 1 check
  const isProfileComplete = !!(
    profile.bio &&
    profile.bio.length >= 50 &&
    profile.experience &&
    profile.registrationNumber &&
    profile.specialization &&
    profile.specialization.length > 0 &&
    profile.clinicName &&
    profile.clinicAddress &&
    profile.consultationFee
  );

  // Step 2 check
  const isDocsComplete = !!(profile.degreeDocument && profile.licenseDocument);

  // Step 3 check
  const isSlotsComplete = slotCount > 0;

  // Step 4 check
  const isVerified = profile.verificationStatus === 'verified';

  const steps = [
    {
      id: 1,
      title: 'COMPLETE YOUR PROFILE',
      description: 'Fill in your bio, specialization, and clinic details.',
      isComplete: isProfileComplete,
      link: '/doctor/profile',
    },
    {
      id: 2,
      title: 'UPLOAD VERIFICATION DOCUMENTS',
      description: 'Submit your degree certificate and registration proof.',
      isComplete: isDocsComplete,
      link: '/doctor/profile',
    },
    {
      id: 3,
      title: 'ADD AVAILABILITY SLOTS',
      description: 'Create time slots so patients can book appointments.',
      isComplete: isSlotsComplete,
      link: '/doctor/availability',
    },
    {
      id: 4,
      title: 'AWAIT VERIFICATION',
      description: 'Our team reviews your profile within 2 business days.',
      isComplete: isVerified,
      link: null,
    },
  ];

  // If everything is complete (including verification), the card disappears programmatically
  const completedCount = steps.filter((s) => s.isComplete).length;
  if (completedCount === 4) {
    return null;
  }

  const progressPercentage = (completedCount / 4) * 100;

  return (
    <div className="w-full bg-swiss-gray-100 border-2 border-swiss-black rounded-none shadow-none text-left flex flex-col gap-6 swiss-diagonal relative" style={{ borderTopWidth: '4px' }}>
      {/* Card Header */}
      <div>
        <span className="text-ui-xs font-black text-swiss-red tracking-widest uppercase block mb-1">
          GETTING STARTED
        </span>
        <h2 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
          Complete these steps to start receiving bookings.
        </h2>
        <div className="h-0.5 bg-swiss-black/10 w-full mt-4" />
      </div>

      {/* Checklist Stacked Rows */}
      <div className="flex flex-col border border-swiss-black bg-swiss-white divide-y divide-swiss-black rounded-none">
        {steps.map((step) => {
          const isPendingVerificationStep = step.id === 4;
          return (
            <div
              key={step.id}
              className="flex items-center justify-between h-14 px-4 bg-swiss-white select-none transition-colors"
            >
              {/* Checkbox + Text block */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Bordered Square Checkbox */}
                <div
                  className={`w-6 h-6 border-2 border-swiss-black shrink-0 flex items-center justify-center rounded-none transition-colors ${
                    step.isComplete ? 'bg-swiss-black' : 'bg-swiss-white'
                  }`}
                >
                  {step.isComplete && (
                    <span className="text-swiss-white font-black text-xs">✓</span>
                  )}
                </div>

                <div className="flex flex-col text-left truncate leading-tight">
                  <span
                    className={`text-ui-xs font-black uppercase tracking-wider ${
                      step.isComplete ? 'text-swiss-gray-400 line-through' : 'text-swiss-black'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[11px] text-swiss-gray-400 font-bold uppercase tracking-wider block mt-0.5 truncate">
                    {step.description}
                  </span>
                </div>
              </div>

              {/* Action Link / Confirmation */}
              <div className="shrink-0 font-black text-ui-xs tracking-widest">
                {step.isComplete ? (
                  <span className="text-swiss-teal font-black uppercase select-none">
                    ✓ DONE
                  </span>
                ) : isPendingVerificationStep ? (
                  <span className="text-swiss-amber font-black uppercase select-none">
                    IN REVIEW
                  </span>
                ) : (
                  <Link
                    to={step.link}
                    className="text-swiss-black hover:text-swiss-red flex items-center gap-1 font-black transition-colors"
                  >
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Line */}
      <div className="flex flex-col gap-2">
        <div className="w-full h-3 bg-swiss-gray-200 rounded-none border border-swiss-black overflow-hidden relative">
          <div
            className="h-full bg-swiss-black transition-all duration-standard rounded-none"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest block">
          {completedCount} of 4 STEPS COMPLETE
        </span>
      </div>
    </div>
  );
};

export default OnboardingCard;
