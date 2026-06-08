/**
 * Calculates the profile completion score for a doctor.
 * Matches specific weight ratios and actions defined in Phase 9 requirements.
 */
export const calculateProfileCompletion = (doctorProfile, user) => {
  const criteria = [
    {
      key: 'profileImage',
      label: 'Add a professional profile photo',
      weight: 20,
      met: !!doctorProfile?.profileImage,
      link: '/doctor/profile',
    },
    {
      key: 'bio',
      label: 'Write a professional bio (minimum 50 characters)',
      weight: 20,
      met: !!(doctorProfile?.bio && doctorProfile.bio.trim().length >= 50),
      link: '/doctor/profile',
    },
    {
      key: 'consultationFee',
      label: 'Set your consultation fee',
      weight: 15,
      met: !!(doctorProfile?.consultationFee && doctorProfile.consultationFee > 0),
      link: '/doctor/profile',
    },
    {
      key: 'specialization',
      label: 'Set your medical specialization',
      weight: 15,
      met: !!(doctorProfile?.specialization && (
        Array.isArray(doctorProfile.specialization) 
          ? doctorProfile.specialization.length > 0 
          : doctorProfile.specialization.trim().length > 0
      )),
      link: '/doctor/profile',
    },
    {
      key: 'experience',
      label: 'Add years of clinical experience',
      weight: 10,
      met: !!(doctorProfile?.experienceYears && doctorProfile.experienceYears > 0),
      link: '/doctor/profile',
    },
    {
      key: 'location',
      label: 'Add your clinic city location',
      weight: 10,
      met: !!doctorProfile?.location?.city,
      link: '/doctor/profile',
    },
    {
      key: 'availability',
      label: 'Add at least one availability slot',
      weight: 10,
      met: !!doctorProfile?.hasSlots,
      link: '/doctor/availability',
    },
  ];

  const completedWeight = criteria
    .filter(c => c.met)
    .reduce((sum, c) => sum + c.weight, 0);

  const missing = criteria.filter(c => !c.met);

  return {
    percentage: completedWeight,
    missing,
    isComplete: completedWeight === 100,
  };
};
