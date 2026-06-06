import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const InsuranceTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
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
        }
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

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="INSURANCE PROVIDER" 
          value={formData.provider} 
          onChange={(e) => handleChange('provider', e.target.value)} 
        />
        <Input 
          label="POLICY NUMBER" 
          value={formData.policyNumber} 
          onChange={(e) => handleChange('policyNumber', e.target.value)} 
        />
      </div>

      <div className="flex bg-neutral-50 border border-neutral-200 p-4 rounded-lg shadow-sm mt-2">
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 border border-neutral-200 bg-white flex items-center justify-center rounded-full shadow-sm">
            <Info size={16} strokeWidth={1.5} className="text-neutral-500" />
          </div>
        </div>
        <div className="text-ui-sm text-neutral-500 flex items-center font-medium">
          This information is shared with your physiotherapist before your appointment. It is never shared publicly.
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 mt-4 flex items-center gap-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            <Check size={14} /> Insurance Saved
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
            >
              {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Insurance →'}
            </Button>
            <Button
              variant="ghost"
              onClick={onSaveDraft}
              className="h-10 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold uppercase tracking-widest"
            >
              Save Draft
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InsuranceTab;
