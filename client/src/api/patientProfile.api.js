import api from './axiosInstance';

const LOCAL_PROFILE_KEY = 'physio_patient_profile_local';

export const patientProfileService = {
  /**
   * Get the current patient's profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/patients/profile/me');
      if (response.data?.profile) {
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(response.data.profile));
      }
      return response.data;
    } catch (error) {
      console.warn('API getProfile failed, attempting local fallback', error);
      const local = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (local) {
        return { success: true, profile: JSON.parse(local) };
      }
      // Return a mock default patient profile structure
      return {
        success: true,
        profile: {
          medicalHistory: { conditions: [], medications: [], surgeries: [] },
          lifestyle: { occupation: '', activityLevel: '', smoking: null, alcohol: null },
          emergencyContacts: [],
          insurance: { provider: '', policyNumber: '' },
          completionPercentage: 0
        }
      };
    }
  },

  /**
   * Update the patient's profile (supports partial updates)
   * @param {Object} data - The fields to update
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/patients/profile/me', data);
      if (response.data?.profile) {
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(response.data.profile));
      }
      return response.data;
    } catch (error) {
      console.warn('API updateProfile failed, executing local fallback', error);
      // Fallback: merge changes into local storage copy
      const local = localStorage.getItem(LOCAL_PROFILE_KEY) || '{}';
      let profile = {};
      try {
        profile = JSON.parse(local);
      } catch {}

      // Apply updates to the mock profile schema
      if (data.name !== undefined) {
        profile.user = { ...profile.user, name: data.name };
      }
      if (data.phone !== undefined) {
        profile.user = { ...profile.user, phone: data.phone };
      }
      if (data.dateOfBirth !== undefined) profile.dateOfBirth = data.dateOfBirth;
      if (data.gender !== undefined) profile.gender = data.gender;
      if (data.bloodGroup !== undefined) profile.bloodGroup = data.bloodGroup;
      if (data.medicalHistory !== undefined) {
        profile.medicalHistory = {
          ...profile.medicalHistory,
          ...data.medicalHistory
        };
      }
      if (data.lifestyle !== undefined) {
        profile.lifestyle = {
          ...profile.lifestyle,
          ...data.lifestyle
        };
      }
      if (data.emergencyContacts !== undefined) profile.emergencyContacts = data.emergencyContacts;
      if (data.insurance !== undefined) {
        profile.insurance = {
          ...profile.insurance,
          ...data.insurance
        };
      }
      if (data.completedSteps !== undefined) {
        profile.completedSteps = data.completedSteps;
      }

      // Approximate completion percentage calculation
      let score = 0;
      if (profile.completedSteps && profile.completedSteps.length > 0) {
        score = profile.completedSteps.length * 20;
      } else {
        if (profile.dateOfBirth && profile.bloodGroup) score += 20;
        if (profile.medicalHistory) score += 20;
        if (profile.lifestyle?.activityLevel) score += 20;
        if (profile.emergencyContacts?.length > 0) score += 20;
        if (profile.insurance?.provider) score += 20;
      }
      profile.completionPercentage = score;

      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));

      return {
        success: true,
        message: 'Profile updated locally (offline fallback)',
        data: { profile }
      };
    }
  },

  /**
   * Upload an avatar image to Cloudinary
   * @param {File} file - The image file
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const response = await api.post('/patients/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.warn('API uploadAvatar failed, executing local fallback', error);
      // Mock local URL for development fallback
      const mockURL = URL.createObjectURL(file);
      const local = localStorage.getItem(LOCAL_PROFILE_KEY) || '{}';
      let profile = {};
      try {
        profile = JSON.parse(local);
      } catch {}
      profile.user = { ...profile.user, profileImage: mockURL };
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
      
      return {
        success: true,
        user: { profileImage: mockURL }
      };
    }
  },
};

export default patientProfileService;
