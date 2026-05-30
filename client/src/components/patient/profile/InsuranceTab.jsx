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

      <div className="flex bg-swiss-gray-100 border-2 border-black p-4 mt-2">
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center">
            <Info size={16} strokeWidth={1.5} className="text-black" />
          </div>
        </div>
        <div className="text-ui-sm text-gray-700 flex items-center">
          This information is shared with your physiotherapist before your appointment. It is never shared publicly.
        </div>
      </div>

      <div className="border-t-2 border-black pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-3 border-2 border-[#0D7377] text-[#0D7377] font-bold text-ui-sm uppercase tracking-widest bg-white">
            ✓ INSURANCE SAVED
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={saveStatus === 'error' ? 'border-[#FF3000] text-[#FF3000]' : ''}
          >
            {isSaving ? 'SAVING...' : saveStatus === 'error' ? 'SAVE FAILED — TRY AGAIN' : 'SAVE INSURANCE →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InsuranceTab;
