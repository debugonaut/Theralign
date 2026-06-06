import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../../store/authStore';
import { patientProfileService } from '../../api/patientProfile.api';
import SegmentedControl from '../../components/common/SegmentedControl';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import HorizontalStepper from '../../components/common/HorizontalStepper';

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

const PatientProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BASIC INFO');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [animatingStepIdx, setAnimatingStepIdx] = useState(null);

  // Draft state
  const [hasDraft, setHasDraft]           = useState(false);
  const [draftSavedAt, setDraftSavedAt]   = useState(null); // timestamp
  const [showDraftChip, setShowDraftChip] = useState(false); // fading chip
  const draftChipTimerRef = useRef(null);
  const draftDebounceRef  = useRef(null);
  
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  // On mount — check for existing draft
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.tab) {
          setHasDraft(true);
          setDraftSavedAt(parsed.savedAt || null);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientProfileService.getProfile();
      setProfile(response.profile);
      setCompletedSteps(getCompletedSteps(response.profile));
    } catch (error) {
      showToast('error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabValue) => {
    if (tabValue === activeTab) return;
    if (hasUnsavedChanges) {
      setPendingTab(tabValue);
    } else {
      setActiveTab(tabValue);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
      fetchProfile(); // Re-fetch to reset form state
    }
  };

  const handleSaveSuccess = (updatedProfile) => {
    setProfile(updatedProfile);
    setHasUnsavedChanges(false);
    setPendingTab(null);
    // Clear draft on successful save
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);

    // Get current step index
    const currentStepIdx = TABS.findIndex((t) => t.value === activeTab);

    // Add current step to completed if not already there
    if (!completedSteps.includes(currentStepIdx)) {
      setCompletedSteps((prev) => [...prev, currentStepIdx]);
    }

    // Trigger ticking animation
    setAnimatingStepIdx(currentStepIdx);

    // Recompute other completed steps just in case, but merge with current
    const computed = getCompletedSteps(updatedProfile);
    setCompletedSteps((prev) => Array.from(new Set([...prev, ...computed, currentStepIdx])));

    // Advance after 1000ms
    setTimeout(() => {
      setAnimatingStepIdx(null);
      if (currentStepIdx < TABS.length - 1) {
        setActiveTab(TABS[currentStepIdx + 1].value);
      } else {
        showToast('success', 'PROFILE UPDATED SUCCESSFULLY!');
      }
    }, 1000);
  };

  // Intercept unsaved changes flag to also trigger debounced draft save
  const handleUnsavedChanges = useCallback((dirty) => {
    setHasUnsavedChanges(dirty);
    if (!dirty) return;
    // Debounce: write draft 1.5s after last change
    if (draftDebounceRef.current) clearTimeout(draftDebounceRef.current);
    draftDebounceRef.current = setTimeout(() => {
      const draftPayload = { tab: activeTab, savedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
      setHasDraft(true);
      setDraftSavedAt(draftPayload.savedAt);
      // Show the "DRAFT SAVED" chip for 2000ms
      setShowDraftChip(true);
      if (draftChipTimerRef.current) clearTimeout(draftChipTimerRef.current);
      draftChipTimerRef.current = setTimeout(() => setShowDraftChip(false), 2000);
    }, 1500);
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (draftDebounceRef.current) clearTimeout(draftDebounceRef.current);
    if (draftChipTimerRef.current) clearTimeout(draftChipTimerRef.current);
  }, []);

  const handleRestoreDraft = () => {
    // Jump to the tab that was active when draft was saved
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.tab) setActiveTab(parsed.tab);
      } catch {}
    }
    setHasDraft(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
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

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)]">
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
        <HorizontalStepper
          steps={TABS}
          activeStep={TABS.findIndex((t) => t.value === activeTab)}
          completedSteps={completedSteps}
          animatingStepIdx={animatingStepIdx}
          onStepClick={(idx) => handleTabChange(TABS[idx].value)}
        />

        {/* Draft Restore Banner */}
        {hasDraft && (
          <div className="max-w-4xl mx-auto w-full mb-6 border border-warning/40 bg-warning/5 px-5 py-3 rounded-md flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-warning uppercase tracking-widest block">
                Unsaved Draft Found
              </span>
              <span className="text-ui-xs text-neutral-600 font-medium">
                {draftSavedAt
                  ? `Last saved at ${new Date(draftSavedAt).toLocaleTimeString()}`
                  : 'You have unsaved changes from a previous session'}
              </span>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={handleRestoreDraft} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                RESTORE
              </button>
              <button onClick={handleDiscardDraft} className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">
                DISCARD
              </button>
            </div>
          </div>
        )}

        {/* DRAFT SAVED floating chip */}
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            showDraftChip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
            ✓ DRAFT SAVED
          </div>
        </div>

        {/* Unsaved Changes Warning */}

        {hasUnsavedChanges && pendingTab && (
          <div className="max-w-4xl mx-auto w-full mb-8 border-2 border-[#FFB800] bg-yellow-50 px-6 py-4 flex items-center justify-between">
            <span className="text-ui-sm font-bold text-black uppercase tracking-widest">
              UNSAVED CHANGES IN {activeTab} —
            </span>
            <div className="flex gap-6">
              <button onClick={() => setPendingTab(null)} className="text-ui-sm font-bold text-black uppercase tracking-widest hover:underline">
                CONTINUE EDITING
              </button>
              <button onClick={handleDiscardChanges} className="text-ui-sm font-bold text-[#FF3000] uppercase tracking-widest hover:underline">
                DISCARD
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="max-w-4xl mx-auto w-full pb-20">
          {activeTab === 'BASIC INFO' && (
            <BasicInfoTab 
              profile={profile} 
              isDirty={hasUnsavedChanges}
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={handleUnsavedChanges} 
              onNext={() => handleTabChange('MEDICAL HISTORY')}
            />
          )}
          {activeTab === 'MEDICAL HISTORY' && (
            <MedicalHistoryTab 
              profile={profile} 
              isDirty={hasUnsavedChanges}
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={handleUnsavedChanges} 
              onNext={() => handleTabChange('LIFESTYLE')}
            />
          )}
          {activeTab === 'LIFESTYLE' && (
            <LifestyleTab 
              profile={profile} 
              isDirty={hasUnsavedChanges}
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={handleUnsavedChanges} 
              onNext={() => handleTabChange('EMERGENCY CONTACTS')}
            />
          )}
          {activeTab === 'EMERGENCY CONTACTS' && (
            <EmergencyContactsTab 
              profile={profile} 
              isDirty={hasUnsavedChanges}
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={handleUnsavedChanges} 
              onNext={() => handleTabChange('INSURANCE')}
            />
          )}
          {activeTab === 'INSURANCE' && (
            <InsuranceTab 
              profile={profile} 
              isDirty={hasUnsavedChanges}
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={handleUnsavedChanges} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
