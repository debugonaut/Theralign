import React, { useState } from 'react';
import { Heart, Info, Check } from 'lucide-react';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const LifestyleTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, completedSteps, onBack, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const { showToast } = useToast();

  const activityLevelOptions = [
    { value: 'SEDENTARY', label: 'Sedentary' },
    { value: 'LIGHT', label: 'Light' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'VERY ACTIVE', label: 'Very Active' },
  ];

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isDirty =
    formData.occupation !== (profile?.lifestyle?.occupation || '') ||
    formData.activityLevel !== (profile?.lifestyle?.activityLevel || '') ||
    formData.smoking !== (profile?.lifestyle?.smoking ?? null) ||
    formData.alcohol !== (profile?.lifestyle?.alcohol ?? null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        lifestyle: {
          occupation: formData.occupation,
          activityLevel: formData.activityLevel,
          smoking: formData.smoking,
          alcohol: formData.alcohol
        },
        completedSteps: Array.from(new Set([...completedSteps, 2])) // Step 3 is index 2
      };
      const updatedProfile = await patientProfileService.updateProfile(payload);
      setSaveStatus('success');
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save lifestyle info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftClick = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const renderStatusChip = () => {
    return (
      <div className={`rounded-[4px] px-[10px] py-[3px] text-[12px] font-bold font-sans ${
        !isDirty ? 'bg-[#E8F4F8] text-[#0B4F6C]' : 'bg-[#FFF2E5] text-[#E67E22]'
      }`}>
        {!isDirty ? 'SAVED' : 'UNSAVED'}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Title block */}
      <div className="flex justify-between items-center mb-2 mt-4 font-sans">
        <div>
          <span className="text-sm font-medium text-[#F4845F] tracking-[0.1em] uppercase block mb-1">
            STEP 3 OF 5
          </span>
          <h2 className="text-[22px] font-medium text-[#1C2B3A] tracking-[-0.02em] leading-tight">
            Lifestyle
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F7F9FB] border border-[#DDE3EA] rounded-[6px] px-3 py-1.5 text-[#6B7C93]">
          <Info size={12} className="shrink-0" />
          <span className="text-sm font-normal leading-none">
            This information is shared with your physiotherapist
          </span>
        </div>
      </div>
      <p className="text-[13px] font-normal text-[#6B7C93] mb-6 font-sans">
        Help your physiotherapist understand your daily habits and physical activity.
      </p>
      <div className="h-[1px] bg-[#EEF2F6] w-full mb-6" />

      {/* Card Wrapper */}
      <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm mb-24 font-sans">
        {/* Card Header */}
        <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-[#0B4F6C]">
              <Heart size={16} />
              <h3 className="text-[13px] font-medium text-[#1C2B3A] uppercase tracking-[0.06em]">
                Lifestyle Information
              </h3>
            </div>
            <p className="text-sm text-[#6B7C93] mt-0.5">
              Your occupation, activity profile, and habits
            </p>
          </div>
          {renderStatusChip()}
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Occupation Input */}
          <div>
            <label className="text-sm font-normal text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
              Occupation
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
            />
          </div>

          {/* Activity Level segmented control */}
          <div>
            <label className="text-sm font-normal text-[#6B7C93] uppercase tracking-[0.07em] mb-2.5 block">
              Activity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {activityLevelOptions.map((opt) => {
                const isSelected = formData.activityLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('activityLevel', opt.value)}
                    className={`py-2 text-center font-bold text-[12px] transition-all duration-200 rounded-[6px] border select-none ${
                      isSelected
                        ? 'bg-[#0B4F6C] border-[#0B4F6C] text-white shadow-sm'
                        : 'bg-white border-[#DDE3EA] text-[#6B7C93] hover:border-[#0B4F6C] hover:text-[#0B4F6C]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Smoking */}
            <div className="flex items-center justify-between border border-[#EEF2F6] rounded-[8px] p-4 bg-white shadow-sm">
              <div>
                <span className="text-sm font-normal text-[#6B7C93] uppercase tracking-[0.07em] block">
                  Smoking
                </span>
                <span className="text-sm text-[#A8B8C8] font-normal block mt-0.5">
                  Do you smoke tobacco?
                </span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((opt) => {
                  const isSelected = formData.smoking === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleChange('smoking', opt.value)}
                      className={`h-8 px-4 font-bold text-[11px] uppercase tracking-[0.06em] rounded-[6px] border select-none transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0B4F6C] border-[#0B4F6C] text-white'
                          : 'bg-white border-[#DDE3EA] text-[#6B7C93] hover:border-[#0B4F6C]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alcohol */}
            <div className="flex items-center justify-between border border-[#EEF2F6] rounded-[8px] p-4 bg-white shadow-sm">
              <div>
                <span className="text-sm font-normal text-[#6B7C93] uppercase tracking-[0.07em] block">
                  Alcohol
                </span>
                <span className="text-sm text-[#A8B8C8] font-normal block mt-0.5">
                  Do you consume alcohol?
                </span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((opt) => {
                  const isSelected = formData.alcohol === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleChange('alcohol', opt.value)}
                      className={`h-8 px-4 font-bold text-[11px] uppercase tracking-[0.06em] rounded-[6px] border select-none transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0B4F6C] border-[#0B4F6C] text-white'
                          : 'bg-white border-[#DDE3EA] text-[#6B7C93] hover:border-[#0B4F6C]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t border-[#EEF2F6] px-6 py-4 flex items-center justify-between z-10 font-sans shadow-md">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-sm font-normal uppercase tracking-[0.06em] transition-colors duration-200"
          >
            ← BACK
          </button>
          <button
            type="button"
            onClick={handleDraftClick}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-sm font-normal uppercase tracking-[0.06em] transition-colors duration-200"
          >
            {draftSaved ? '✓ DRAFT SAVED' : 'SAVE DRAFT'}
          </button>
        </div>

        <div className="flex flex-col items-center relative">
          <span className="text-sm text-[#A8B8C8] font-normal mb-1">
            Changes saved automatically
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 bg-[#0B4F6C] hover:bg-[#083A52] text-white rounded-[6px] text-sm font-medium uppercase tracking-[0.06em] transition-colors duration-200 flex items-center justify-center shrink-0 min-w-[170px]"
          >
            {isSaving ? 'SAVING...' : saveStatus === 'success' ? '✓ SAVED' : 'SAVE & CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifestyleTab;
