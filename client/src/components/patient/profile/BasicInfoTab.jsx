import React, { useState } from 'react';
import { User, Info, Check } from 'lucide-react';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const BasicInfoTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, completedSteps, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const { showToast } = useToast();

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isDirty =
    formData.name !== (profile?.user?.name || '') ||
    formData.dateOfBirth !== (profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '') ||
    formData.phone !== (profile?.user?.phone || '') ||
    formData.gender !== (profile?.gender || '') ||
    formData.bloodGroup !== (profile?.bloodGroup || '');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        completedSteps: Array.from(new Set([...completedSteps, 0])) // Step 1 is index 0
      };
      const updatedProfile = await patientProfileService.updateProfile(payload);
      setSaveStatus('success');
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save basic info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftClick = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  // Completion calculation
  let filledCount = 0;
  if (formData.name) filledCount++;
  if (formData.dateOfBirth) filledCount++;
  if (formData.phone) filledCount++;
  if (formData.gender) filledCount++;

  const renderStatusChip = () => {
    const isAllFilled = filledCount === 4;
    return (
      <div className={`rounded-[4px] px-[10px] py-[3px] text-[12px] font-bold font-sans ${
        isAllFilled ? 'bg-[#E8F4F8] text-[#0B4F6C]' : 'bg-[#F7F9FB] text-[#A8B8C8]'
      }`}>
        {filledCount} / 4 filled
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Title block */}
      <div className="flex justify-between items-center mb-2 mt-4 font-sans">
        <div>
          <span className="text-[10px] font-bold text-[#F4845F] tracking-[0.1em] uppercase block mb-1">
            STEP 1 OF 5
          </span>
          <h2 className="text-[22px] font-bold text-[#1C2B3A] tracking-[-0.02em] leading-tight">
            Basic Info
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F7F9FB] border border-[#DDE3EA] rounded-[6px] px-3 py-1.5 text-[#6B7C93]">
          <Info size={12} className="shrink-0" />
          <span className="text-[11px] font-normal leading-none">
            This information is shared with your physiotherapist
          </span>
        </div>
      </div>
      <p className="text-[13px] font-normal text-[#6B7C93] mb-6 font-sans">
        Help your physiotherapist understand your basic details before your first session.
      </p>
      <div className="h-[1px] bg-[#EEF2F6] w-full mb-6" />

      {/* Card Wrapper */}
      <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm mb-24 font-sans">
        {/* Card Header */}
        <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-[#0B4F6C]">
              <User size={16} />
              <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                Personal Details
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7C93] mt-0.5">
              Your primary contact and identification information
            </p>
          </div>
          {renderStatusChip()}
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 1234567890"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                Gender
              </label>
              <select
                value={formData.gender?.toLowerCase() || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] bg-white focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Blood group selection */}
          <div>
            <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-2.5 block">
              Blood Group
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {bloodGroupOptions.map((opt) => {
                const isSelected = formData.bloodGroup === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('bloodGroup', opt.value)}
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
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t border-[#EEF2F6] px-6 py-4 flex items-center justify-between z-10 font-sans shadow-md">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={true}
            className="h-10 px-5 border border-[#DDE3EA] text-[#A8B8C8] bg-transparent rounded-[6px] text-[12px] font-semibold uppercase tracking-[0.06em] opacity-50 cursor-not-allowed"
          >
            ← BACK
          </button>
          <button
            type="button"
            onClick={handleDraftClick}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200"
          >
            {draftSaved ? '✓ DRAFT SAVED' : 'SAVE DRAFT'}
          </button>
        </div>

        <div className="flex flex-col items-center relative">
          <span className="text-[10px] text-[#A8B8C8] font-normal mb-1">
            Changes saved automatically
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 bg-[#0B4F6C] hover:bg-[#083A52] text-white rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] transition-colors duration-200 flex items-center justify-center shrink-0 min-w-[170px]"
          >
            {isSaving ? 'SAVING...' : saveStatus === 'success' ? '✓ SAVED' : 'SAVE & CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
