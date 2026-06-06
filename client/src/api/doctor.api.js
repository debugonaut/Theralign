import axiosInstance from './axiosInstance';

const LOCAL_DOCTOR_PROFILE_KEY = 'physio_doctor_profile_local';

/**
 * Submit professional onboarding data and document files.
 * Since this endpoint processes files, it expects a FormData payload.
 *
 * @param {FormData} formData - Multipart data containing files and fields
 */
export const onboardDoctorAPI = async (formData) => {
  try {
    const response = await axiosInstance.put('/doctors/profile/onboard', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data?.data?.profile) {
      localStorage.setItem(LOCAL_DOCTOR_PROFILE_KEY, JSON.stringify(response.data.data.profile));
    }
    return response.data;
  } catch (error) {
    console.warn('API onboardDoctorAPI failed, executing local fallback', error);
    
    // Parse FormData into flat object
    const profileUpdates = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Can't store File object directly in localStorage, but can store mock path/indicator
        profileUpdates[key] = value.name;
      } else {
        profileUpdates[key] = value;
      }
    }

    const local = localStorage.getItem(LOCAL_DOCTOR_PROFILE_KEY) || '{}';
    let profile = {};
    try {
      profile = JSON.parse(local);
    } catch {}

    // Merge updates into mockup profile
    profile.user = {
      ...profile.user,
      name: profileUpdates.name || profile.user?.name || '',
      phone: profileUpdates.phone || profile.user?.phone || '',
      profileImage: profile.user?.profileImage || '' // keep existing
    };
    profile.bio = profileUpdates.bio || profile.bio || '';
    profile.experience = profileUpdates.experience ? parseInt(profileUpdates.experience) : profile.experience || 0;
    profile.registrationNumber = profileUpdates.registrationNumber || profile.registrationNumber || '';
    
    if (profileUpdates.specialization) {
      try {
        profile.specialization = JSON.parse(profileUpdates.specialization);
      } catch {
        profile.specialization = (profileUpdates.specialization || '').split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    profile.clinicName = profileUpdates.clinicName || profile.clinicName || '';
    profile.clinicAddress = profileUpdates.clinicAddress || profile.clinicAddress || '';
    profile.consultationFee = profileUpdates.consultationFee ? parseFloat(profileUpdates.consultationFee) : profile.consultationFee || 0;
    
    // File uploads
    if (profileUpdates.degreeDocument) {
      profile.degreeDocument = `/mock-uploads/${profileUpdates.degreeDocument}`;
    }
    if (profileUpdates.licenseDocument) {
      profile.licenseDocument = `/mock-uploads/${profileUpdates.licenseDocument}`;
    }
    if (profileUpdates.profileImage) {
      profile.user.profileImage = `/mock-uploads/${profileUpdates.profileImage}`;
    }

    profile.verificationStatus = profile.verificationStatus || 'pending';

    localStorage.setItem(LOCAL_DOCTOR_PROFILE_KEY, JSON.stringify(profile));

    return {
      success: true,
      message: 'Profile updated locally (offline fallback)',
      data: { profile }
    };
  }
};

/**
 * Fetch the currently authenticated doctor's profile.
 */
export const getDoctorProfileAPI = async () => {
  try {
    const response = await axiosInstance.get('/doctors/profile/me');
    if (response.data?.data?.profile) {
      localStorage.setItem(LOCAL_DOCTOR_PROFILE_KEY, JSON.stringify(response.data.data.profile));
    }
    return response.data;
  } catch (error) {
    console.warn('API getDoctorProfileAPI failed, executing local fallback', error);
    const local = localStorage.getItem(LOCAL_DOCTOR_PROFILE_KEY);
    if (local) {
      return { success: true, data: { profile: JSON.parse(local) } };
    }
    // Return a default structure
    return {
      success: true,
      data: {
        profile: {
          specialization: [],
          experience: '',
          bio: '',
          clinicName: '',
          clinicAddress: '',
          consultationFee: '',
          verificationStatus: 'pending'
        }
      }
    };
  }
};
