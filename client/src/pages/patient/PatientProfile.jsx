import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { patientProfileService } from '../../api/patientProfile.api';
import SegmentedControl from '../../components/common/SegmentedControl';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';

import BasicInfoTab from '../../components/patient/profile/BasicInfoTab';
import MedicalHistoryTab from '../../components/patient/profile/MedicalHistoryTab';
import LifestyleTab from '../../components/patient/profile/LifestyleTab';
import EmergencyContactsTab from '../../components/patient/profile/EmergencyContactsTab';
import InsuranceTab from '../../components/patient/profile/InsuranceTab';

const TABS = [
  { value: 'BASIC INFO', label: 'BASIC INFO' },
  { value: 'MEDICAL HISTORY', label: 'MEDICAL HISTORY' },
  { value: 'LIFESTYLE', label: 'LIFESTYLE' },
  { value: 'EMERGENCY CONTACTS', label: 'EMERGENCY CONTACTS' },
  { value: 'INSURANCE', label: 'INSURANCE' }
];

const PatientProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BASIC INFO');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientProfileService.getProfile();
      setProfile(response.profile);
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
      <div className="w-[280px] flex-shrink-0 border-r border-neutral-200 flex flex-col p-8 bg-white">
        
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

        <div className="h-[1px] bg-neutral-200 w-full mb-6"></div>

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

        <div className="h-[1px] bg-neutral-200 w-full mb-6"></div>

        {/* Completion */}
        <div className="flex flex-col">
          <div className="text-ui-xs uppercase text-neutral-400 font-bold tracking-widest mb-1">
            PROFILE COMPLETE
          </div>
          <div className="text-display-xs font-bold text-neutral-900 mb-3">
            {completionScore}%
          </div>
          <div className="w-full h-2 bg-neutral-100 mb-4 rounded-full overflow-hidden relative">
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
      <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto relative">
        <div className="mb-8 w-full max-w-4xl mx-auto flex gap-2 border-b border-neutral-200 pb-px overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  pb-3 px-4 font-semibold text-sm transition-all duration-300 relative whitespace-nowrap normal-case focus:outline-none select-none
                  ${isActive 
                    ? 'text-primary font-bold' 
                    : 'text-neutral-500 hover:text-neutral-900'
                  }
                `}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full transition-all duration-300" />
                )}
              </button>
            );
          })}
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
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          )}
          {activeTab === 'MEDICAL HISTORY' && (
            <MedicalHistoryTab 
              profile={profile} 
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          )}
          {activeTab === 'LIFESTYLE' && (
            <LifestyleTab 
              profile={profile} 
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          )}
          {activeTab === 'EMERGENCY CONTACTS' && (
            <EmergencyContactsTab 
              profile={profile} 
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          )}
          {activeTab === 'INSURANCE' && (
            <InsuranceTab 
              profile={profile} 
              onSaveSuccess={handleSaveSuccess} 
              onUnsavedChanges={setHasUnsavedChanges} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
