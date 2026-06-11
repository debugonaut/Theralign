import React, { useState } from 'react';
import { Shield, Info, Check } from 'lucide-react';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const InsuranceTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, completedSteps, onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const { showToast } = useToast();

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isDirty =
    formData.provider !== (profile?.insurance?.provider || '') ||
    formData.policyNumber !== (profile?.insurance?.policyNumber || '');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        insurance: {
          provider: formData.provider,
          policyNumber: formData.policyNumber
        },
        completedSteps: Array.from(new Set([...completedSteps, 4])) // Step 5 is index 4
      };
      const updatedProfile = await patientProfileService.updateProfile(payload);
      setSaveStatus('success');
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save insurance info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftClick = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  return (
    <div className="flex flex-col">
      {/* Title block */}
      <div className="flex justify-between items-center mb-2 mt-4 font-sans">
        <div>
          <span className="text-[10px] font-bold text-[#F4845F] tracking-[0.1em] uppercase block mb-1">
            STEP 5 OF 5
          </span>
          <h2 className="text-[22px] font-bold text-[#1C2B3A] tracking-[-0.02em] leading-tight">
            Insurance Details
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
        Add your insurance coverage details if you would like to use them for billing.
      </p>
      <div className="h-[1px] bg-[#EEF2F6] w-full mb-6" />

      {/* Card Wrapper */}
      <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm mb-24 font-sans">
        {/* Card Header */}
        <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-[#0B4F6C]">
              <Shield size={16} />
              <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                Insurance Details
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7C93] mt-0.5">
              Provider and policy reference details
            </p>
          </div>
          <div className="bg-[#F7F9FB] text-[#A8B8C8] rounded-[4px] px-[10px] py-[3px] text-[12px] font-bold font-sans">
            OPTIONAL
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
              Insurance Provider
            </label>
            <input
              type="text"
              placeholder="e.g. Aetna, Blue Cross"
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
              Policy Number
            </label>
            <input
              type="text"
              placeholder="e.g. POL-123456789"
              value={formData.policyNumber}
              onChange={(e) => handleChange('policyNumber', e.target.value)}
              className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
            />
          </div>

          {/* Alert strip */}
          <div className="flex bg-[#E8F4F8] border-l-4 border-[#0B4F6C] p-4 rounded-[6px] gap-3">
            <Info size={16} className="text-[#0B4F6C] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#0B4F6C] font-normal leading-relaxed">
              This information is shared with your physiotherapist before your appointment. It is never shared publicly.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t border-[#EEF2F6] px-6 py-4 flex items-center justify-between z-10 font-sans shadow-md">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200"
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
            {isSaving ? 'SAVING...' : saveStatus === 'success' ? '✓ SAVED' : 'SAVE & COMPLETE →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceTab;
