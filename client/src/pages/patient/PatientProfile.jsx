import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../../store/authStore';
import { patientProfileService } from '../../api/patientProfile.api';
import SegmentedControl from '../../components/common/SegmentedControl';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import HorizontalStepper from '../../components/common/HorizontalStepper';
import { AlertTriangle, Check } from 'lucide-react';

import BasicInfoTab from '../../components/patient/profile/BasicInfoTab';
import MedicalHistoryTab from '../../components/patient/profile/MedicalHistoryTab';
import LifestyleTab from '../../components/patient/profile/LifestyleTab';
import EmergencyContactsTab from '../../components/patient/profile/EmergencyContactsTab';
import InsuranceTab from '../../components/patient/profile/InsuranceTab';

const DRAFT_KEY = 'physio_patient_profile_draft';

const TABS = [
  { value: 'BASIC INFO', label: 'BASIC INFO' },
  { value: 'MEDICAL HISTORY', label: 'MEDICAL HISTORY' },
  { value: 'LIFESTYLE', label: 'LIFESTYLE' },
  { value: 'EMERGENCY CONTACTS', label: 'EMERGENCY CONTACTS' },
  { value: 'INSURANCE', label: 'INSURANCE' }
];

const getCompletedSteps = (prof) => {
  const completed = [];
  if (!prof) return completed;
  if (prof.dateOfBirth && prof.gender && prof.bloodGroup) completed.push(0);
  if (
    prof.medicalHistory &&
    (prof.medicalHistory.conditions?.length > 0 ||
      prof.medicalHistory.medications?.length > 0 ||
      prof.medicalHistory.surgeries?.length > 0)
  ) {
    completed.push(1);
  }
  if (prof.lifestyle && prof.lifestyle.activityLevel) completed.push(2);
  if (prof.emergencyContacts && prof.emergencyContacts.length > 0) completed.push(3);
  if (prof.insurance && (prof.insurance.provider || prof.insurance.policyNumber)) completed.push(4);
  return completed;
};

const isTabDirty = (tabName, currentFormData, baseData) => {
  if (!baseData) return false;
  const getKeysForTab = (tab) => {
    switch (tab) {
      case 'BASIC INFO':
        return ['name', 'dateOfBirth', 'phone', 'gender', 'bloodGroup'];
      case 'MEDICAL HISTORY':
        return ['conditions', 'medications', 'surgeries'];
      case 'LIFESTYLE':
        return ['occupation', 'activityLevel', 'smoking', 'alcohol'];
      case 'EMERGENCY CONTACTS':
        return ['emergencyContacts'];
      case 'INSURANCE':
        return ['provider', 'policyNumber'];
      default:
        return [];
    }
  };
  
  const keys = getKeysForTab(tabName);
  for (const key of keys) {
    const curr = currentFormData[key];
    const prev = baseData[key];
    
    if (Array.isArray(curr)) {
      if (!Array.isArray(prev) || curr.length !== prev.length) return true;
      const strCurr = JSON.stringify(curr);
      const strPrev = JSON.stringify(prev);
      if (strCurr !== strPrev) return true;
    } else if (curr !== prev) {
      return true;
    }
  }
  return false;
};

const PatientProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BASIC INFO');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [animatingStepIdx, setAnimatingStepIdx] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [savedData, setSavedData] = useState(null);
  const [draftToRestore, setDraftToRestore] = useState(null);
  const [dirtyTab, setDirtyTab] = useState(null);
  const [showAutosaveChip, setShowAutosaveChip] = useState(false);

  // Centralized form data state for all tabs
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    
    // Medical History
    conditions: [],
    medications: [],
    surgeries: [],

    // Lifestyle
    occupation: '',
    activityLevel: '',
    smoking: null,
    alcohol: null,

    // Emergency Contacts
    emergencyContacts: [],

    // Insurance
    provider: '',
    policyNumber: ''
  });
  
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const firstRender = useRef(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Autosave effect
  useEffect(() => {
    if (firstRender.current) {
      if (savedData && formData) {
        firstRender.current = false;
      }
      return;
    }
    if (!savedData) return;

    // Check if anything has changed from savedData
    const hasChanges = Object.keys(formData).some((key) => {
      const curr = formData[key];
      const prev = savedData[key];
      if (Array.isArray(curr)) {
        return JSON.stringify(curr) !== JSON.stringify(prev);
      }
      return curr !== prev;
    });

    if (hasChanges) {
      const draftPayload = {
        formData,
        activeTab,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
      
      // Flash autosave chip
      setShowAutosaveChip(true);
      const timer = setTimeout(() => setShowAutosaveChip(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, activeTab, savedData]);

  const fetchProfile = async () => {
    try {
      const response = await patientProfileService.getProfile();
      const dbProf = response.profile;
      setProfile(dbProf);
      setCompletedSteps(dbProf?.completedSteps || getCompletedSteps(dbProf));

      // Construct initial values from database profile
      const initialForm = {
        name: dbProf?.user?.name || '',
        dateOfBirth: dbProf?.dateOfBirth ? new Date(dbProf.dateOfBirth).toISOString().split('T')[0] : '',
        phone: dbProf?.user?.phone || '',
        gender: dbProf?.gender || '',
        bloodGroup: dbProf?.bloodGroup || '',
        conditions: dbProf?.medicalHistory?.conditions || [],
        medications: dbProf?.medicalHistory?.medications || [],
        surgeries: dbProf?.medicalHistory?.surgeries || [],
        occupation: dbProf?.lifestyle?.occupation || '',
        activityLevel: dbProf?.lifestyle?.activityLevel || '',
        smoking: dbProf?.lifestyle?.smoking ?? null,
        alcohol: dbProf?.lifestyle?.alcohol ?? null,
        emergencyContacts: dbProf?.emergencyContacts || [],
        provider: dbProf?.insurance?.provider || '',
        policyNumber: dbProf?.insurance?.policyNumber || ''
      };

      setSavedData(initialForm);
      setFormData(initialForm);

      // Check for draft in localStorage
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.formData) {
            setDraftToRestore(parsed);
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    } catch (error) {
      showToast('error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabValue) => {
    if (tabValue === activeTab) return;
    const targetIdx = TABS.findIndex((t) => t.value === tabValue);
    if (targetIdx > 0 && !completedSteps.includes(targetIdx - 1)) {
      showToast('error', 'Please fill and save the previous steps first.');
      return;
    }

    if (isTabDirty(activeTab, formData, savedData)) {
      setDirtyTab(activeTab);
    }

    setActiveTab(tabValue);
  };

  const handleFieldChange = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = () => {
    const draftPayload = {
      formData,
      activeTab,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    showToast('success', 'DRAFT SAVED LOCALLY');
  };

  const saveTab = async (tabName) => {
    try {
      let payload = {};
      const currentStepIdx = TABS.findIndex((t) => t.value === tabName);
      if (tabName === 'BASIC INFO') {
        payload = {
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          completedSteps: Array.from(new Set([...completedSteps, 0]))
        };
      } else if (tabName === 'MEDICAL HISTORY') {
        payload = {
          medicalHistory: {
            conditions: formData.conditions,
            medications: formData.medications,
            surgeries: formData.surgeries
          },
          completedSteps: Array.from(new Set([...completedSteps, 1]))
        };
      } else if (tabName === 'LIFESTYLE') {
        payload = {
          lifestyle: {
            occupation: formData.occupation,
            activityLevel: formData.activityLevel,
            smoking: formData.smoking,
            alcohol: formData.alcohol
          },
          completedSteps: Array.from(new Set([...completedSteps, 2]))
        };
      } else if (tabName === 'EMERGENCY CONTACTS') {
        payload = {
          emergencyContacts: formData.emergencyContacts,
          completedSteps: Array.from(new Set([...completedSteps, 3]))
        };
      } else if (tabName === 'INSURANCE') {
        payload = {
          insurance: {
            provider: formData.provider,
            policyNumber: formData.policyNumber
          },
          completedSteps: Array.from(new Set([...completedSteps, 4]))
        };
      }

      const res = await patientProfileService.updateProfile(payload);
      handleSaveSuccess(res.data.profile);
      showToast('success', `${tabName} saved successfully.`);
      setDirtyTab(null);
    } catch (err) {
      showToast('error', err.response?.data?.message || `Failed to save ${tabName}`);
    }
  };

  const discardTabChanges = (tabName) => {
    const getKeysForTab = (tab) => {
      switch (tab) {
        case 'BASIC INFO':
          return ['name', 'dateOfBirth', 'phone', 'gender', 'bloodGroup'];
        case 'MEDICAL HISTORY':
          return ['conditions', 'medications', 'surgeries'];
        case 'LIFESTYLE':
          return ['occupation', 'activityLevel', 'smoking', 'alcohol'];
        case 'EMERGENCY CONTACTS':
          return ['emergencyContacts'];
        case 'INSURANCE':
          return ['provider', 'policyNumber'];
        default:
          return [];
      }
    };
    const keys = getKeysForTab(tabName);
    const revertedUpdates = {};
    keys.forEach((key) => {
      revertedUpdates[key] = savedData[key];
    });
    setFormData((prev) => ({
      ...prev,
      ...revertedUpdates
    }));
    
    // Also remove the draft from localStorage to clear
    localStorage.removeItem(DRAFT_KEY);

    setDirtyTab(null);
    showToast('success', `Unsaved changes in ${tabName} discarded.`);
  };

  const handleSaveSuccess = (updatedProfile) => {
    setProfile(updatedProfile);

    // Sync database updates into formData
    const updatedForm = {
      ...formData,
      name: updatedProfile?.user?.name || '',
      dateOfBirth: updatedProfile?.dateOfBirth ? new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0] : '',
      phone: updatedProfile?.user?.phone || '',
      gender: updatedProfile?.gender || '',
      bloodGroup: updatedProfile?.bloodGroup || '',
      conditions: updatedProfile?.medicalHistory?.conditions || [],
      medications: updatedProfile?.medicalHistory?.medications || [],
      surgeries: updatedProfile?.medicalHistory?.surgeries || [],
      occupation: updatedProfile?.lifestyle?.occupation || '',
      activityLevel: updatedProfile?.lifestyle?.activityLevel || '',
      smoking: updatedProfile?.lifestyle?.smoking ?? null,
      alcohol: updatedProfile?.lifestyle?.alcohol ?? null,
      emergencyContacts: updatedProfile?.emergencyContacts || [],
      provider: updatedProfile?.insurance?.provider || '',
      policyNumber: updatedProfile?.insurance?.policyNumber || ''
    };
    setFormData(updatedForm);
    setSavedData(updatedForm);

    // Update draft in localStorage to match newly saved DB values
    const draftPayload = {
      formData: updatedForm,
      activeTab,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));

    // Get current step index
    const currentStepIdx = TABS.findIndex((t) => t.value === activeTab);

    // Update completedSteps from database or state
    const newCompleted = updatedProfile?.completedSteps || Array.from(new Set([...completedSteps, currentStepIdx]));
    setCompletedSteps(newCompleted);

    // Trigger ticking animation
    setAnimatingStepIdx(currentStepIdx);

    // Advance after 1000ms
    setTimeout(() => {
      setAnimatingStepIdx(null);
      if (currentStepIdx < TABS.length - 1) {
        const nextTab = TABS[currentStepIdx + 1].value;
        setActiveTab(nextTab);
        // Also update activeTab in localStorage draft
        const nextDraftPayload = {
          formData: updatedForm,
          activeTab: nextTab,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraftPayload));
      } else {
        showToast('success', 'PROFILE UPDATED SUCCESSFULLY!');
        // Clear draft when the entire profile is saved and complete
        localStorage.removeItem(DRAFT_KEY);
      }
    }, 1000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await patientProfileService.uploadAvatar(file);
      setProfile(prev => ({ ...prev, user: { ...prev.user, profileImage: response.user.profileImage } }));
      showToast('success', 'Profile photo updated');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const joinDate = new Date(profile?.user?.createdAt || Date.now()).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });
  
  const completionScore = profile?.completionPercentage || 0;
  const showUnsavedBanner = dirtyTab && isTabDirty(dirtyTab, formData, savedData);

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] relative">
      {/* LEFT COLUMN: Profile Card */}
      <div className="w-[280px] flex-shrink-0 border-r border-neutral-200 flex flex-col p-6 bg-white">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-[120px] h-[120px] border border-neutral-200 bg-neutral-100 flex items-center justify-center overflow-hidden relative rounded-full shadow-sm">
            {profile?.user?.profileImage ? (
              <img src={profile.user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-display-sm font-bold text-neutral-400 uppercase">
                {profile?.user?.name ? profile.user.name.charAt(0) : 'U'}
              </span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="text-[10px] font-bold uppercase mt-2 text-black tracking-widest">Uploading...</span>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/jpeg, image/png, image/jpg" 
            className="hidden" 
          />
          <Button 
            variant="ghost" 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 font-bold text-ui-xs uppercase tracking-widest transition-all rounded-md shadow-sm"
            disabled={isUploading}
          >
            Upload Photo →
          </Button>
        </div>

        <div className="h-[1px] bg-neutral-200 w-full mb-6 max-w-[1200px]"></div>

        {/* Identity */}
        <div className="flex flex-col mb-8">
          <h1 className="text-ui-xl font-bold uppercase truncate mb-2 text-neutral-900">{profile?.user?.name}</h1>
          <div className="inline-flex px-3 py-1 bg-primary-light text-primary font-bold text-ui-xs uppercase tracking-widest self-start rounded-sm select-none">
            PATIENT PORTAL
          </div>
          <div className="text-ui-xs uppercase text-neutral-400 font-bold tracking-widest mt-2">
            MEMBER SINCE {joinDate}
          </div>
        </div>

        <div className="h-[1px] bg-neutral-200 w-full mb-6 max-w-[1200px]"></div>

        {/* Completion */}
        <div className="flex flex-col">
          <div className="text-ui-xs uppercase text-neutral-400 font-bold tracking-widest mb-1">
            PROFILE COMPLETE
          </div>
          <div className="text-display-xs font-bold text-neutral-900 mb-3">
            {completionScore}%
          </div>
          <div className="w-full h-2 bg-neutral-100 mb-4 rounded-full overflow-hidden relative max-w-[1200px]">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full" 
              style={{ width: `${completionScore}%` }}
            ></div>
          </div>
          <div className="text-ui-xs text-neutral-500 font-medium">
            Complete your profile so physiotherapists can prepare for your session.
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Tabs Content */}
      <div className="flex-1 flex flex-col p-6 bg-white overflow-y-auto relative">
        {/* BANNERS CONTAINER */}
        <div className="max-w-4xl mx-auto w-full mb-2">
          {/* Unsaved changes warning banner */}
          {showUnsavedBanner && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in font-sans mb-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  UNSAVED CHANGES IN {dirtyTab}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => saveTab(dirtyTab)}
                  className="px-3.5 py-1.5 bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-[4px] hover:bg-amber-700 transition"
                >
                  SAVE NOW
                </button>
                <button
                  onClick={() => discardTabChanges(dirtyTab)}
                  className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-700 font-bold text-[11px] uppercase tracking-wider rounded-[4px] hover:bg-amber-100 transition"
                >
                  DISCARD
                </button>
              </div>
            </div>
          )}

          {/* Draft restore banner */}
          {draftToRestore && (
            <div className="bg-[#E8F4F8] border border-[#0B4F6C]/25 text-[#0B4F6C] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in font-sans mb-4">
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-wider">
                  Draft Found
                </span>
                <span className="text-[11px] text-neutral-600 mt-0.5">
                  You have unsaved changes from a previous session.
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      ...draftToRestore.formData
                    });
                    if (draftToRestore.activeTab) {
                      setActiveTab(draftToRestore.activeTab);
                    }
                    setDraftToRestore(null);
                    showToast('success', 'Draft restored successfully.');
                  }}
                  className="px-3.5 py-1.5 bg-[#0B4F6C] text-white font-bold text-[11px] uppercase tracking-wider rounded-[4px] hover:bg-[#083A52] transition"
                >
                  Restore Draft
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(DRAFT_KEY);
                    setDraftToRestore(null);
                    showToast('success', 'Draft discarded.');
                  }}
                  className="px-3.5 py-1.5 bg-white border border-neutral-300 text-neutral-600 font-bold text-[11px] uppercase tracking-wider rounded-[4px] hover:bg-neutral-50 transition"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        <HorizontalStepper
          steps={TABS}
          activeStep={TABS.findIndex((t) => t.value === activeTab)}
          completedSteps={completedSteps}
          animatingStepIdx={animatingStepIdx}
          onStepClick={(idx) => handleTabChange(TABS[idx].value)}
        />

        {/* Tab Content Area */}
        <div className="max-w-4xl mx-auto w-full pb-20">
          {activeTab === 'BASIC INFO' && (
            <BasicInfoTab 
              profile={profile} 
              formData={formData}
              onChange={handleFieldChange}
              onSaveSuccess={handleSaveSuccess} 
              onSaveDraft={handleSaveDraft}
              completedSteps={completedSteps}
              onNext={() => handleTabChange('MEDICAL HISTORY')}
            />
          )}
          {activeTab === 'MEDICAL HISTORY' && (
            <MedicalHistoryTab 
              profile={profile} 
              formData={formData}
              onChange={handleFieldChange}
              onSaveSuccess={handleSaveSuccess} 
              onSaveDraft={handleSaveDraft}
              completedSteps={completedSteps}
              onBack={() => handleTabChange('BASIC INFO')}
              onNext={() => handleTabChange('LIFESTYLE')}
            />
          )}
          {activeTab === 'LIFESTYLE' && (
            <LifestyleTab 
              profile={profile} 
              formData={formData}
              onChange={handleFieldChange}
              onSaveSuccess={handleSaveSuccess} 
              onSaveDraft={handleSaveDraft}
              completedSteps={completedSteps}
              onBack={() => handleTabChange('MEDICAL HISTORY')}
              onNext={() => handleTabChange('EMERGENCY CONTACTS')}
            />
          )}
          {activeTab === 'EMERGENCY CONTACTS' && (
            <EmergencyContactsTab 
              profile={profile} 
              formData={formData}
              onChange={handleFieldChange}
              onSaveSuccess={handleSaveSuccess} 
              onSaveDraft={handleSaveDraft}
              completedSteps={completedSteps}
              onBack={() => handleTabChange('LIFESTYLE')}
              onNext={() => handleTabChange('INSURANCE')}
            />
          )}
          {activeTab === 'INSURANCE' && (
            <InsuranceTab 
              profile={profile} 
              formData={formData}
              onChange={handleFieldChange}
              onSaveSuccess={handleSaveSuccess} 
              onSaveDraft={handleSaveDraft}
              completedSteps={completedSteps}
              onBack={() => handleTabChange('EMERGENCY CONTACTS')}
            />
          )}
        </div>
      </div>

      {/* Floating Autosave Chip */}
      {showAutosaveChip && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#E8F4F8] border border-[#0B4F6C]/20 text-[#0B4F6C] px-3.5 py-2 rounded-full flex items-center gap-2 shadow-md animate-fade-in font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B4F6C] animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Draft Autosaved</span>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
