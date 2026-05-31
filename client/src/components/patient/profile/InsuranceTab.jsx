import React, { useState } from 'react';
import { Info } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const InsuranceTab = ({ profile, onSaveSuccess, onUnsavedChanges }) => {
  const [formData, setFormData] = useState({
    provider: profile?.insurance?.provider || '',
    policyNumber: profile?.insurance?.policyNumber || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({ insurance: formData });
      setSaveStatus('success');
      onUnsavedChanges(false);
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
      <div>
        <Input 
          label="INSURANCE PROVIDER" 
          value={formData.provider} 
          onChange={(e) => handleChange('provider', e.target.value)} 
        />
      </div>
      <div>
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

      <div className="border-t border-neutral-200 pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            ✓ Insurance Saved
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
          >
            {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Insurance →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InsuranceTab;
